import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/navbar";
import AnimatedInsightsDashboard from "@/components/animated-insights-dashboard";
import { Shield } from "lucide-react";
import { 
  HouseLoadingAnimation, 
  FloatingHouse, 
  FloatingKey, 
  FloatingDollar 
} from "@/components/ui/loading-animations";

export default function Dashboard() {
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
    }
  }, [isLoading, isAuthenticated, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center relative overflow-hidden">
        {/* Floating animations in background */}
        <FloatingHouse className="top-20 left-20" />
        <FloatingKey className="top-40 right-32" />
        <FloatingDollar className="bottom-32 left-1/4" />
        <FloatingHouse className="bottom-20 right-20" />
        
        <div className="text-center z-10">
          <HouseLoadingAnimation size={64} message="Building your commission dashboard..." />
          <div className="mt-4 flex justify-center space-x-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-100"></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-200"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
      <Navbar />
      <AnimatedInsightsDashboard />
    </div>
  );
}