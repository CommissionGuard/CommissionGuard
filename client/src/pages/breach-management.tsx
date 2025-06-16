import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertTriangle,
  Eye,
  Check,
  X,
  Clock,
  DollarSign,
  Users,
  FileText,
  Calendar,
  MapPin,
  Phone,
  Mail,
  ExternalLink
} from "lucide-react";

interface PotentialBreach {
  id: number;
  agentId: string;
  clientId: number;
  contractId: number;
  propertyId?: number;
  breachType: string;
  detectionMethod: string;
  detectionDate: string;
  breachDate?: string;
  evidenceData: any;
  riskLevel: string;
  estimatedCommissionLoss: number;
  status: string;
  adminReviewerId?: string;
  adminNotes?: string;
  confirmationDate?: string;
  agentNotifiedDate?: string;
  resolutionDate?: string;
  resolutionOutcome?: string;
  description: string;
  autoDetectionScore: number;
  requiresLegalAction: boolean;
  createdAt: string;
  updatedAt: string;
  agent: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    role: string;
  };
  client: {
    id: number;
    fullName: string;
    email: string;
    phone: string;
  };
  contract: {
    id: number;
    representationType: string;
    propertyAddress: string;
    startDate: string;
    endDate: string;
    status: string;
  };
}

interface BreachStats {
  totalBreaches: number;
  pendingBreaches: number;
  confirmedBreaches: number;
  highRiskBreaches: number;
  totalCommissionLoss: number;
}

