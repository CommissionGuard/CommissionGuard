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
import Prospecting from "@/pages/prospecting";
import ApiIntegrations from "@/pages/api-integrations";
import PropertyResearch from "@/pages/property-research";
import ApiTest from "@/pages/api-test";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Dashboard} />
          <Route path="/clients" component={Clients} />
          <Route path="/contracts" component={Contracts} />
          <Route path="/alerts" component={Alerts} />
          <Route path="/reports" component={Reports} />
          <Route path="/legal-support" component={LegalSupport} />
          <Route path="/map" component={PropertyMap} />
          <Route path="/prospecting" component={Prospecting} />
          <Route path="/api-integrations" component={ApiIntegrations} />
          <Route path="/property-research" component={PropertyResearch} />
          <Route path="/api-test" component={ApiTest} />
        </>
      )}
      <Route component={NotFound} />
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
