import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  MapPin, 
  Calendar, 
  Clock, 
  Eye, 
  AlertTriangle, 
  Shield, 
  Navigation,
  Users,
  Home,
  FileText,
  CheckCircle,
  XCircle,
  Route,
  Zap,
  RefreshCw,
  Download,
  Settings,
  RotateCcw,
  User,
  Phone,
  Mail
} from "lucide-react";
import { format } from "date-fns";

interface Showing {
  id: number;
  agentId: string;
  clientId: number;
  propertyId: number;
  scheduledDate: string;
  actualStartTime?: string;
  actualEndTime?: string;
  showingType: string;
  status: string;
  agentPresent: boolean;
  clientFeedback?: string;
  agentNotes?: string;
  interestLevel?: string;
  nextSteps?: string;
  commissionProtected: boolean;
  client: {
    id: number;
    fullName: string;
  };
  property: {
    id: number;
    address: string;
    city: string;
    price: number;
  };
}

interface PropertyVisit {
  id: number;
  agentId: string;
  clientId: number;
  propertyId: number;
  visitDate: string;
  visitType: string;
  duration?: string;
  agentPresent: boolean;
  wasScheduled: boolean;
  showingId?: number;
  discoveryMethod: string;
  riskLevel: string;
  followUpRequired: boolean;
  notes?: string;
  client: {
    id: number;
    fullName: string;
  };
  property: {
    id: number;
    address: string;
    city: string;
    price: number;
  };
}

interface CommissionProtection {
  id: number;
  agentId: string;
  clientId: number;
  propertyId: number;
  protectionType: string;
  protectionDate: string;
  expirationDate?: string;
  evidenceType: string;
  status: string;
  notes?: string;
  client: {
    id: number;
    fullName: string;
  };
  property: {
    id: number;
    address: string;
    city: string;
    price: number;
  };
}

