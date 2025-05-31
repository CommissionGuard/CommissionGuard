import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import Navbar from "@/components/navbar";
import StatsCards from "@/components/stats-cards";
import AlertsSection from "@/components/alerts-section";
import ContractsTable from "@/components/contracts-table";
import QuickActions from "@/components/quick-actions";
import AddClientForm from "@/components/add-client-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Database } from "lucide-react";

export default function Dashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();

  const createDemoDataMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/demo-data");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      queryClient.invalidateQueries({ queryKey: ["/api/contracts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/alerts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Success",
        description: "Sample client, contract, and alert data created successfully",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: "Failed to create demo data",
        variant: "destructive",
      });
    },
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
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-1">Monitor your representation agreements and protect your commissions</p>
            </div>
          </div>

          <StatsCards />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <AlertsSection />
            <ContractsTable />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <QuickActions />
            
            {/* Demo Data Card */}
            <Card className="bg-white rounded-xl shadow-sm border border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                  <Database className="text-primary mr-2" />
                  Try the Platform
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Add sample data to explore Commission Guard's features and see how it protects your commissions.
                </p>
                <Button
                  onClick={() => createDemoDataMutation.mutate()}
                  disabled={createDemoDataMutation.isPending}
                  className="w-full bg-primary text-white hover:bg-blue-700"
                >
                  {createDemoDataMutation.isPending ? "Creating..." : "Add Sample Data"}
                </Button>
              </CardContent>
            </Card>
            
            <AddClientForm />
            
            {/* Subscription Status */}
            <div className="bg-gradient-to-r from-primary to-blue-600 rounded-xl shadow-sm text-white p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Subscription Status</h3>
                <div className="text-yellow-300 text-xl">👑</div>
              </div>
              <div className="space-y-2">
                <p className="text-blue-100">Commission Guard Pro</p>
                <p className="text-2xl font-bold">$199.99/year</p>
                <p className="text-sm text-blue-200">Active subscription</p>
              </div>
              <button className="mt-4 bg-white text-primary px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors text-sm">
                Manage Subscription
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
