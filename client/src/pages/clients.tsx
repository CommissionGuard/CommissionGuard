import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { UserPlus, Mail, Phone, FileText, Calendar, Eye } from "lucide-react";
import AddClientForm from "@/components/add-client-form";

export default function Clients() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [showContractsModal, setShowContractsModal] = useState(false);

  const { data: clients, isLoading: clientsLoading } = useQuery({
    queryKey: ["/api/clients"],
  });

  const { data: clientContracts, isLoading: contractsLoading } = useQuery({
    queryKey: [`/api/contracts/client/${selectedClientId}`],
    enabled: !!selectedClientId,
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
                              <h3 className="text-lg font-semibold text-gray-900">{client.fullName}</h3>
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

          {/* Add Client Form */}
          <div>
            <AddClientForm />
          </div>
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
      </div>
    </div>
  );
}