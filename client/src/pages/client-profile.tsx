import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import Navbar from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  FileText, 
  MessageSquare, 
  Home,
  DollarSign,
  Clock,
  AlertCircle,
  CheckCircle,
  Edit3,
  Shield,
  TrendingUp
} from "lucide-react";

export default function ClientProfile() {
  const params = useParams();
  const clientId = params.clientId;
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  // Fetch client data
  const { data: client, isLoading: clientLoading } = useQuery({
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

  if (isLoading || clientLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-32 w-32 border-4 border-gray-200"></div>
            <div className="animate-spin rounded-full h-32 w-32 border-4 border-primary border-t-transparent absolute top-0"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <User className="h-8 w-8 text-primary animate-pulse" />
            </div>
          </div>
          <p className="mt-6 text-gray-700 font-medium">Loading client profile...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !client) {
    return null;
  }

  const clientInitials = client.fullName
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
    const statusColors = {
      'scheduled': 'bg-blue-100 text-blue-800',
      'completed': 'bg-green-100 text-green-800',
      'missed': 'bg-red-100 text-red-800',
      'cancelled': 'bg-gray-100 text-gray-800',
      'active': 'bg-green-100 text-green-800',
      'expired': 'bg-red-100 text-red-800',
      'pending': 'bg-yellow-100 text-yellow-800'
    };
    return statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Back Button */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => setLocation("/clients")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Clients
          </Button>
          
          <div className="flex items-center space-x-6">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="bg-blue-100 text-primary text-2xl font-semibold">
                {clientInitials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">{client.fullName}</h1>
              <div className="flex items-center space-x-6 mt-2">
                <div className="flex items-center text-gray-600">
                  <Mail className="h-4 w-4 mr-2" />
                  {client.email}
                </div>
                <div className="flex items-center text-gray-600">
                  <Phone className="h-4 w-4 mr-2" />
                  {client.phone}
                </div>
                {client.address && (
                  <div className="flex items-center text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    {client.address}
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-3 mt-3">
                <Badge className={client.isConverted ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}>
                  {client.isConverted ? 'Converted Client' : 'Active Prospect'}
                </Badge>
                <span className="text-sm text-gray-500">
                  Client since {formatDate(client.createdAt)}
                </span>
              </div>
            </div>
            <Button>
              <Edit3 className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="showings">Showings</TabsTrigger>
            <TabsTrigger value="contracts">Contracts</TabsTrigger>
            <TabsTrigger value="communications">Communications</TabsTrigger>
            <TabsTrigger value="properties">Properties</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Client Information */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Client Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Full Name</label>
                      <p className="text-gray-900">{client.fullName}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Email</label>
                      <p className="text-gray-900">{client.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Phone</label>
                      <p className="text-gray-900">{client.phone}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Status</label>
                      <p className="text-gray-900">{client.isConverted ? 'Converted' : 'Prospect'}</p>
                    </div>
                    {client.address && (
                      <div className="col-span-2">
                        <label className="text-sm font-medium text-gray-500">Address</label>
                        <p className="text-gray-900">{client.address}</p>
                      </div>
                    )}
                    {client.notes && (
                      <div className="col-span-2">
                        <label className="text-sm font-medium text-gray-500">Notes</label>
                        <p className="text-gray-900">{client.notes}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Activity Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Total Showings</span>
                      <span className="font-semibold">{showings.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Active Contracts</span>
                      <span className="font-semibold">{contracts.filter((c: any) => c.status === 'active').length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Properties Visited</span>
                      <span className="font-semibold">{propertyVisits.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Messages Sent</span>
                      <span className="font-semibold">{smsHistory.length}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <Shield className="h-4 w-4 mr-2" />
                      Commission Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        ${contracts.reduce((sum: number, contract: any) => sum + (contract.estimatedCommission || 0), 0).toLocaleString()}
                      </div>
                      <p className="text-sm text-gray-600">Protected Commission</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Showings Tab */}
          <TabsContent value="showings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Showing History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {showingsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading showings...</p>
                  </div>
                ) : showings.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Showings Yet</h3>
                    <p className="text-gray-600">No property showings have been scheduled for this client.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {showings.map((showing: any) => (
                      <div key={showing.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold text-gray-900">{showing.propertyAddress}</h4>
                            <p className="text-sm text-gray-600">{formatDate(showing.scheduledDate)}</p>
                            {showing.notes && (
                              <p className="text-sm text-gray-600 mt-1">{showing.notes}</p>
                            )}
                          </div>
                          <Badge className={getStatusBadge(showing.status)}>
                            {showing.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Contracts Tab */}
          <TabsContent value="contracts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Representation Agreements
                </CardTitle>
              </CardHeader>
              <CardContent>
                {contractsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading contracts...</p>
                  </div>
                ) : contracts.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Contracts</h3>
                    <p className="text-gray-600">No representation agreements have been created for this client.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {contracts.map((contract: any) => (
                      <div key={contract.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold text-gray-900">{contract.contractType} Agreement</h4>
                            <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                              <span>Start: {formatDate(contract.startDate)}</span>
                              <span>End: {formatDate(contract.endDate)}</span>
                              {contract.commissionRate && (
                                <span>Commission: {contract.commissionRate}%</span>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge className={getStatusBadge(contract.status)}>
                              {contract.status}
                            </Badge>
                            {contract.estimatedCommission && (
                              <p className="text-sm font-semibold text-green-600 mt-1">
                                ${contract.estimatedCommission.toLocaleString()}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Communications Tab */}
          <TabsContent value="communications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2" />
                  Communication History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {smsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading messages...</p>
                  </div>
                ) : smsHistory.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Messages</h3>
                    <p className="text-gray-600">No SMS messages have been exchanged with this client.</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {smsHistory.map((message: any) => (
                      <div key={message.id} className={`p-3 rounded-lg ${message.direction === 'outbound' ? 'bg-blue-50 ml-8' : 'bg-gray-50 mr-8'}`}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-gray-500">
                            {message.direction === 'outbound' ? 'You' : client.fullName}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatDate(message.sentAt)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-900">{message.message}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Properties Tab */}
          <TabsContent value="properties" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Home className="h-5 w-5 mr-2" />
                  Property Visits
                </CardTitle>
              </CardHeader>
              <CardContent>
                {visitsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading property visits...</p>
                  </div>
                ) : propertyVisits.length === 0 ? (
                  <div className="text-center py-8">
                    <Home className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Property Visits</h3>
                    <p className="text-gray-600">No properties have been visited with this client yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {propertyVisits.map((visit: any) => (
                      <div key={visit.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold text-gray-900">{visit.propertyAddress}</h4>
                            <p className="text-sm text-gray-600">{formatDate(visit.visitDate)}</p>
                            {visit.notes && (
                              <p className="text-sm text-gray-600 mt-1">{visit.notes}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <Badge className={getStatusBadge(visit.riskLevel)}>
                              {visit.riskLevel} Risk
                            </Badge>
                            {visit.followUpRequired && (
                              <p className="text-sm text-orange-600 mt-1">Follow-up Required</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}