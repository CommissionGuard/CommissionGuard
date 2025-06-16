import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import Navbar from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { 
  RefreshCw, 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Phone, 
  Mail, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Download,
  Settings,
  RotateCcw,
  ExternalLink
} from "lucide-react";

export default function ShowingTimeIntegration() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();
  const [selectedAppointments, setSelectedAppointments] = useState<string[]>([]);

  // Fetch ShowingTime integration status
  const { data: integrationStatus, isLoading: statusLoading, refetch: refetchStatus } = useQuery({
    queryKey: ["/api/integrations/showingtime/status"],
    enabled: isAuthenticated,
  });

  // Fetch ShowingTime appointments
  const { data: appointments = [], isLoading: appointmentsLoading, refetch: refetchAppointments } = useQuery({
    queryKey: ["/api/integrations/showingtime/appointments"],
    enabled: isAuthenticated && integrationStatus?.connected,
  });

  // Sync mutation
  const syncMutation = useMutation({
    mutationFn: () => apiRequest("/api/integrations/showingtime/sync", { method: "POST" }),
    onSuccess: (data) => {
      toast({
        title: "Sync Successful",
        description: data.message,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/integrations/showingtime/status"] });
      queryClient.invalidateQueries({ queryKey: ["/api/showings"] });
      refetchAppointments();
    },
    onError: (error: any) => {
      toast({
        title: "Sync Failed",
        description: error.message || "Failed to sync with ShowingTime",
        variant: "destructive",
      });
    },
  });

  // Import individual appointment mutation
  const importMutation = useMutation({
    mutationFn: (appointmentId: string) => 
      apiRequest(`/api/integrations/showingtime/import/${appointmentId}`, { method: "POST" }),
    onSuccess: (data, appointmentId) => {
      toast({
        title: "Import Successful",
        description: `Appointment imported successfully`,
      });
      setSelectedAppointments(prev => prev.filter(id => id !== appointmentId));
      queryClient.invalidateQueries({ queryKey: ["/api/showings"] });
      refetchStatus();
    },
    onError: (error: any) => {
      toast({
        title: "Import Failed",
        description: error.message || "Failed to import appointment",
        variant: "destructive",
      });
    },
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return <Badge variant="default" className="bg-green-100 text-green-800">Confirmed</Badge>;
      case 'pending':
        return <Badge variant="outline">Pending</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const toggleAppointmentSelection = (appointmentId: string) => {
    setSelectedAppointments(prev => 
      prev.includes(appointmentId) 
        ? prev.filter(id => id !== appointmentId)
        : [...prev, appointmentId]
    );
  };

  const handleBulkImport = async () => {
    for (const appointmentId of selectedAppointments) {
      await importMutation.mutateAsync(appointmentId);
    }
  };

  if (isLoading || statusLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">ShowingTime Integration</h1>
          <p className="text-gray-600">
            Connect your ShowingTime account to automatically import scheduled showings into Commission Guard
          </p>
        </div>

        {/* Integration Status Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Integration Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-500">Connection Status</Label>
                <div className="flex items-center gap-2">
                  {integrationStatus?.connected ? (
                    <>
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="text-green-700 font-medium">Connected</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-5 w-5 text-red-500" />
                      <span className="text-red-700 font-medium">Not Connected</span>
                    </>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-500">Agent Email</Label>
                <p className="text-gray-900">{integrationStatus?.agentEmail || 'Not configured'}</p>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-500">Total Imported</Label>
                <p className="text-2xl font-bold text-primary">{integrationStatus?.totalImported || 0}</p>
              </div>
            </div>

            {integrationStatus?.lastSyncDate && (
              <div className="mt-4 pt-4 border-t">
                <Label className="text-sm font-medium text-gray-500">Last Sync</Label>
                <p className="text-gray-700">
                  {new Date(integrationStatus.lastSyncDate).toLocaleString()}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Setup Instructions */}
        {!integrationStatus?.connected && (
          <Alert className="mb-8">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-medium">To connect ShowingTime:</p>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li>Contact your system administrator to configure the ShowingTime API key</li>
                  <li>Ensure your agent email matches your ShowingTime account email</li>
                  <li>Click "Test Connection" once configuration is complete</li>
                </ol>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 mb-8">
          <Button 
            onClick={() => refetchStatus()} 
            variant="outline"
            disabled={statusLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${statusLoading ? 'animate-spin' : ''}`} />
            Test Connection
          </Button>

          {integrationStatus?.connected && (
            <>
              <Button 
                onClick={() => syncMutation.mutate()}
                disabled={syncMutation.isPending}
              >
                <RotateCcw className={`h-4 w-4 mr-2 ${syncMutation.isPending ? 'animate-spin' : ''}`} />
                Sync All Appointments
              </Button>

              <Button 
                onClick={() => refetchAppointments()}
                variant="outline"
                disabled={appointmentsLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${appointmentsLoading ? 'animate-spin' : ''}`} />
                Refresh Appointments
              </Button>

              {selectedAppointments.length > 0 && (
                <Button 
                  onClick={handleBulkImport}
                  disabled={importMutation.isPending}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Import Selected ({selectedAppointments.length})
                </Button>
              )}
            </>
          )}
        </div>

        {/* Appointments List */}
        {integrationStatus?.connected && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                ShowingTime Appointments
                <Badge variant="outline">{appointments.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {appointmentsLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : appointments.length > 0 ? (
                <div className="space-y-4">
                  {appointments.map((appointment: any) => (
                    <div 
                      key={appointment.id} 
                      className={`border rounded-lg p-4 transition-colors ${
                        selectedAppointments.includes(appointment.id) 
                          ? 'bg-blue-50 border-blue-200' 
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={selectedAppointments.includes(appointment.id)}
                            onChange={() => toggleAppointmentSelection(appointment.id)}
                            className="mt-1"
                          />
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {appointment.propertyAddress}
                            </h3>
                            <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {formatDate(appointment.scheduledDateTime)}
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {appointment.duration} minutes
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {getStatusBadge(appointment.status)}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => importMutation.mutate(appointment.id)}
                            disabled={importMutation.isPending}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Import
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <Label className="text-gray-500">Agent</Label>
                          <p className="text-gray-900">{appointment.agentName}</p>
                        </div>
                        
                        {appointment.clientName && (
                          <div>
                            <Label className="text-gray-500">Client</Label>
                            <div className="text-gray-900">
                              <div className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {appointment.clientName}
                              </div>
                              {appointment.clientPhone && (
                                <div className="flex items-center gap-1 mt-1">
                                  <Phone className="h-3 w-3" />
                                  {appointment.clientPhone}
                                </div>
                              )}
                              {appointment.clientEmail && (
                                <div className="flex items-center gap-1 mt-1">
                                  <Mail className="h-3 w-3" />
                                  {appointment.clientEmail}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                        
                        <div>
                          <Label className="text-gray-500">Appointment Type</Label>
                          <p className="text-gray-900 capitalize">{appointment.appointmentType}</p>
                        </div>
                        
                        <div>
                          <Label className="text-gray-500">Confirmation #</Label>
                          <p className="text-gray-900">{appointment.confirmationNumber}</p>
                        </div>
                      </div>

                      {appointment.instructions && (
                        <div className="mt-3 pt-3 border-t">
                          <Label className="text-gray-500">Instructions</Label>
                          <p className="text-gray-700 text-sm">{appointment.instructions}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No appointments found in ShowingTime</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Check your ShowingTime account or try refreshing
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Help Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Need Help?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Common Issues</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Ensure your ShowingTime API key is properly configured</li>
                  <li>• Verify your agent email matches your ShowingTime account</li>
                  <li>• Check that you have upcoming appointments in ShowingTime</li>
                  <li>• Contact support if connection issues persist</li>
                </ul>
              </div>
              
              <Separator />
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">What gets imported?</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Scheduled appointment date and time</li>
                  <li>• Property address and details</li>
                  <li>• Client contact information (when available)</li>
                  <li>• Appointment instructions and notes</li>
                  <li>• Automatic commission protection activation</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}