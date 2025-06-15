import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart3, TrendingUp, DollarSign, FileText, Download, Calendar } from "lucide-react";

export default function Reports() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

  const { data: stats } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: auditLogs } = useQuery({
    queryKey: ["/api/audit-logs"],
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

  // Calculate commission risk metrics
  const totalContracts = (stats as any)?.activeContracts || 0;
  const expiringContracts = (stats as any)?.expiringSoon || 0;
  const protectedCommission = (stats as any)?.protectedCommission || 0;
  const riskPercentage = totalContracts > 0 ? Math.round((expiringContracts / totalContracts) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Commission Reports</h1>
              <p className="text-gray-600 mt-1">Analyze your commission protection and contract performance</p>
            </div>
            <Button 
              className="bg-primary text-white hover:bg-blue-700"
              onClick={() => {
                toast({
                  title: "Report Generated",
                  description: "Commission protection report has been downloaded.",
                });
                // Create and download a sample CSV report
                const reportData = [
                  ['Date', 'Client', 'Contract Type', 'Commission', 'Status'],
                  ['2024-01-15', 'Sarah Johnson', 'Buyer Agreement', '$15,000', 'Active'],
                  ['2024-02-20', 'Mike Chen', 'Seller Agreement', '$12,500', 'Pending'],
                  ['2024-03-10', 'Emma Davis', 'Buyer Agreement', '$18,000', 'Completed']
                ];
                const csvContent = reportData.map(row => row.join(',')).join('\n');
                const blob = new Blob([csvContent], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `commission-report-${new Date().toISOString().split('T')[0]}.csv`;
                a.click();
                URL.revokeObjectURL(url);
              }}
            >
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Commission Protection Overview */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-white rounded-xl shadow-sm border border-gray-200">
              <CardHeader className="border-b border-gray-200">
                <CardTitle className="text-xl font-semibold text-gray-900 flex items-center">
                  <DollarSign className="text-success mr-2" />
                  Commission Protection Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                    <DollarSign className="h-8 w-8 text-success mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">${protectedCommission.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">Total Protected</p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <FileText className="h-8 w-8 text-primary mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">{totalContracts}</p>
                    <p className="text-sm text-gray-600">Active Contracts</p>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
                    <TrendingUp className="h-8 w-8 text-warning mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">{riskPercentage}%</p>
                    <p className="text-sm text-gray-600">Risk Level</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ROI Analysis */}
            <Card className="bg-white rounded-xl shadow-sm border border-gray-200">
              <CardHeader className="border-b border-gray-200">
                <CardTitle className="text-xl font-semibold text-gray-900 flex items-center">
                  <BarChart3 className="text-primary mr-2" />
                  ROI Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg border border-gray-200">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Commission Guard ROI</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-sm text-gray-600">Annual Subscription</p>
                        <p className="text-xl font-bold text-primary">$199.99</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Protected Commission</p>
                        <p className="text-xl font-bold text-success">${protectedCommission.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">ROI Multiple</p>
                        <p className="text-xl font-bold text-gray-900">
                          {protectedCommission > 0 ? Math.round(protectedCommission / 199.99) : 0}x
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-700">
                        <strong>Just one saved $500K transaction</strong> with 2% commission ($10,000) 
                        provides <strong>50x return</strong> on your Commission Guard investment.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Activity Log */}
            <Card className="bg-white rounded-xl shadow-sm border border-gray-200">
              <CardHeader className="border-b border-gray-200">
                <CardTitle className="text-xl font-semibold text-gray-900 flex items-center">
                  <Calendar className="text-primary mr-2" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {!auditLogs || auditLogs.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Activity Yet</h3>
                    <p className="text-gray-600">Start adding clients and contracts to see activity here.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {auditLogs.slice(0, 10).map((log: any) => (
                      <div key={log.id} className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg">
                        <div className="bg-blue-100 rounded-full p-2">
                          <FileText className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">
                            {log.action === "CREATE" ? "Created" : "Updated"} {log.entityType}
                          </p>
                          <p className="text-sm text-gray-600">
                            {new Date(log.timestamp).toLocaleDateString()} at{" "}
                            {new Date(log.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Metrics */}
          <div className="space-y-6">
            {/* Commission Risk */}
            <Card className="bg-white rounded-xl shadow-sm border border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">Risk Assessment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Contract Risk</span>
                    <Badge className={riskPercentage > 30 ? "bg-red-100 text-accent" : "bg-green-100 text-success"}>
                      {riskPercentage > 30 ? "High" : "Low"}
                    </Badge>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${riskPercentage > 30 ? "bg-accent" : "bg-success"}`}
                      style={{ width: `${Math.min(riskPercentage, 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-600">
                    {expiringContracts} of {totalContracts} contracts expiring soon
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Commission Guard Value */}
            <Card className="bg-gradient-to-br from-primary to-blue-600 text-white rounded-xl shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Platform Value</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-blue-100 text-sm">Potential Savings</p>
                    <p className="text-2xl font-bold">${protectedCommission.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-blue-100 text-sm">Contracts Monitored</p>
                    <p className="text-lg font-semibold">{totalContracts} Active</p>
                  </div>
                  <div className="pt-2 border-t border-blue-300">
                    <p className="text-xs text-blue-200">
                      Commission Guard protects your income 24/7 with automated monitoring and breach detection.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}