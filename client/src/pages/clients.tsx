import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import Navbar from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, Mail, Phone, FileText, Calendar, Eye, DollarSign, Shield, TrendingUp, Edit3 } from "lucide-react";
import AddClientForm from "@/components/add-client-form";

export default function Clients() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [showContractsModal, setShowContractsModal] = useState(false);
  const [showAddClientForm, setShowAddClientForm] = useState(false);

  // Check URL parameters to auto-open Add Client form
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('action') === 'add') {
      setShowAddClientForm(true);
      // Clean up URL parameter
      window.history.replaceState({}, '', '/clients');
    }
  }, []);

  const { data: clients = [], isLoading: clientsLoading } = useQuery({
    queryKey: ["/api/clients"],
  });

  const { data: clientContracts = [], isLoading: contractsLoading } = useQuery({
    queryKey: [`/api/contracts/client/${selectedClientId}`],
    enabled: !!selectedClientId,
  });

  // Sample buyer pre-approval data to demonstrate commission protection values
  const [buyerPreApprovals, setBuyerPreApprovals] = useState([
    {
      id: 1,
      clientId: 1,
      lenderName: "Wells Fargo Home Mortgage",
      approvalAmount: 650000,
      interestRate: 7.25,
      approvalDate: new Date(2024, 11, 1),
      expirationDate: new Date(2025, 2, 1),
      loanType: "conventional",
      downPaymentPercent: 20,
      monthlyIncome: 12500,
      creditScore: 745,
      employmentStatus: "employed",
      verificationStatus: "verified",
      commissionRate: 2.5,
      estimatedCommission: 16250,
      protectedStatus: true,
      notes: "Strong buyer profile with excellent credit and stable employment"
    },
    {
      id: 2,
      clientId: 1,
      lenderName: "Chase Bank",
      approvalAmount: 700000,
      interestRate: 7.125,
      approvalDate: new Date(2024, 10, 15),
      expirationDate: new Date(2025, 1, 15),
      loanType: "conventional",
      downPaymentPercent: 25,
      monthlyIncome: 12500,
      creditScore: 745,
      employmentStatus: "employed",
      verificationStatus: "verified",
      commissionRate: 3.0,
      estimatedCommission: 21000,
      protectedStatus: true,
      notes: "Higher approval amount with better rate - preferred option (3% commission negotiated)"
    }
  ]);

  // Update estimated commission when rate changes
  const updateCommissionRate = (approvalId: number, newRate: number) => {
    setBuyerPreApprovals(prev => 
      prev.map(approval => 
        approval.id === approvalId 
          ? { 
              ...approval, 
              commissionRate: newRate, 
              estimatedCommission: Math.round(approval.approvalAmount * (newRate / 100))
            }
          : approval
      )
    );
  };

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
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
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Client Management</h1>
          <p className="text-gray-600 mt-1">Manage your client database and representation agreements</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Clients List */}
          <div className="lg:col-span-2">
            <Card className="bg-white rounded-xl shadow-sm border border-gray-200">
              <CardHeader className="border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-semibold text-gray-900">All Clients</CardTitle>
                  <Badge variant="secondary">{clients?.length || 0} clients</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {clientsLoading ? (
                  <div className="p-6">
                    <div className="animate-pulse space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="h-16 bg-gray-200 rounded"></div>
                      ))}
                    </div>
                  </div>
                ) : !clients || clients.length === 0 ? (
                  <div className="text-center py-12">
                    <UserPlus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Clients Found</h3>
                    <p className="text-gray-600">Add your first client to get started with commission protection.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {clients.map((client: any) => {
                      const clientInitials = client.fullName
                        ?.split(" ")
                        .map((n: string) => n[0])
                        .join("")
                        .toUpperCase() || "?";

                      return (
                        <div key={client.id} className="p-6 hover:bg-gray-50">
                          <div className="flex items-center space-x-4">
                            <Avatar className="h-12 w-12">
                              <AvatarFallback className="bg-blue-100 text-primary text-lg font-semibold">
                                {clientInitials}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <button 
                                className="text-lg font-semibold text-gray-900 hover:text-primary transition-colors cursor-pointer text-left"
                                onClick={() => setLocation(`/clients/${client.id}`)}
                              >
                                {client.fullName}
                              </button>
                              <div className="flex items-center space-x-4 mt-1">
                                <div className="flex items-center text-sm text-gray-600">
                                  <Mail className="h-4 w-4 mr-1" />
                                  {client.email}
                                </div>
                                <div className="flex items-center text-sm text-gray-600">
                                  <Phone className="h-4 w-4 mr-1" />
                                  {client.phone}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-500">
                                Added {new Date(client.createdAt).toLocaleDateString()}
                              </p>
                              <Button 
                                variant="link" 
                                className="text-primary text-sm p-0 mt-1"
                                onClick={() => {
                                  setSelectedClientId(client.id);
                                  setShowContractsModal(true);
                                }}
                              >
                                View Contracts
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Client Management Section */}
          <div>
            <Card>
              <CardHeader className="pb-4 text-center">
                <CardTitle className="flex items-center justify-center">
                  <UserPlus className="h-5 w-5 mr-2" />
                  Client Management
                </CardTitle>
                <Button onClick={() => setShowAddClientForm(true)} className="flex items-center gap-2 mx-auto w-fit">
                  <UserPlus className="h-4 w-4" />
                  Add New Client
                </Button>
              </CardHeader>
            </Card>
          </div>
        </div>

        {/* Commission Protection Summary */}
        <div className="mt-8">
          <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-900 flex items-center">
                <Shield className="h-6 w-6 text-green-600 mr-2" />
                Commission Protection Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    ${buyerPreApprovals.reduce((sum, approval) => sum + approval.estimatedCommission, 0).toLocaleString()}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Total Protected Commissions</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    ${buyerPreApprovals.reduce((sum, approval) => sum + approval.approvalAmount, 0).toLocaleString()}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Total Buyer Purchasing Power</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">
                    {buyerPreApprovals.filter(approval => approval.protectedStatus).length}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Active Pre-Approvals</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Buyer Pre-Approvals Section */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-900 flex items-center">
                <DollarSign className="h-6 w-6 text-green-600 mr-2" />
                Buyer Pre-Approvals & Commission Protection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="active" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="active">Active Pre-Approvals</TabsTrigger>
                  <TabsTrigger value="summary">Financial Summary</TabsTrigger>
                </TabsList>
                
                <TabsContent value="active" className="space-y-4">
                  {buyerPreApprovals.map((approval) => (
                    <div key={approval.id} className="border rounded-lg p-6 bg-white">
                      <div className="flex items-start justify-between">
                        <div className="space-y-3">
                          <div className="flex items-center space-x-4">
                            <h3 className="text-lg font-semibold text-gray-900">{approval.lenderName}</h3>
                            <Badge className={approval.verificationStatus === 'verified' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                              {approval.verificationStatus.toUpperCase()}
                            </Badge>
                            {approval.protectedStatus && (
                              <Badge className="bg-blue-100 text-blue-800">
                                <Shield className="h-3 w-3 mr-1" />
                                PROTECTED
                              </Badge>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-gray-500">Approval Amount</p>
                              <p className="font-semibold text-green-600">${approval.approvalAmount.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Interest Rate</p>
                              <p className="font-semibold">{approval.interestRate}%</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Loan Type</p>
                              <p className="font-semibold capitalize">{approval.loanType}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Down Payment</p>
                              <p className="font-semibold">{approval.downPaymentPercent}%</p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <p className="text-gray-500">Credit Score</p>
                              <p className="font-semibold">{approval.creditScore}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Monthly Income</p>
                              <p className="font-semibold">${approval.monthlyIncome.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Expires</p>
                              <p className="font-semibold">{approval.expirationDate.toLocaleDateString()}</p>
                            </div>
                          </div>

                          {approval.notes && (
                            <div className="mt-3">
                              <p className="text-gray-500 text-sm">Notes</p>
                              <p className="text-sm text-gray-700">{approval.notes}</p>
                            </div>
                          )}
                        </div>
                        
                        <div className="text-right space-y-3">
                          <div className="text-2xl font-bold text-green-600">
                            ${approval.estimatedCommission.toLocaleString()}
                          </div>
                          <p className="text-sm text-gray-500">Protected Commission</p>
                          
                          {/* Editable Commission Rate */}
                          <div className="space-y-2">
                            <Label htmlFor={`commission-rate-${approval.id}`} className="text-xs text-gray-600">
                              Commission Rate
                            </Label>
                            <div className="flex items-center space-x-2">
                              <Input
                                id={`commission-rate-${approval.id}`}
                                type="number"
                                min="1"
                                max="10"
                                step="0.1"
                                value={approval.commissionRate}
                                onChange={(e) => updateCommissionRate(approval.id, parseFloat(e.target.value) || 0)}
                                className="w-16 h-8 text-sm text-center"
                              />
                              <span className="text-sm text-gray-600">%</span>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0"
                                onClick={() => {
                                  const commonRates = [2.0, 2.5, 3.0];
                                  const currentIndex = commonRates.indexOf(approval.commissionRate);
                                  const nextRate = commonRates[(currentIndex + 1) % commonRates.length];
                                  updateCommissionRate(approval.id, nextRate);
                                }}
                              >
                                <Edit3 className="h-3 w-3" />
                              </Button>
                            </div>
                            <p className="text-xs text-gray-400">
                              Quick: 2% | 2.5% | 3%
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </TabsContent>
                
                <TabsContent value="summary">
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card className="border-green-200 bg-green-50">
                        <CardHeader>
                          <CardTitle className="text-lg text-green-800 flex items-center">
                            <TrendingUp className="h-5 w-5 mr-2" />
                            Commission Protection Impact
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex justify-between">
                            <span className="text-green-700">Total Protected Value:</span>
                            <span className="font-bold text-green-800">
                              ${buyerPreApprovals.reduce((sum, approval) => sum + approval.estimatedCommission, 0).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-green-700">Average Commission:</span>
                            <span className="font-bold text-green-800">
                              ${Math.round(buyerPreApprovals.reduce((sum, approval) => sum + approval.estimatedCommission, 0) / buyerPreApprovals.length).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-green-700">Protection Rate:</span>
                            <span className="font-bold text-green-800">100%</span>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card className="border-blue-200 bg-blue-50">
                        <CardHeader>
                          <CardTitle className="text-lg text-blue-800 flex items-center">
                            <DollarSign className="h-5 w-5 mr-2" />
                            Buyer Financial Strength
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex justify-between">
                            <span className="text-blue-700">Total Buying Power:</span>
                            <span className="font-bold text-blue-800">
                              ${buyerPreApprovals.reduce((sum, approval) => sum + approval.approvalAmount, 0).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-blue-700">Average Credit Score:</span>
                            <span className="font-bold text-blue-800">
                              {Math.round(buyerPreApprovals.reduce((sum, approval) => sum + approval.creditScore, 0) / buyerPreApprovals.length)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-blue-700">Qualified Buyers:</span>
                            <span className="font-bold text-blue-800">{buyerPreApprovals.length}</span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                    
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h4 className="font-semibold text-yellow-800 mb-2">Commission Protection Benefits</h4>
                      <ul className="text-sm text-yellow-700 space-y-1">
                        <li>• Automated tracking of all buyer pre-approvals and their commission values</li>
                        <li>• Legal documentation establishing agent representation before property showings</li>
                        <li>• GPS and time-stamped evidence of all client property interactions</li>
                        <li>• Protection against commission disputes with comprehensive activity records</li>
                        <li>• Real-time monitoring of unauthorized property visits by clients</li>
                      </ul>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Client Contracts Modal */}
        <Dialog open={showContractsModal} onOpenChange={setShowContractsModal}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Client Contracts
                {selectedClientId && (
                  <Badge variant="secondary">
                    Client ID: {selectedClientId}
                  </Badge>
                )}
              </DialogTitle>
            </DialogHeader>
            
            <div className="mt-4">
              {contractsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <span className="ml-2 text-gray-600">Loading contracts...</span>
                </div>
              ) : !clientContracts || clientContracts.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Contracts Found</h3>
                  <p className="text-gray-600">This client doesn't have any contracts yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {clientContracts.map((contract: any) => (
                    <Card key={contract.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium text-gray-900">
                              {contract.representationType === 'buyer' ? 'Buyer' : 'Seller'} Representation
                            </h4>
                            <Badge variant={contract.status === 'active' ? 'default' : 'secondary'}>
                              {contract.status}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              <span>Start: {new Date(contract.startDate).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              <span>End: {new Date(contract.endDate).toLocaleDateString()}</span>
                            </div>
                            {contract.propertyAddress && (
                              <div className="col-span-2 flex items-center gap-1">
                                <Eye className="h-4 w-4" />
                                <span>Property: {contract.propertyAddress}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <p className="text-sm text-gray-500 mb-2">
                            Created {new Date(contract.createdAt).toLocaleDateString()}
                          </p>
                          {contract.contractFileName && (
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-1" />
                              View Document
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Add Client Modal */}
        <Dialog open={showAddClientForm} onOpenChange={setShowAddClientForm}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Add New Client
              </DialogTitle>
            </DialogHeader>
            <AddClientForm onClose={() => setShowAddClientForm(false)} />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}