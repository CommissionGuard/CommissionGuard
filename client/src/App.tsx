import { useState } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import AISupportChat from "@/components/ai-support-chat";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import Clients from "@/pages/clients";
import ClientProfile from "@/pages/client-profile";
import Contracts from "@/pages/contracts";
import Alerts from "@/pages/alerts";
import Reports from "@/pages/reports";
import LegalSupport from "@/pages/legal-support";
import ShowingTracker from "@/pages/showing-tracker";
import CommissionTracker from "@/pages/commission-tracker";
import ContractReminders from "@/pages/contract-reminders";
import PropertyAnalyzer from "@/pages/property-analyzer";
import CommissionIntelligence from "@/pages/commission-intelligence";
import AdminDashboard from "@/pages/admin-dashboard";
import EnhancedAdminDashboard from "@/pages/enhanced-admin-dashboard";
import BreachManagement from "@/pages/breach-management";
import PublicRecordsMonitor from "@/pages/public-records-monitor";
import PublicRecords from "@/pages/public-records";
import Subscription from "@/pages/subscription";
import Support from "@/pages/support";


function Router() {
  const { isAuthenticated, isLoading } = useAuth();
  const [isChatOpen, setIsChatOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <>
<Switch>
  {/* Always show Landing page at root - even if loading */}
  <Route path="/" component={Landing} />
  
  {/* Protected routes - only accessible when authenticated */}
  <Route path="/dashboard" component={isAuthenticated ? Dashboard : Landing} />
  <Route path="/clients" component={isAuthenticated ? Clients : Landing} />
  <Route path="/contracts" component={isAuthenticated ? Contracts : Landing} />
  {/* ... other protected routes */}
  <Route component={NotFound} />
</Switch>
      {isAuthenticated && (
        <AISupportChat 
          isOpen={isChatOpen} 
          onToggle={() => setIsChatOpen(!isChatOpen)} 
        />
      )}
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
