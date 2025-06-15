import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/navbar";
import ContractsTable from "@/components/contracts-table";
import AddContractForm from "@/components/add-contract-form";

export default function Contracts() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [filter, setFilter] = useState<string | null>(null);

  // Check for URL parameters on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const filterParam = urlParams.get('filter');
    if (filterParam) {
      setFilter(filterParam);
    }
  }, []);

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
          <h1 className="text-3xl font-bold text-gray-900">Contract Management</h1>
          <p className="text-gray-600 mt-1">Monitor your representation agreements and protect your commissions</p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2">
            <ContractsTable filter={filter} />
          </div>
          <div>
            <AddContractForm />
          </div>
        </div>
      </div>
    </div>
  );
}