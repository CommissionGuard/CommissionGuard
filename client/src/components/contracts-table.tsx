import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Eye } from "lucide-react";
import ContractModal from "./contract-modal";

export default function ContractsTable() {
  const [selectedContract, setSelectedContract] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const { isAuthenticated } = useAuth();

  const { data: contracts = [], isLoading, error } = useQuery({
    queryKey: ["/api/contracts"],
    enabled: isAuthenticated,
    retry: 3,
    staleTime: 30000,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-success";
      case "expiring":
        return "bg-yellow-100 text-warning";
      case "expired":
        return "bg-gray-100 text-gray-600";
      case "breached":
        return "bg-red-100 text-accent";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const getRepresentationTypeColor = (type: string) => {
    return type === "buyer" 
      ? "bg-blue-100 text-primary" 
      : "bg-green-100 text-success";
  };

  const isExpiringSoon = (endDate: string) => {
    const today = new Date();
    const expiry = new Date(endDate);
    const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  };

  const getContractStatus = (contract: any) => {
    if (contract.status === "breached") return { status: "breached", label: "Alert" };
    if (isExpiringSoon(contract.endDate)) return { status: "expiring", label: "Expiring" };
    return { status: contract.status, label: contract.status === "active" ? "Active" : "Inactive" };
  };

  const handleViewContract = (contract: any) => {
    setSelectedContract(contract);
    setShowModal(true);
  };

  if (!isAuthenticated) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Active Contracts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Authentication Required</h3>
            <p className="text-gray-600">Please log in to view your contracts.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Active Contracts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Active Contracts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-red-600 mb-2">Error Loading Contracts</h3>
            <p className="text-gray-600">Unable to fetch contracts. Please refresh the page.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="bg-white rounded-xl shadow-sm border border-gray-200">
        <CardHeader className="border-b border-gray-200">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold text-gray-900">Active Contracts</CardTitle>
            <Button variant="link" className="text-primary font-medium hover:underline">
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {!contracts || !Array.isArray(contracts) || contracts.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Contracts Found</h3>
              <p className="text-gray-600">Start by adding your first client and contract.</p>
              {contracts && (
                <p className="text-xs text-gray-400 mt-2">
                  Data type: {typeof contracts}, Value: {JSON.stringify(contracts).substring(0, 100)}...
                </p>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Client</th>
                    <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Type</th>
                    <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Start Date</th>
                    <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Expires</th>
                    <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Status</th>
                    <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {contracts.map((contract: any) => {
                    const contractStatus = getContractStatus(contract);
                    const clientInitials = contract.client?.fullName
                      ?.split(" ")
                      .map((n: string) => n[0])
                      .join("")
                      .toUpperCase() || "?";

                    return (
                      <tr key={contract.id} className="hover:bg-gray-50">
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-blue-100 text-primary text-sm">
                                {clientInitials}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-gray-900">
                                {contract.client?.fullName || "Unknown"}
                              </p>
                              <p className="text-sm text-gray-600">
                                {contract.client?.email || "No email"}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <Badge className={getRepresentationTypeColor(contract.representationType)}>
                            {contract.representationType === "buyer" ? "Buyer" : "Seller"}
                          </Badge>
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-600">
                          {new Date(contract.startDate).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-600">
                          {new Date(contract.endDate).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-6">
                          <Badge className={getStatusColor(contractStatus.status)}>
                            {contractStatus.label}
                          </Badge>
                        </td>
                        <td className="py-4 px-6">
                          <Button
                            variant="link"
                            size="sm"
                            onClick={() => handleViewContract(contract)}
                            className="text-primary hover:underline p-0"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <ContractModal
        contract={selectedContract}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </>
  );
}