export default function BreachManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedBreach, setSelectedBreach] = useState<PotentialBreach | null>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
  const [requiresLegalAction, setRequiresLegalAction] = useState(false);

  const { data: breaches = [], isLoading: breachesLoading } = useQuery({
    queryKey: ["/api/admin/potential-breaches"],
    queryFn: () => apiRequest("GET", "/api/admin/potential-breaches"),
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/admin/breach-stats"],
    queryFn: () => apiRequest("GET", "/api/admin/breach-stats"),
  });

  const confirmBreachMutation = useMutation({
    mutationFn: async ({ id, adminNotes, requiresLegalAction }: { 
      id: number; 
      adminNotes: string; 
      requiresLegalAction: boolean; 
    }) => {
      return apiRequest("POST", `/api/admin/potential-breaches/${id}/confirm`, {
        adminNotes,
        requiresLegalAction
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/potential-breaches"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/breach-stats"] });
      setReviewDialogOpen(false);
      setSelectedBreach(null);
      setAdminNotes("");
      setRequiresLegalAction(false);
      toast({
        title: "Breach Confirmed",
        description: "The potential breach has been confirmed and the agent has been notified.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to confirm breach",
        variant: "destructive",
      });
    },
  });

  const dismissBreachMutation = useMutation({
    mutationFn: async ({ id, adminNotes }: { id: number; adminNotes: string }) => {
      return apiRequest("POST", `/api/admin/potential-breaches/${id}/dismiss`, {
        adminNotes
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/potential-breaches"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/breach-stats"] });
      setReviewDialogOpen(false);
      setSelectedBreach(null);
      setAdminNotes("");
      toast({
        title: "Breach Dismissed",
        description: "The potential breach has been dismissed.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to dismiss breach",
        variant: "destructive",
      });
    },
  });

  const handleConfirmBreach = () => {
    if (!selectedBreach) return;
    confirmBreachMutation.mutate({
      id: selectedBreach.id,
      adminNotes,
      requiresLegalAction
    });
  };

  const handleDismissBreach = () => {
    if (!selectedBreach) return;
    dismissBreachMutation.mutate({
      id: selectedBreach.id,
      adminNotes
    });
  };

  const getRiskBadgeColor = (risk: string) => {
    switch (risk) {
      case "high": return "destructive";
      case "medium": return "default";
      case "low": return "secondary";
      default: return "outline";
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "pending": return "outline";
      case "investigating": return "default";
      case "confirmed": return "destructive";
      case "dismissed": return "secondary";
      default: return "outline";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderEvidenceData = (evidenceData: any) => {
    if (!evidenceData) return null;

    return (
      <div className="space-y-4">
        {evidenceData.source && (
          <div>
            <strong>Source:</strong> {evidenceData.source}
          </div>
        )}
        
        {evidenceData.property_sale && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Property Sale Details</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><strong>Address:</strong> {evidenceData.property_sale.address}</div>
              <div><strong>Sale Price:</strong> {formatCurrency(evidenceData.property_sale.sale_price)}</div>
              <div><strong>Buyer:</strong> {evidenceData.property_sale.buyer_name}</div>
              <div><strong>Closing Date:</strong> {evidenceData.property_sale.closing_date}</div>
              <div><strong>Listing Agent:</strong> {evidenceData.property_sale.listing_agent}</div>
            </div>
          </div>
        )}

        {evidenceData.contract_violation && (
          <div className="bg-red-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Contract Violation</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><strong>Original Agent:</strong> {evidenceData.contract_violation.original_agent}</div>
              <div><strong>Contract Period:</strong> {evidenceData.contract_violation.contract_start} to {evidenceData.contract_violation.contract_end}</div>
            </div>
            {evidenceData.contract_violation.showing_evidence && (
              <div className="mt-2">
                <strong>Showing Evidence:</strong>
                <ul className="list-disc list-inside ml-4">
                  {evidenceData.contract_violation.showing_evidence.map((showing: any, index: number) => (
                    <li key={index}>
                      {showing.date} - {showing.property} 
                      {showing.gps_verified && <span className="text-green-600 ml-2">✓ GPS Verified</span>}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {evidenceData.violation_details && (
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Violation Details</h4>
            <div className="text-sm space-y-1">
              <div><strong>Violation Type:</strong> {evidenceData.violation_details.violation_type}</div>
              <div><strong>Competitor Agent:</strong> {evidenceData.violation_details.competitor_agent}</div>
              <div><strong>Evidence:</strong> {evidenceData.violation_details.evidence}</div>
              {evidenceData.violation_details.witness && (
                <div><strong>Witness:</strong> {evidenceData.violation_details.witness}</div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (breachesLoading || statsLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
            <div className="h-96 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  const pendingBreaches = breaches.filter((b: PotentialBreach) => b.status === 'pending');
  const investigatingBreaches = breaches.filter((b: PotentialBreach) => b.status === 'investigating');
  const confirmedBreaches = breaches.filter((b: PotentialBreach) => b.status === 'confirmed');
  const dismissedBreaches = breaches.filter((b: PotentialBreach) => b.status === 'dismissed');

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Breach Management Center</h1>
          <p className="text-gray-600">Monitor, review, and confirm potential commission breaches requiring human verification</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <AlertTriangle className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Breaches</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.totalBreaches || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending Review</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.pendingBreaches || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <X className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Confirmed</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.confirmedBreaches || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <AlertTriangle className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">High Risk</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.highRiskBreaches || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Commission Loss</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats?.totalCommissionLoss || 0)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Breach Management Tabs */}
        <Card>
          <CardHeader>
            <CardTitle>Potential Breach Task List</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="pending" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="pending">
                  Pending Review ({pendingBreaches.length})
                </TabsTrigger>
                <TabsTrigger value="investigating">
                  Investigating ({investigatingBreaches.length})
                </TabsTrigger>
                <TabsTrigger value="confirmed">
                  Confirmed ({confirmedBreaches.length})
                </TabsTrigger>
                <TabsTrigger value="dismissed">
                  Dismissed ({dismissedBreaches.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="pending" className="mt-6">
                <div className="space-y-4">
                  {pendingBreaches.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No pending breaches requiring review
                    </div>
                  ) : (
                    pendingBreaches.map((breach: PotentialBreach) => (
                      <div key={breach.id} className="border rounded-lg p-6 bg-white">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <Badge variant={getRiskBadgeColor(breach.riskLevel)}>
                                {breach.riskLevel.toUpperCase()} RISK
                              </Badge>
                              <Badge variant="outline">
                                {breach.breachType.replace('_', ' ').toUpperCase()}
                              </Badge>
                              <Badge variant="secondary">
                                AI Score: {breach.autoDetectionScore}%
                              </Badge>
                            </div>
                            
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                              {breach.description}
                            </h3>
                            
                            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                              <div className="flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                <span>Agent: {breach.agent.firstName} {breach.agent.lastName}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                <span>Client: {breach.client.fullName}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                <span>Property: {breach.contract.propertyAddress || 'N/A'}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <DollarSign className="h-4 w-4" />
                                <span>Est. Loss: {formatCurrency(breach.estimatedCommissionLoss)}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                <span>Detected: {formatDate(breach.detectionDate)}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                <span>Method: {breach.detectionMethod.replace('_', ' ')}</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                              <Phone className="h-4 w-4" />
                              <span>{breach.agent.phone}</span>
                              <Mail className="h-4 w-4 ml-4" />
                              <span>{breach.agent.email}</span>
                            </div>
                          </div>
                          
                          <div className="flex gap-2 ml-6">
                            <Dialog open={reviewDialogOpen && selectedBreach?.id === breach.id} onOpenChange={setReviewDialogOpen}>
                              <DialogTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => setSelectedBreach(breach)}
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  Review
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle>Review Potential Breach #{breach.id}</DialogTitle>
                                </DialogHeader>
                                
                                <div className="space-y-6">
                                  <div className="grid grid-cols-2 gap-6">
                                    <div>
                                      <h4 className="font-semibold mb-2">Breach Details</h4>
                                      <div className="space-y-2 text-sm">
                                        <div><strong>Type:</strong> {breach.breachType.replace('_', ' ')}</div>
                                        <div><strong>Risk Level:</strong> {breach.riskLevel}</div>
                                        <div><strong>Detection Method:</strong> {breach.detectionMethod.replace('_', ' ')}</div>
                                        <div><strong>AI Confidence:</strong> {breach.autoDetectionScore}%</div>
                                        <div><strong>Estimated Loss:</strong> {formatCurrency(breach.estimatedCommissionLoss)}</div>
                                        <div><strong>Detection Date:</strong> {formatDate(breach.detectionDate)}</div>
                                        {breach.breachDate && (
                                          <div><strong>Breach Date:</strong> {formatDate(breach.breachDate)}</div>
                                        )}
                                      </div>
                                    </div>
                                    
                                    <div>
                                      <h4 className="font-semibold mb-2">Contract Information</h4>
                                      <div className="space-y-2 text-sm">
                                        <div><strong>Type:</strong> {breach.contract.representationType}</div>
                                        <div><strong>Property:</strong> {breach.contract.propertyAddress || 'N/A'}</div>
                                        <div><strong>Start Date:</strong> {breach.contract.startDate}</div>
                                        <div><strong>End Date:</strong> {breach.contract.endDate}</div>
                                        <div><strong>Status:</strong> {breach.contract.status}</div>
                                      </div>
                                    </div>
                                  </div>

                                  <div>
                                    <h4 className="font-semibold mb-2">Evidence Data</h4>
                                    {renderEvidenceData(breach.evidenceData)}
                                  </div>

                                  <div>
                                    <h4 className="font-semibold mb-2">Description</h4>
                                    <p className="text-sm text-gray-700">{breach.description}</p>
                                  </div>

                                  <div className="space-y-4">
                                    <div>
                                      <Label htmlFor="adminNotes">Admin Review Notes</Label>
                                      <Textarea
                                        id="adminNotes"
                                        placeholder="Enter your review notes..."
                                        value={adminNotes}
                                        onChange={(e) => setAdminNotes(e.target.value)}
                                        className="mt-1"
                                        rows={4}
                                      />
                                    </div>

                                    <div className="flex items-center space-x-2">
                                      <Checkbox
                                        id="requiresLegalAction"
                                        checked={requiresLegalAction}
                                        onCheckedChange={(checked) => setRequiresLegalAction(checked as boolean)}
                                      />
                                      <Label htmlFor="requiresLegalAction">
                                        This breach requires legal action
                                      </Label>
                                    </div>
                                  </div>

                                  <div className="flex justify-end gap-4">
                                    <Button
                                      variant="outline"
                                      onClick={handleDismissBreach}
                                      disabled={dismissBreachMutation.isPending}
                                    >
                                      <X className="h-4 w-4 mr-2" />
                                      Dismiss
                                    </Button>
                                    <Button
                                      onClick={handleConfirmBreach}
                                      disabled={confirmBreachMutation.isPending}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      <Check className="h-4 w-4 mr-2" />
                                      Confirm Breach
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </TabsContent>

              <TabsContent value="investigating" className="mt-6">
                <div className="space-y-4">
                  {investigatingBreaches.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No breaches currently under investigation
                    </div>
                  ) : (
                    investigatingBreaches.map((breach: PotentialBreach) => (
                      <div key={breach.id} className="border rounded-lg p-6 bg-white">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <Badge variant={getStatusBadgeColor(breach.status)}>
                                {breach.status.toUpperCase()}
                              </Badge>
                              <Badge variant={getRiskBadgeColor(breach.riskLevel)}>
                                {breach.riskLevel.toUpperCase()} RISK
                              </Badge>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                              {breach.description}
                            </h3>
                            <p className="text-sm text-gray-600">
                              Agent: {breach.agent.firstName} {breach.agent.lastName} | 
                              Client: {breach.client.fullName} | 
                              Loss: {formatCurrency(breach.estimatedCommissionLoss)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </TabsContent>

              <TabsContent value="confirmed" className="mt-6">
                <div className="space-y-4">
                  {confirmedBreaches.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No confirmed breaches
                    </div>
                  ) : (
                    confirmedBreaches.map((breach: PotentialBreach) => (
                      <div key={breach.id} className="border rounded-lg p-6 bg-white border-red-200">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <Badge variant="destructive">CONFIRMED</Badge>
                              <Badge variant={getRiskBadgeColor(breach.riskLevel)}>
                                {breach.riskLevel.toUpperCase()} RISK
                              </Badge>
                              {breach.requiresLegalAction && (
                                <Badge variant="outline" className="border-red-300 text-red-700">
                                  LEGAL ACTION REQUIRED
                                </Badge>
                              )}
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                              {breach.description}
                            </h3>
                            <p className="text-sm text-gray-600 mb-2">
                              Agent: {breach.agent.firstName} {breach.agent.lastName} | 
                              Client: {breach.client.fullName} | 
                              Loss: {formatCurrency(breach.estimatedCommissionLoss)}
                            </p>
                            {breach.confirmationDate && (
                              <p className="text-xs text-gray-500">
                                Confirmed: {formatDate(breach.confirmationDate)}
                                {breach.agentNotifiedDate && ` | Agent Notified: ${formatDate(breach.agentNotifiedDate)}`}
                              </p>
                            )}
                            {breach.adminNotes && (
                              <div className="mt-3 p-3 bg-gray-50 rounded text-sm">
                                <strong>Admin Notes:</strong> {breach.adminNotes}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </TabsContent>

              <TabsContent value="dismissed" className="mt-6">
                <div className="space-y-4">
                  {dismissedBreaches.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No dismissed breaches
                    </div>
                  ) : (
                    dismissedBreaches.map((breach: PotentialBreach) => (
                      <div key={breach.id} className="border rounded-lg p-6 bg-white opacity-75">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <Badge variant="secondary">DISMISSED</Badge>
                              <Badge variant={getRiskBadgeColor(breach.riskLevel)}>
                                {breach.riskLevel.toUpperCase()} RISK
                              </Badge>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                              {breach.description}
                            </h3>
                            <p className="text-sm text-gray-600 mb-2">
                              Agent: {breach.agent.firstName} {breach.agent.lastName} | 
                              Client: {breach.client.fullName}
                            </p>
                            {breach.resolutionDate && (
                              <p className="text-xs text-gray-500">
                                Dismissed: {formatDate(breach.resolutionDate)}
                              </p>
                            )}
                            {breach.adminNotes && (
                              <div className="mt-3 p-3 bg-gray-50 rounded text-sm">
                                <strong>Admin Notes:</strong> {breach.adminNotes}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}