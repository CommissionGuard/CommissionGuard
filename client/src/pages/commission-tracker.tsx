import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DollarSign, Shield, Calendar, AlertTriangle } from "lucide-react";

export default function CommissionTracker() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

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

  const { data: commissionData = [], isLoading: isLoadingCommission } = useQuery({
    queryKey: ["/api/commission-protection"],
    enabled: isAuthenticated,
    retry: 3,
    staleTime: 60000,
  });

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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getProtectionStatus = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "expired":
        return "bg-gray-100 text-gray-800";
      case "at-risk":
        return "bg-yellow-100 text-yellow-800";
      case "breached":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Calculate summary stats
  const totalProtected = commissionData.reduce((sum: number, item: any) => 
    sum + (item.estimatedCommission || 0), 0);
  const activeProtections = commissionData.filter((item: any) => 
    item.status === "active").length;
  const expiringProtections = commissionData.filter((item: any) => {
    if (!item.expirationDate) return false;
    const expiry = new Date(item.expirationDate);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  }).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Commission Protection Tracker</h1>
          <p className="text-gray-600 mt-1">Monitor and protect your commission earnings</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white rounded-xl shadow-sm border border-gray-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Total Protected</p>
                  <p className="text-3xl font-bold text-gray-900">{formatCurrency(totalProtected)}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white rounded-xl shadow-sm border border-gray-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Active Protections</p>
                  <p className="text-3xl font-bold text-gray-900">{activeProtections}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Shield className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white rounded-xl shadow-sm border border-gray-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Expiring Soon</p>
                  <p className="text-3xl font-bold text-gray-900">{expiringProtections}</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <AlertTriangle className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Commission Protection List */}
        <Card className="bg-white rounded-xl shadow-sm border border-gray-200">
          <CardHeader className="border-b border-gray-200">
            <CardTitle className="text-xl font-semibold text-gray-900">Commission Protection Records</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoadingCommission ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading commission data...</p>
              </div>
            ) : !commissionData || commissionData.length === 0 ? (
              <div className="text-center py-12">
                <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Commission Protection Records</h3>
                <p className="text-gray-600 mb-6">Start protecting your commissions by documenting client interactions and property showings.</p>
                <Button className="bg-primary text-white hover:bg-primary/90">
                  Add Protection Record
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Client</th>
                      <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Property</th>
                      <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Protection Type</th>
                      <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Estimated Commission</th>
                      <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Expiration</th>
                      <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {commissionData.map((protection: any) => (
                      <tr key={protection.id} className="hover:bg-gray-50">
                        <td className="py-4 px-6">
                          <div className="text-sm font-medium text-gray-900">
                            {protection.client?.fullName || "Unknown Client"}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="text-sm text-gray-900">
                            {protection.property?.address || "No address"}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="text-sm text-gray-900 capitalize">
                            {protection.protectionType || "General"}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="text-sm font-medium text-gray-900">
                            {formatCurrency(protection.estimatedCommission || 0)}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="text-sm text-gray-900">
                            {protection.expirationDate 
                              ? new Date(protection.expirationDate).toLocaleDateString()
                              : "No expiration"
                            }
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <Badge className={getProtectionStatus(protection.status)}>
                            {protection.status || "unknown"}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}