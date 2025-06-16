import { useEffect, useState } from "react";
import { useParams } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import Navbar from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  FileText, 
  MessageSquare, 
  Home,
  Clock,
  DollarSign,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  Building
} from "lucide-react";

export default function ClientProfile() {
  const { clientId } = useParams<{ clientId: string }>();
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  // Fetch client data
  const { data: client = {}, isLoading: clientLoading } = useQuery({
    queryKey: [`/api/clients/${clientId}`],
    enabled: isAuthenticated && !!clientId,
  });

  // Fetch client showings
  const { data: showings = [], isLoading: showingsLoading } = useQuery({
    queryKey: [`/api/showings/client/${clientId}`],
    enabled: isAuthenticated && !!clientId,
  });

  // Fetch client contracts
  const { data: contracts = [], isLoading: contractsLoading } = useQuery({
    queryKey: [`/api/contracts/client/${clientId}`],
    enabled: isAuthenticated && !!clientId,
  });

  // Fetch SMS history for communications
  const { data: smsHistory = [], isLoading: smsLoading } = useQuery({
    queryKey: [`/api/sms/history/${clientId}`],
    enabled: isAuthenticated && !!clientId,
  });

  // Fetch property visits
  const { data: propertyVisits = [], isLoading: visitsLoading } = useQuery({
    queryKey: [`/api/property-visits/client/${clientId}`],
    enabled: isAuthenticated && !!clientId,
  });

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation("/");
    }
  }, [isLoading, isAuthenticated, setLocation]);

  if (isLoading || clientLoading) {
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

  if (!isAuthenticated || !client) {
    return null;
  }

  const clientData = client as any;
  const showingsData = showings as any[];
  const contractsData = contracts as any[];
  const propertyVisitsData = propertyVisits as any[];
  const smsHistoryData = smsHistory as any[];

  const clientInitials = clientData?.fullName
    ?.split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase() || "?";

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>;
      case 'completed':
        return <Badge variant="default" className="bg-blue-100 text-blue-800">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      case 'scheduled':
        return <Badge variant="outline">Scheduled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'high':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'medium':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'low':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => setLocation("/clients")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Clients
          </Button>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                <div className="text-center">
                  <Avatar className="h-24 w-24 mx-auto mb-4">
                    <AvatarFallback className="bg-blue-100 text-primary text-2xl font-bold">
                      {clientInitials}
                    </AvatarFallback>
                  </Avatar>
                  <h1 className="text-3xl font-bold text-gray-900">{clientData?.fullName}</h1>
                </div>
                
                <div className="flex-1 space-y-3">
                  <div className="flex items-center text-gray-600">
                    <Mail className="h-5 w-5 mr-3" />
                    <span>{clientData?.email}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Phone className="h-5 w-5 mr-3" />
                    <span>{clientData?.phone}</span>
                  </div>
                  {clientData?.address && (
                    <div className="flex items-center text-gray-600">
                      <MapPin className="h-5 w-5 mr-3" />
                      <span>{clientData.address}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <Badge variant={clientData?.isConverted ? "default" : "secondary"}>
                      {clientData?.isConverted ? "Converted" : "Active Prospect"}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      Client since {new Date(clientData?.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="showings">
              Showings ({showingsData?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="contracts">
              Contracts ({contractsData?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="communications">
              Messages ({smsHistoryData?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="properties">
              Properties ({propertyVisitsData?.length || 0})
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Contracts</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{contractsData?.filter((c: any) => c.status === 'active').length || 0}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Showings</CardTitle>
                  <Home className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{showingsData?.length || 0}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Properties Visited</CardTitle>
                  <Building className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{propertyVisitsData?.length || 0}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Messages Sent</CardTitle>
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{smsHistoryData?.length || 0}</div>
                </CardContent>
              </Card>
            </div>

            {/* Client Details */}
            <Card>
              <CardHeader>
                <CardTitle>Client Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Full Name</label>
                    <p className="text-lg">{clientData?.fullName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Email</label>
                    <p className="text-lg">{clientData?.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Phone</label>
                    <p className="text-lg">{clientData?.phone}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Status</label>
                    <p className="text-lg">{clientData?.isConverted ? "Converted Client" : "Active Prospect"}</p>
                  </div>
                  {clientData?.address && (
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-gray-500">Address</label>
                      <p className="text-lg">{clientData.address}</p>
                    </div>
                  )}
                  {clientData?.notes && (
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-gray-500">Notes</label>
                      <p className="text-lg">{clientData.notes}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Showings Tab */}
          <TabsContent value="showings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Property Showings</CardTitle>
              </CardHeader>
              <CardContent>
                {showingsLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : showingsData?.length > 0 ? (
                  <div className="space-y-4">
                    {showingsData.map((showing: any) => (
                      <div key={showing.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold">{showing.property?.address || 'Property Address'}</h3>
                          {getStatusBadge(showing.status)}
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2" />
                            {formatDate(showing.scheduledDate)}
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-2" />
                            {showing.showingType}
                          </div>
                        </div>
                        {showing.agentNotes && (
                          <p className="mt-2 text-sm text-gray-700">{showing.agentNotes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-8">No showings scheduled yet.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Contracts Tab */}
          <TabsContent value="contracts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Representation Agreements</CardTitle>
              </CardHeader>
              <CardContent>
                {contractsLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : contractsData?.length > 0 ? (
                  <div className="space-y-4">
                    {contractsData.map((contract: any) => (
                      <div key={contract.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold">{contract.representationType}</h3>
                          {getStatusBadge(contract.status)}
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <div>
                            <strong>Property:</strong> {contract.propertyAddress || 'General Representation'}
                          </div>
                          <div>
                            <strong>Start Date:</strong> {new Date(contract.startDate).toLocaleDateString()}
                          </div>
                          <div>
                            <strong>End Date:</strong> {new Date(contract.endDate).toLocaleDateString()}
                          </div>
                          {contract.contractFileName && (
                            <div>
                              <strong>File:</strong> {contract.contractFileName}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-8">No contracts on file.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Communications Tab */}
          <TabsContent value="communications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>SMS Communications</CardTitle>
              </CardHeader>
              <CardContent>
                {smsLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : smsHistoryData?.length > 0 ? (
                  <div className="space-y-4">
                    {smsHistoryData.map((message: any, index: number) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <MessageSquare className="h-4 w-4 mr-2" />
                            <span className="font-medium">
                              {message.direction === 'outbound' ? 'To' : 'From'} {clientData?.fullName}
                            </span>
                          </div>
                          <span className="text-sm text-gray-500">
                            {formatDate(message.createdAt)}
                          </span>
                        </div>
                        <p className="text-gray-700">{message.messageBody}</p>
                        {message.status && (
                          <div className="mt-2">
                            {getStatusBadge(message.status)}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-8">No messages yet.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Properties Tab */}
          <TabsContent value="properties" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Property Visits</CardTitle>
              </CardHeader>
              <CardContent>
                {visitsLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : propertyVisitsData?.length > 0 ? (
                  <div className="space-y-4">
                    {propertyVisitsData.map((visit: any) => (
                      <div key={visit.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold">{visit.property?.address || 'Property Address'}</h3>
                          <div className="flex items-center gap-2">
                            {getSeverityIcon(visit.riskLevel)}
                            {getStatusBadge(visit.visitType)}
                          </div>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2" />
                            {formatDate(visit.visitDate)}
                          </div>
                          <div>
                            <strong>Duration:</strong> {visit.duration || 'N/A'}
                          </div>
                          <div>
                            <strong>Agent Present:</strong> {visit.agentPresent ? 'Yes' : 'No'}
                          </div>
                          <div>
                            <strong>Scheduled:</strong> {visit.wasScheduled ? 'Yes' : 'No'}
                          </div>
                        </div>
                        {visit.notes && (
                          <p className="mt-2 text-sm text-gray-700">{visit.notes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-8">No property visits recorded.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}