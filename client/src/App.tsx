import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
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
import PropertyAnalyzer from "@/pages/property-analyzer";
import AdminDashboard from "@/pages/admin-dashboard";
import PublicRecordsMonitor from "@/pages/public-records-monitor";
import PublicRecords from "@/pages/public-records";
import Subscription from "@/pages/subscription";
import Support from "@/pages/support";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <Switch>
      {!isAuthenticated ? (
        <>
          <Route path="/" component={Landing} />
          <Route component={Landing} />
        </>
      ) : (
        <>
          <Route path="/" component={Dashboard} />
          <Route path="/clients" component={Clients} />
          <Route path="/clients/:clientId" component={ClientProfile} />
          <Route path="/contracts" component={Contracts} />
          <Route path="/alerts" component={Alerts} />
          <Route path="/reports" component={Reports} />
          <Route path="/legal-support" component={LegalSupport} />
          <Route path="/showing-tracker" component={ShowingTracker} />
          <Route path="/commission-tracker" component={CommissionTracker} />
          <Route path="/property-analyzer" component={PropertyAnalyzer} />
          <Route path="/admin" component={AdminDashboard} />
          <Route path="/subscription" component={Subscription} />
          <Route path="/support" component={Support} />
          <Route path="/public-records" component={PublicRecordsMonitor} />
          <Route path="/public-records-search" component={PublicRecords} />
          <Route path="*" component={NotFound} />
        </>
      )}
    </Switch>
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
