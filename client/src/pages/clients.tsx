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
import { 
  ClientLoadingAnimation, 
  ClientCardSkeleton, 
  PropertySearchAnimation 
} from "@/components/ui/loading-animations";

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
  const buyerPreApprovals = [
    {
      id: 1,
      lenderName: "Chase Bank",
      approvalAmount: 650000,
      interestRate: 6.75,
      loanType: "conventional",
      downPaymentPercent: 20,
      creditScore: 780,
      monthlyIncome: 12500,
      verificationStatus: "verified",
      expirationDate: new Date("2024-09-15"),
      protectedStatus: true,
      estimatedCommission: 19500
    },
    {
      id: 2,
      lenderName: "Wells Fargo",
      approvalAmount: 425000,
      interestRate: 7.125,
      loanType: "fha",
      downPaymentPercent: 3.5,
      creditScore: 710,
      monthlyIncome: 8750,
      verificationStatus: "pending",
      expirationDate: new Date("2024-08-22"),
      protectedStatus: true,
      estimatedCommission: 12750
    },
    {
      id: 3,
      lenderName: "Bank of America",
      approvalAmount: 825000,
      interestRate: 6.5,
      loanType: "jumbo",
      downPaymentPercent: 25,
      creditScore: 810,
      monthlyIncome: 18000,
      verificationStatus: "verified",
      expirationDate: new Date("2024-10-08"),
      protectedStatus: true,
      estimatedCommission: 24750
    }
  ];

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to access client management.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 1000);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <ClientLoadingAnimation />
      </div>
    );
  }

  // Don't render if not authenticated
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

        {/* All Clients Section */}
        <div className="mb-8">
          <Card className="bg-white rounded-xl shadow-sm border border-gray-200">
            <CardHeader className="border-b border-gray-200">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-semibold text-gray-900">All Clients</CardTitle>
                <Badge variant="secondary">{(clients as any[])?.length || 0} clients</Badge>
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
              ) : !clients || (clients as any[]).length === 0 ? (
                <div className="text-center py-12">
                  <UserPlus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Clients Found</h3>
                  <p className="text-gray-600">Add your first client to get started with commission protection.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {(clients as any[]).map((client: any) => {
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
                              {client.phone && (
                                <div className="flex items-center text-sm text-gray-600">
                                  <Phone className="h-4 w-4 mr-1" />
                                  {client.phone}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedClientId(client.id);
                                setShowContractsModal(true);
                              }}
                              className="flex items-center gap-1"
                            >
                              <FileText className="h-4 w-4" />
                              Contracts
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setLocation(`/clients/${client.id}`)}
                              className="flex items-center gap-1"
                            >
                              <Eye className="h-4 w-4" />
                              View
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
        <div className="mb-8">
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
                          
                          <div className="flex items-center justify-between pt-3 border-t">
                            <div className="flex items-center space-x-2">
                              <DollarSign className="h-4 w-4 text-green-600" />
                              <span className="text-sm font-medium text-gray-700">
                                Protected Commission: 
                                <span className="text-green-600 font-semibold ml-1">
                                  ${approval.estimatedCommission.toLocaleString()}
                                </span>
                              </span>
                            </div>
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm">
                                <Edit3 className="h-4 w-4 mr-1" />
                                Edit
                              </Button>
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4 mr-1" />
                                Details
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </TabsContent>
                
                <TabsContent value="summary" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-green-800">Total Buying Power</h4>
                      <p className="text-2xl font-bold text-green-600">
                        ${buyerPreApprovals.reduce((sum, approval) => sum + approval.approvalAmount, 0).toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-blue-800">Average Interest Rate</h4>
                      <p className="text-2xl font-bold text-blue-600">
                        {(buyerPreApprovals.reduce((sum, approval) => sum + approval.interestRate, 0) / buyerPreApprovals.length).toFixed(2)}%
                      </p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-purple-800">Protected Commissions</h4>
                      <p className="text-2xl font-bold text-purple-600">
                        ${buyerPreApprovals.reduce((sum, approval) => sum + approval.estimatedCommission, 0).toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-orange-800">Average Credit Score</h4>
                      <p className="text-2xl font-bold text-orange-600">
                        {Math.round(buyerPreApprovals.reduce((sum, approval) => sum + approval.creditScore, 0) / buyerPreApprovals.length)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-4">Pre-Approval Distribution</h4>
                    <div className="space-y-3">
                      {buyerPreApprovals.map((approval) => (
                        <div key={approval.id} className="flex items-center justify-between">
                          <span className="text-sm font-medium">{approval.lenderName}</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-32 h-2 bg-gray-200 rounded-full">
                              <div 
                                className="h-2 bg-blue-500 rounded-full" 
                                style={{ 
                                  width: `${(approval.approvalAmount / Math.max(...buyerPreApprovals.map(a => a.approvalAmount))) * 100}%` 
                                }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-600">
                              ${approval.approvalAmount.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Client Contracts Modal */}
        <Dialog open={showContractsModal} onOpenChange={setShowContractsModal}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Client Contracts</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {contractsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading contracts...</p>
                </div>
              ) : !clientContracts || (clientContracts as any[]).length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Contracts Found</h3>
                  <p className="text-gray-600">This client has no contracts yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {(clientContracts as any[]).map((contract: any) => (
                    <div key={contract.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold text-gray-900">{contract.type}</h4>
                          <p className="text-sm text-gray-600">
                            Signed: {new Date(contract.signedDate).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-gray-600">
                            Expires: {new Date(contract.expirationDate).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant={contract.status === 'active' ? 'default' : 'secondary'}>
                          {contract.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Add Client Form Modal */}
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