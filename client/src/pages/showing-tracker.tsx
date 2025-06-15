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
    email: string;
    phone: string;
  };
  property: {
    id: number;
    address: string;
    city: string;
    state: string;
    price: number;
    bedrooms: number;
    bathrooms: number;
    squareFeet: number;
  };
}

interface PropertyVisit {
  id: number;
  agentId: string;
  clientId: number;
  propertyId: number;
  visitDate: string;
  visitType: string;
  duration?: number;
  agentPresent: boolean;
  wasScheduled: boolean;
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
  const [newShowing, setNewShowing] = useState({
    clientId: "",
    propertyAddress: "",
    scheduledDate: "",
    showingType: "scheduled",
    notes: ""
  });

  // Fetch showings data
  const { data: showings = [], isLoading: showingsLoading } = useQuery({
    queryKey: ["/api/showings"],
    enabled: isAuthenticated,
  });

  // Fetch property visits data
  const { data: propertyVisits = [], isLoading: visitsLoading } = useQuery({
    queryKey: ["/api/property-visits"],
    enabled: isAuthenticated,
  });

  // Fetch unauthorized visits
  const { data: unauthorizedVisits = [], isLoading: unauthorizedLoading } = useQuery({
    queryKey: ["/api/property-visits/unauthorized"],
    enabled: isAuthenticated,
  });

  // Fetch commission protections
  const { data: commissionProtections = [], isLoading: protectionsLoading } = useQuery({
    queryKey: ["/api/commission-protection"],
    enabled: isAuthenticated,
  });

  // Fetch clients for dropdown
  const { data: clients = [] } = useQuery({
    queryKey: ["/api/clients"],
    enabled: isAuthenticated,
  });

