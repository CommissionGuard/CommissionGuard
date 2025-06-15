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
import Contracts from "@/pages/contracts";
import Alerts from "@/pages/alerts";
import Reports from "@/pages/reports";
import LegalSupport from "@/pages/legal-support";
import PropertyMap from "@/pages/map";
import LiveMap from "@/pages/live-map";
import Prospecting from "@/pages/prospecting";
import ApiIntegrations from "@/pages/api-integrations";
import PropertyResearch from "@/pages/property-research";
import PropertyAnalyzer from "@/pages/property-analyzer";
import DealPipeline from "@/pages/deal-pipeline";
import BusinessOverview from "@/pages/business-overview";
import AIContractAnalysis from "@/pages/ai-contract-analysis";
import ApiTest from "@/pages/api-test";
import AdminDashboard from "@/pages/admin-dashboard";
import FunctionalityTest from "@/pages/functionality-test";
import RentalMarket from "@/pages/rental-market";
import SystemTest from "@/pages/system-test";
import ShowingTracker from "@/pages/showing-tracker";
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
          <Route path="/contracts" component={Contracts} />
          <Route path="/alerts" component={Alerts} />
          <Route path="/reports" component={Reports} />
          <Route path="/legal-support" component={LegalSupport} />
          <Route path="/map" component={PropertyMap} />
          <Route path="/live-map" component={LiveMap} />
          <Route path="/prospecting" component={Prospecting} />
          <Route path="/api-integrations" component={ApiIntegrations} />
          <Route path="/property-research" component={PropertyResearch} />
          <Route path="/property-analyzer" component={PropertyAnalyzer} />
          <Route path="/deal-pipeline" component={DealPipeline} />
          <Route path="/business-overview" component={BusinessOverview} />
          <Route path="/ai-contract-analysis" component={AIContractAnalysis} />
          <Route path="/api-test" component={ApiTest} />
          <Route path="/admin" component={AdminDashboard} />
          <Route path="/functionality-test" component={FunctionalityTest} />
          <Route path="/rental-market" component={RentalMarket} />
          <Route path="/system-test" component={SystemTest} />
          <Route path="/showing-tracker" component={ShowingTracker} />
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
