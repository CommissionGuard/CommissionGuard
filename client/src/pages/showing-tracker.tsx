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
  Zap
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

        <Tabs defaultValue="showings" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="showings">Scheduled Showings</TabsTrigger>
            <TabsTrigger value="visits">Property Visits</TabsTrigger>
            <TabsTrigger value="unauthorized">Unauthorized Visits</TabsTrigger>
            <TabsTrigger value="protection">Commission Protection</TabsTrigger>
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

          <TabsContent value="unauthorized" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  Unauthorized Visits
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!Array.isArray(unauthorizedVisits) || unauthorizedVisits.length === 0 ? (
                  <div className="text-center py-8">
                    <Shield className="h-12 w-12 text-green-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Unauthorized Visits Detected</h3>
                    <p className="text-gray-600">Your client relationships are secure.</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Discovery Date</TableHead>
                        <TableHead>Client</TableHead>
                        <TableHead>Property</TableHead>
                        <TableHead>Discovery Method</TableHead>
                        <TableHead>Risk Level</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {unauthorizedVisits.map((visit: PropertyVisit) => (
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
                              {visit.discoveryMethod.replace("-", " ").toUpperCase()}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className="bg-red-100 text-red-800">
                              {visit.riskLevel.toUpperCase()}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className="bg-yellow-100 text-yellow-800">
                              REQUIRES ACTION
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="protection" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Commission Protection Records
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!Array.isArray(commissionProtections) || commissionProtections.length === 0 ? (
                  <div className="text-center py-8">
                    <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Commission Protections Active</h3>
                    <p className="text-gray-600">Start scheduling showings to automatically establish commission protection.</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Protection Date</TableHead>
                        <TableHead>Client</TableHead>
                        <TableHead>Property</TableHead>
                        <TableHead>Protection Type</TableHead>
                        <TableHead>Evidence</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Expires</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {commissionProtections.map((protection: CommissionProtection) => (
                        <TableRow key={protection.id}>
                          <TableCell>
                            {format(new Date(protection.protectionDate), "MMM d, yyyy")}
                          </TableCell>
                          <TableCell>{protection.client?.fullName}</TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{protection.property?.address}</p>
                              <p className="text-sm text-gray-600">${protection.property?.price?.toLocaleString()}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {protection.protectionType.toUpperCase()}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className="bg-blue-100 text-blue-800">
                              {protection.evidenceType.replace("-", " ").toUpperCase()}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={protection.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                              {protection.status.toUpperCase()}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {protection.expirationDate ? 
                              format(new Date(protection.expirationDate), "MMM d, yyyy") : 
                              "Never"
                            }
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}