  // Create new showing mutation
  const createShowingMutation = useMutation({
    mutationFn: async (showingData: any) => {
      return await apiRequest("POST", "/api/showings", showingData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/showings"] });
      toast({
        title: "Success",
        description: "Showing scheduled successfully with commission protection enabled",
      });
      setNewShowing({
        clientId: "",
        propertyAddress: "",
        scheduledDate: "",
        showingType: "scheduled",
        notes: ""
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "Session expired. Please log in again.",
          variant: "destructive",
        });
        return;
      }
      toast({
        title: "Error",
        description: "Failed to schedule showing. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Create commission protection mutation
  const createProtectionMutation = useMutation({
    mutationFn: async (protectionData: any) => {
      return await apiRequest("POST", "/api/commission-protection", protectionData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/commission-protection"] });
      toast({
        title: "Commission Protected",
        description: "Property showing now has commission protection in place",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-600">Loading showing tracker...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      scheduled: { color: "bg-blue-100 text-blue-800", icon: Calendar },
      "in-progress": { color: "bg-yellow-100 text-yellow-800", icon: Clock },
      completed: { color: "bg-green-100 text-green-800", icon: CheckCircle },
      cancelled: { color: "bg-red-100 text-red-800", icon: XCircle },
      "no-show": { color: "bg-gray-100 text-gray-800", icon: XCircle },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.scheduled;
    const Icon = config.icon;
    
    return (
      <Badge className={`${config.color} border`}>
        <Icon className="h-3 w-3 mr-1" />
        {status.replace("-", " ").toUpperCase()}
      </Badge>
    );
  };

  const getRiskLevelBadge = (riskLevel: string) => {
    const riskConfig = {
      low: "bg-green-100 text-green-800 border-green-200",
      medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
      high: "bg-red-100 text-red-800 border-red-200",
    };
    
    return (
      <Badge className={`${riskConfig[riskLevel as keyof typeof riskConfig]} border`}>
        {riskLevel.toUpperCase()} RISK
      </Badge>
    );
  };

  const handleScheduleShowing = () => {
    if (!newShowing.clientId || !newShowing.propertyAddress || !newShowing.scheduledDate) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields to schedule a showing.",
        variant: "destructive",
      });
      return;
    }

    // For demo purposes, create a mock property if address is provided
    const showingData = {
      clientId: parseInt(newShowing.clientId),
      propertyId: 1, // Mock property ID
      scheduledDate: new Date(newShowing.scheduledDate).toISOString(),
      showingType: newShowing.showingType,
      status: "scheduled",
      agentPresent: true,
      commissionProtected: true,
      agentNotes: newShowing.notes,
    };

    createShowingMutation.mutate(showingData);
  };

  const protectCommission = (clientId: number, propertyId: number, showingId: number) => {
    const protectionData = {
      clientId,
      propertyId,
      protectionType: "showing",
      protectionDate: new Date().toISOString(),
      expirationDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days
      evidenceType: "gps-tracking",
      evidenceData: { showingId },
      status: "active",
      notes: "Commission protection automatically established for scheduled showing",
    };

    createProtectionMutation.mutate(protectionData);
  };

  // Update showing status mutation
  const updateShowingMutation = useMutation({
    mutationFn: async ({ showingId, updates }: { showingId: number; updates: any }) => {
      return await apiRequest("PATCH", `/api/showings/${showingId}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/showings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/property-visits"] });
      toast({
        title: "Showing Updated",
        description: "Showing status has been updated successfully",
      });
    },
  });

  const trackRoute = (showing: any) => {
    // Mark showing as completed and create property visit
    const updates = {
      status: "completed",
      actualStartTime: new Date(showing.scheduledDate).toISOString(),
      actualEndTime: new Date(Date.now()).toISOString(),
    };

    updateShowingMutation.mutate({ showingId: showing.id, updates });

    // Create corresponding property visit
    const visitData = {
      clientId: showing.clientId,
      propertyId: showing.propertyId,
      visitDate: new Date(showing.scheduledDate).toISOString(),
      visitType: "completed-showing",
      duration: 60, // Default 60 minutes
      agentPresent: true,
      wasScheduled: true,
      showingId: showing.id,
      discoveryMethod: "agent-confirmed",
      riskLevel: "low",
      followUpRequired: false,
      notes: "Property showing completed and tracked by agent",
    };

    createPropertyVisitMutation.mutate(visitData);
  };

  const markMissed = (showing: any) => {
    // Mark showing as no-show
    const updates = {
      status: "no-show",
    };

    updateShowingMutation.mutate({ showingId: showing.id, updates });

    // Create property visit for missed showing
    const visitData = {
      clientId: showing.clientId,
      propertyId: showing.propertyId,
      visitDate: new Date(showing.scheduledDate).toISOString(),
      visitType: "missed-showing",
      duration: 0,
      agentPresent: false,
      wasScheduled: true,
      showingId: showing.id,
      discoveryMethod: "agent-reported",
      riskLevel: "high",
      followUpRequired: true,
      notes: "Client missed scheduled showing - follow-up required",
    };

    createPropertyVisitMutation.mutate(visitData);
  };

  // Create property visit mutation
  const createPropertyVisitMutation = useMutation({
    mutationFn: async (visitData: any) => {
      return await apiRequest("POST", "/api/property-visits", visitData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/property-visits"] });
      toast({
        title: "Visit Recorded",
        description: "Property visit has been recorded successfully",
      });
    },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Eye className="h-8 w-8 text-primary mr-3" />
                Property Showing Tracker
              </h1>
              <p className="text-gray-600 mt-1">
                Monitor client activities and protect your commissions with comprehensive showing tracking
              </p>
            </div>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-primary text-white hover:bg-blue-700">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Showing
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Schedule New Showing</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="client">Client</Label>
                    <Select value={newShowing.clientId} onValueChange={(value) => setNewShowing({...newShowing, clientId: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select client" />
                      </SelectTrigger>
                      <SelectContent>
                        {clients.map((client: any) => (
                          <SelectItem key={client.id} value={client.id.toString()}>
                            {client.fullName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="property">Property Address</Label>
                    <Input
                      id="property"
                      value={newShowing.propertyAddress}
                      onChange={(e) => setNewShowing({...newShowing, propertyAddress: e.target.value})}
                      placeholder="Enter property address"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="date">Scheduled Date & Time</Label>
                    <Input
                      id="date"
                      type="datetime-local"
                      value={newShowing.scheduledDate}
                      onChange={(e) => setNewShowing({...newShowing, scheduledDate: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="type">Showing Type</Label>
                    <Select value={newShowing.showingType} onValueChange={(value) => setNewShowing({...newShowing, showingType: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="scheduled">Scheduled Tour</SelectItem>
                        <SelectItem value="walk-in">Walk-in Showing</SelectItem>
                        <SelectItem value="drive-by">Drive-by Preview</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="notes">Agent Notes</Label>
                    <Textarea
                      id="notes"
                      value={newShowing.notes}
                      onChange={(e) => setNewShowing({...newShowing, notes: e.target.value})}
                      placeholder="Add any special instructions or notes..."
                    />
                  </div>
                  
                  <Button 
                    onClick={handleScheduleShowing}
                    disabled={createShowingMutation.isPending}
                    className="w-full"
                  >
                    {createShowingMutation.isPending ? "Scheduling..." : "Schedule Showing"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Tabs defaultValue="showings" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="showings">Scheduled Showings</TabsTrigger>
            <TabsTrigger value="tracking">Property Visits</TabsTrigger>
            <TabsTrigger value="unauthorized">Risk Monitoring</TabsTrigger>
            <TabsTrigger value="protection">Commission Protection</TabsTrigger>
          </TabsList>

          {/* Scheduled Showings */}
          <TabsContent value="showings">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 text-primary mr-2" />
                  Scheduled Property Showings
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
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Showings Scheduled</h3>
                    <p className="text-gray-600">Schedule your first property showing to start tracking client activity.</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date & Time</TableHead>
                        <TableHead>Client</TableHead>
                        <TableHead>Property</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Commission Protection</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {showings.map((showing: Showing) => (
                        <TableRow key={showing.id}>
                          <TableCell>
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 text-gray-400 mr-2" />
                              {format(new Date(showing.scheduledDate), "MMM d, yyyy 'at' h:mm a")}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{showing.client?.fullName}</p>
                              <p className="text-sm text-gray-600">{showing.client?.phone}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{showing.property?.address}</p>
                              <p className="text-sm text-gray-600">
                                {showing.property?.city}, {showing.property?.state} • ${showing.property?.price?.toLocaleString()}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(showing.status)}
                          </TableCell>
                          <TableCell>
                            {showing.commissionProtected ? (
                              <Badge className="bg-green-100 text-green-800 border-green-200">
                                <Shield className="h-3 w-3 mr-1" />
                                Protected
                              </Badge>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => protectCommission(showing.clientId, showing.propertyId, showing.id)}
                                className="text-red-600 border-red-200 hover:bg-red-50"
                              >
                                <Shield className="h-3 w-3 mr-1" />
                                Protect
                              </Button>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              {showing.status === "scheduled" && (
                                <>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => trackRoute(showing)}
                                    className="text-green-600 border-green-200 hover:bg-green-50"
                                  >
                                    <Route className="h-3 w-3 mr-1" />
                                    Track Route
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => markMissed(showing)}
                                    className="text-red-600 border-red-200 hover:bg-red-50"
                                  >
                                    <XCircle className="h-3 w-3 mr-1" />
                                    Mark Missed
                                  </Button>
                                </>
                              )}
                              {showing.status === "completed" && (
                                <Badge className="bg-green-100 text-green-800">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Completed
                                </Badge>
                              )}
                              {showing.status === "no-show" && (
                                <Badge className="bg-red-100 text-red-800">
                                  <XCircle className="h-3 w-3 mr-1" />
                                  Missed
                                </Badge>
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

          {/* Property Visits Tracking */}
          <TabsContent value="tracking">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 text-primary mr-2" />
                  All Property Visits
                </CardTitle>
              </CardHeader>
              <CardContent>
                {visitsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading visit history...</p>
                  </div>
                ) : propertyVisits.length === 0 ? (
                  <div className="text-center py-8">
                    <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Property Visits Recorded</h3>
                    <p className="text-gray-600">Visit tracking will appear here once clients view properties.</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Visit Date</TableHead>
                        <TableHead>Client</TableHead>
                        <TableHead>Property</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Agent Present</TableHead>
                        <TableHead>Risk Level</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {propertyVisits.map((visit: PropertyVisit) => (
                        <TableRow key={visit.id}>
                          <TableCell>
                            {format(new Date(visit.visitDate), "MMM d, yyyy 'at' h:mm a")}
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
                              {visit.visitType.replace("-", " ").toUpperCase()}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {visit.agentPresent ? (
                              <Badge className="bg-green-100 text-green-800">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Yes
                              </Badge>
                            ) : (
                              <Badge className="bg-red-100 text-red-800">
                                <XCircle className="h-3 w-3 mr-1" />
                                No
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {getRiskLevelBadge(visit.riskLevel)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Risk Monitoring */}
          <TabsContent value="unauthorized">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                  Unauthorized Property Visits
                </CardTitle>
              </CardHeader>
              <CardContent>
                {unauthorizedLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-gray-600">Scanning for unauthorized visits...</p>
                  </div>
                ) : unauthorizedVisits.length === 0 ? (
                  <div className="text-center py-8">
                    <Shield className="h-12 w-12 text-green-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Unauthorized Visits Detected</h3>
                    <p className="text-gray-600">All client property visits appear to be properly supervised.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-center">
                        <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                        <h3 className="font-medium text-red-900">Commission Protection Alert</h3>
                      </div>
                      <p className="text-red-700 text-sm mt-1">
                        {unauthorizedVisits.length} unauthorized property visit(s) detected. Review and take action to protect your commissions.
                      </p>
                    </div>
                    
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Visit Date</TableHead>
                          <TableHead>Client</TableHead>
                          <TableHead>Property</TableHead>
                          <TableHead>Discovery Method</TableHead>
                          <TableHead>Risk Level</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {unauthorizedVisits.map((visit: PropertyVisit) => (
                          <TableRow key={visit.id} className="bg-red-50">
                            <TableCell>
                              {format(new Date(visit.visitDate), "MMM d, yyyy 'at' h:mm a")}
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
                                {visit.discoveryMethod?.replace("-", " ").toUpperCase()}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {getRiskLevelBadge(visit.riskLevel)}
                            </TableCell>
                            <TableCell>
                              <Button
                                size="sm"
                                onClick={() => protectCommission(visit.clientId, visit.propertyId, 0)}
                                className="bg-red-600 text-white hover:bg-red-700"
                              >
                                <Shield className="h-3 w-3 mr-1" />
                                Protect Commission
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Commission Protection */}
          <TabsContent value="protection">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 text-green-500 mr-2" />
                  Commission Protection Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                {protectionsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading protection status...</p>
                  </div>
                ) : commissionProtections.length === 0 ? (
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