export default function ShowingTracker() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();
  const [selectedShowing, setSelectedShowing] = useState<Showing | null>(null);
  const [showNewShowingDialog, setShowNewShowingDialog] = useState(false);
  const [newShowing, setNewShowing] = useState({
    clientId: 0,
    propertyId: 0,
    scheduledDate: '',
    showingType: 'in-person',
    agentNotes: ''
  });
  const [selectedAppointments, setSelectedAppointments] = useState<string[]>([]);

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  // Queries
  const { data: clients = [], isLoading: isLoadingClients } = useQuery({
    queryKey: ["/api/clients"],
    enabled: isAuthenticated,
  });

  const { data: showings = [], isLoading: isLoadingShowings, refetch: refetchShowings } = useQuery({
    queryKey: ["/api/showings"],
    enabled: isAuthenticated,
  });

  const { data: propertyVisits = [], isLoading: isLoadingVisits, refetch: refetchVisits } = useQuery({
    queryKey: ["/api/property-visits"],
    enabled: isAuthenticated,
  });

  const { data: unauthorizedVisits = [], isLoading: isLoadingUnauthorized, refetch: refetchUnauthorized } = useQuery({
    queryKey: ["/api/property-visits/unauthorized"],
    enabled: isAuthenticated,
  });

  const { data: commissionProtections = [], isLoading: isLoadingCommission, refetch: refetchCommission } = useQuery({
    queryKey: ["/api/commission-protection"],
    enabled: isAuthenticated,
  });

  // ShowingTime queries
  const { data: showingTimeStatus = {}, isLoading: isLoadingStatus, refetch: refetchStatus } = useQuery({
    queryKey: ["/api/integrations/showingtime/status"],
    enabled: isAuthenticated,
  });

  const { data: showingTimeAppointments = [], isLoading: isLoadingAppointments, refetch: refetchAppointments } = useQuery({
    queryKey: ["/api/integrations/showingtime/appointments"],
    enabled: isAuthenticated && showingTimeStatus?.connected,
  });

  // Mutations
  const createShowingMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("/api/showings", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Showing scheduled successfully",
      });
      setShowNewShowingDialog(false);
      setNewShowing({
        clientId: 0,
        propertyId: 0,
        scheduledDate: '',
        showingType: 'in-person',
        agentNotes: ''
      });
      refetchShowings();
    },
    onError: (error: any) => {
      if (isUnauthorizedError(error)) {
        window.location.href = "/api/login";
        return;
      }
      toast({
        title: "Error",
        description: error.message || "Failed to schedule showing",
        variant: "destructive",
      });
    },
  });

  const trackRouteMutation = useMutation({
    mutationFn: async (showingId: number) => {
      return apiRequest(`/api/showings/${showingId}/track-route`, {
        method: "POST",
        body: JSON.stringify({}),
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Route tracked and showing marked as completed",
      });
      refetchShowings();
      refetchVisits();
      refetchCommission();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to track route",
        variant: "destructive",
      });
    },
  });

  const markMissedMutation = useMutation({
    mutationFn: async (showingId: number) => {
      return apiRequest(`/api/showings/${showingId}/mark-missed`, {
        method: "POST",
        body: JSON.stringify({}),
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Showing marked as missed",
      });
      refetchShowings();
      refetchVisits();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to mark showing as missed",
        variant: "destructive",
      });
    },
  });

  // ShowingTime mutations
  const syncShowingTimeMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("/api/integrations/showingtime/sync", {
        method: "POST"
      });
    },
    onSuccess: (result: any) => {
      toast({
        title: "Sync Complete",
        description: `Imported ${result.imported || 0} new appointments`,
      });
      refetchShowings();
      refetchAppointments();
      refetchStatus();
    },
    onError: (error: any) => {
      toast({
        title: "Sync Failed",
        description: error.message || "Failed to sync ShowingTime appointments",
        variant: "destructive",
      });
    },
  });

  const importSelectedMutation = useMutation({
    mutationFn: async (appointmentIds: string[]) => {
      return apiRequest("/api/integrations/showingtime/import", {
        method: "POST",
        body: JSON.stringify({ appointmentIds })
      });
    },
    onSuccess: (result: any) => {
      toast({
        title: "Import Complete",
        description: `Imported ${result.imported || 0} appointments`,
      });
      setSelectedAppointments([]);
      refetchShowings();
      refetchAppointments();
    },
    onError: (error: any) => {
      toast({
        title: "Import Failed",
        description: error.message || "Failed to import selected appointments",
        variant: "destructive",
      });
    },
  });

  const handleCreateShowing = () => {
    if (!newShowing.clientId || !newShowing.propertyId || !newShowing.scheduledDate) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    createShowingMutation.mutate({
      clientId: Number(newShowing.clientId),
      propertyId: Number(newShowing.propertyId),
      scheduledDate: new Date(newShowing.scheduledDate).toISOString(),
      showingType: newShowing.showingType,
      agentNotes: newShowing.agentNotes,
      status: 'scheduled'
    });
  };

  const formatDateTime = (dateString: string) => {
    return format(new Date(dateString), "MMM d, yyyy 'at' h:mm a");
  };

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      scheduled: "bg-blue-100 text-blue-800",
      completed: "bg-green-100 text-green-800",
      missed: "bg-red-100 text-red-800",
      cancelled: "bg-gray-100 text-gray-800"
    };
    return statusStyles[status as keyof typeof statusStyles] || "bg-gray-100 text-gray-800";
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Showing Tracker</h1>
            <p className="text-gray-600 mt-2">Track property showings and protect your commissions</p>
          </div>
          <Dialog open={showNewShowingDialog} onOpenChange={setShowNewShowingDialog}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90">
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Showing
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Schedule New Showing</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="client">Client</Label>
                  <Select onValueChange={(value) => setNewShowing({...newShowing, clientId: Number(value)})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select client" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.isArray(clients) && clients.map((client: any) => (
                        <SelectItem key={client.id} value={client.id.toString()}>
                          {client.fullName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="property">Property ID</Label>
                  <Input
                    id="property"
                    type="number"
                    placeholder="Property ID"
                    value={newShowing.propertyId || ''}
                    onChange={(e) => setNewShowing({...newShowing, propertyId: Number(e.target.value)})}
                  />
                </div>
                <div>
                  <Label htmlFor="date">Date & Time</Label>
                  <Input
                    id="date"
                    type="datetime-local"
                    value={newShowing.scheduledDate}
                    onChange={(e) => setNewShowing({...newShowing, scheduledDate: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="type">Showing Type</Label>
                  <Select onValueChange={(value) => setNewShowing({...newShowing, showingType: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="in-person">In-Person</SelectItem>
                      <SelectItem value="virtual">Virtual</SelectItem>
                      <SelectItem value="drive-by">Drive-by</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Additional notes..."
                    value={newShowing.agentNotes}
                    onChange={(e) => setNewShowing({...newShowing, agentNotes: e.target.value})}
                  />
                </div>
                <Button 
                  onClick={handleCreateShowing} 
                  className="w-full"
                  disabled={createShowingMutation.isPending}
                >
                  {createShowingMutation.isPending ? "Scheduling..." : "Schedule Showing"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="showingtime" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="showingtime">ShowingTime Import</TabsTrigger>
            <TabsTrigger value="showings">Scheduled Showings</TabsTrigger>
            <TabsTrigger value="visits">Property Visits</TabsTrigger>
            <TabsTrigger value="openhouse">Open House Attendance</TabsTrigger>
          </TabsList>

          <TabsContent value="showings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Scheduled Showings
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!Array.isArray(showings) || showings.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Showings Scheduled</h3>
                    <p className="text-gray-600">Schedule your first showing to start tracking.</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date & Time</TableHead>
                        <TableHead>Client</TableHead>
                        <TableHead>Property</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {showings.map((showing: Showing) => (
                        <TableRow key={showing.id}>
                          <TableCell>
                            {formatDateTime(showing.scheduledDate)}
                          </TableCell>
                          <TableCell>{showing.client?.fullName}</TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{showing.property?.address}</p>
                              <p className="text-sm text-gray-600">${showing.property?.price?.toLocaleString()}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {showing.showingType.toUpperCase()}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusBadge(showing.status)}>
                              {showing.status.toUpperCase()}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              {showing.status === 'scheduled' && (
                                <>
                                  <Button 
                                    size="sm" 
                                    onClick={() => trackRouteMutation.mutate(showing.id)}
                                    disabled={trackRouteMutation.isPending}
                                  >
                                    <Route className="h-3 w-3 mr-1" />
                                    Track Route
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => markMissedMutation.mutate(showing.id)}
                                    disabled={markMissedMutation.isPending}
                                  >
                                    <XCircle className="h-3 w-3 mr-1" />
                                    Mark Missed
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="showingtime" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="h-5 w-5 mr-2" />
                  ShowingTime Integration
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!showingTimeStatus?.connected ? (
                  <div className="text-center py-8">
                    <AlertTriangle className="h-12 w-12 text-orange-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">ShowingTime Not Connected</h3>
                    <p className="text-gray-600 mb-4">
                      To import appointments from ShowingTime, you need API credentials.
                    </p>
                    <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-700 mb-4">
                      <p className="font-medium mb-2">How to get ShowingTime API access:</p>
                      <ol className="list-decimal list-inside space-y-1">
                        <li>Contact ShowingTime support at developer-support@showingtime.com</li>
                        <li>Request API access for Commission Guard integration</li>
                        <li>Provide your business details and real estate license</li>
                        <li>Add your API credentials to Replit environment variables</li>
                      </ol>
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={() => refetchStatus()}
                      disabled={isLoadingStatus}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Check Connection
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                      <div className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                        <div>
                          <p className="font-medium text-green-900">ShowingTime Connected</p>
                          <p className="text-sm text-green-700">
                            Agent: {showingTimeStatus?.agentEmail || 'Unknown'}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => syncShowingTimeMutation.mutate()}
                          disabled={syncShowingTimeMutation.isPending}
                          className="bg-primary hover:bg-primary/90"
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Sync All
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => refetchAppointments()}
                          disabled={isLoadingAppointments}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Refresh
                        </Button>
                      </div>
                    </div>

                    {isLoadingAppointments ? (
                      <div className="text-center py-8">
                        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
                        <p className="text-gray-600 mt-2">Loading ShowingTime appointments...</p>
                      </div>
                    ) : !Array.isArray(showingTimeAppointments) || showingTimeAppointments.length === 0 ? (
                      <div className="text-center py-8">
                        <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No ShowingTime Appointments</h3>
                        <p className="text-gray-600">No new appointments found in your ShowingTime account.</p>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-medium">Available Appointments</h3>
                          {selectedAppointments.length > 0 && (
                            <Button
                              onClick={() => importSelectedMutation.mutate(selectedAppointments)}
                              disabled={importSelectedMutation.isPending}
                              className="bg-primary hover:bg-primary/90"
                            >
                              Import Selected ({selectedAppointments.length})
                            </Button>
                          )}
                        </div>

                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-12">Select</TableHead>
                              <TableHead>Date & Time</TableHead>
                              <TableHead>Property</TableHead>
                              <TableHead>Client</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {showingTimeAppointments.map((appointment: any) => (
                              <TableRow key={appointment.id}>
                                <TableCell>
                                  <input
                                    type="checkbox"
                                    checked={selectedAppointments.includes(appointment.id)}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setSelectedAppointments([...selectedAppointments, appointment.id]);
                                      } else {
                                        setSelectedAppointments(selectedAppointments.filter(id => id !== appointment.id));
                                      }
                                    }}
                                    className="rounded border-gray-300"
                                  />
                                </TableCell>
                                <TableCell>
                                  {format(new Date(appointment.scheduledDateTime), "MMM d, yyyy h:mm a")}
                                </TableCell>
                                <TableCell>
                                  <div>
                                    <p className="font-medium">{appointment.propertyAddress}</p>
                                    <p className="text-sm text-gray-600">{appointment.appointmentType}</p>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div>
                                    <p className="font-medium">{appointment.clientName || 'Unknown Client'}</p>
                                    {appointment.clientPhone && (
                                      <p className="text-sm text-gray-600 flex items-center">
                                        <Phone className="h-3 w-3 mr-1" />
                                        {appointment.clientPhone}
                                      </p>
                                    )}
                                    {appointment.clientEmail && (
                                      <p className="text-sm text-gray-600 flex items-center">
                                        <Mail className="h-3 w-3 mr-1" />
                                        {appointment.clientEmail}
                                      </p>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge className={
                                    appointment.status === 'confirmed' ? "bg-green-100 text-green-800" :
                                    appointment.status === 'pending' ? "bg-yellow-100 text-yellow-800" :
                                    "bg-gray-100 text-gray-800"
                                  }>
                                    {appointment.status.toUpperCase()}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => importSelectedMutation.mutate([appointment.id])}
                                    disabled={importSelectedMutation.isPending}
                                  >
                                    Import
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="visits" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Eye className="h-5 w-5 mr-2" />
                  Property Visits
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!Array.isArray(propertyVisits) || propertyVisits.length === 0 ? (
                  <div className="text-center py-8">
                    <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Property Visits Recorded</h3>
                    <p className="text-gray-600">Complete showings to automatically track visits.</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Visit Date</TableHead>
                        <TableHead>Client</TableHead>
                        <TableHead>Property</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Risk Level</TableHead>
                        <TableHead>Follow-up</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {propertyVisits.map((visit: PropertyVisit) => (
                        <TableRow key={visit.id}>
                          <TableCell>
                            {format(new Date(visit.visitDate), "MMM d, yyyy")}
                          </TableCell>
                          <TableCell>{visit.client?.fullName}</TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{visit.property?.address}</p>
                              <p className="text-sm text-gray-600">${visit.property?.price?.toLocaleString()}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {visit.visitType.toUpperCase()}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={visit.riskLevel === "high" ? "bg-red-100 text-red-800" : visit.riskLevel === "medium" ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"}>
                              {visit.riskLevel.toUpperCase()}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {visit.followUpRequired ? (
                              <Badge className="bg-orange-100 text-orange-800">Required</Badge>
                            ) : (
                              <Badge className="bg-gray-100 text-gray-800">None</Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="openhouse" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <Home className="h-5 w-5 mr-2" />
                    Open House Attendance
                  </CardTitle>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button>
                        <Home className="h-4 w-4 mr-2" />
                        Add Open House Visit
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Add Open House Visit</DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="client" className="text-right">
                            Client
                          </Label>
                          <Select>
                            <SelectTrigger className="col-span-3">
                              <SelectValue placeholder="Select a client" />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.isArray(clients) && clients.map((client: any) => (
                                <SelectItem key={client.id} value={client.id.toString()}>
                                  {client.fullName}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="street" className="text-right">
                            Street Address
                          </Label>
                          <Input
                            id="street"
                            placeholder="123 Main Street"
                            className="col-span-3"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="city" className="text-right">
                            City
                          </Label>
                          <Input
                            id="city"
                            placeholder="City name"
                            className="col-span-3"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="state" className="text-right">
                            State
                          </Label>
                          <Input
                            id="state"
                            placeholder="NY"
                            className="col-span-3"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="zipcode" className="text-right">
                            Zip Code
                          </Label>
                          <Input
                            id="zipcode"
                            placeholder="12345"
                            className="col-span-3"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="date" className="text-right">
                            Visit Date
                          </Label>
                          <Input
                            id="date"
                            type="datetime-local"
                            className="col-span-3"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="notes" className="text-right">
                            Notes
                          </Label>
                          <Textarea
                            id="notes"
                            placeholder="Additional notes about the visit"
                            className="col-span-3"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline">Cancel</Button>
                        <Button type="submit">Add Visit</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Home className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Open Houses Tracked</h3>
                  <p className="text-gray-600">Track client attendance at open houses for commission protection evidence.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>


        </Tabs>
      </div>
    </div>
  );
}