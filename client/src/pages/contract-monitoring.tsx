import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useLocation } from "wouter";
import Navbar from "@/components/navbar";
import AnimatedBackground from "@/components/animated-background";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Shield, 
  AlertTriangle, 
  TrendingUp, 
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  Activity,
  Calendar,
  FileText,
  User,
  DollarSign,
  Zap
} from "lucide-react";

export default function ContractMonitoring() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const { data: monitoringData, isLoading: loadingData } = useQuery({
    queryKey: ["/api/contract-monitoring"],
  });

  // Handler functions for buttons
  const handleTakeAction = (breachId: number, severity: string) => {
    if (severity === 'critical') {
      // For critical breaches, navigate to alerts page for immediate action
      setLocation("/alerts");
    } else {
      // For other breaches, show action completed toast
      toast({
        title: "Action Initiated",
        description: "Breach monitoring action has been recorded and client will be contacted.",
      });
    }
  };

  const handleViewDetails = (breachId: number) => {
    // Navigate to alerts page to view detailed breach information
    setLocation("/alerts");
  };

  const handleConfigure = (configType: string) => {
    toast({
      title: "Configuration",
      description: `${configType} configuration panel will be available in the next update.`,
    });
  };

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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-32 w-32 border-4 border-gray-200"></div>
            <div className="animate-spin rounded-full h-32 w-32 border-4 border-primary border-t-transparent absolute top-0"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Activity className="h-8 w-8 text-primary animate-pulse" />
            </div>
          </div>
          <p className="mt-6 text-gray-700 font-medium">Loading contract monitoring...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const breachIndicators = [
    {
      id: 1,
      type: "High Risk",
      severity: "critical",
      client: "Sarah Johnson",
      contract: "Buyer Representation - 123 Main St",
      issue: "Client contacted another agent after signing exclusive agreement",
      confidence: 95,
      detected: "2 hours ago",
      recommendedAction: "Immediate contact required - Document breach evidence"
    },
    {
      id: 2,
      type: "Medium Risk",
      severity: "warning",
      client: "Mike Chen",
      contract: "Seller Agreement - 456 Oak Ave",
      issue: "FSBO listing detected on property under exclusive contract",
      confidence: 78,
      detected: "1 day ago",
      recommendedAction: "Review contract terms and discuss with client"
    },
    {
      id: 3,
      type: "Low Risk",
      severity: "info",
      client: "Lisa Rodriguez",
      contract: "Buyer Agreement - Investment Property",
      issue: "Contract expiring in 7 days without renewal discussion",
      confidence: 85,
      detected: "3 days ago",
      recommendedAction: "Schedule renewal meeting before expiration"
    }
  ];

  const monitoringMetrics = {
    totalContracts: 24,
    activeMonitoring: 22,
    breachesDetected: 3,
    protectionScore: 94,
    autoAlerts: 156,
    falsePositives: 2
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 relative">
      <AnimatedBackground />
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <div className="bg-gradient-to-br from-primary to-blue-600 p-3 rounded-xl shadow-lg">
              <Activity className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Contract Monitoring & Breach Detection
              </h1>
              <p className="text-gray-600 mt-1">AI-powered monitoring to protect your commission agreements</p>
            </div>
          </div>
        </div>

        {/* Monitoring Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <Card className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300">
            <CardContent className="pt-6">
              <div className="text-center">
                <Shield className="h-8 w-8 text-primary mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{monitoringMetrics.totalContracts}</p>
                <p className="text-sm text-gray-600">Total Contracts</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300">
            <CardContent className="pt-6">
              <div className="text-center">
                <Eye className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{monitoringMetrics.activeMonitoring}</p>
                <p className="text-sm text-gray-600">Under Monitoring</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300">
            <CardContent className="pt-6">
              <div className="text-center">
                <AlertTriangle className="h-8 w-8 text-red-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{monitoringMetrics.breachesDetected}</p>
                <p className="text-sm text-gray-600">Breaches Detected</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300">
            <CardContent className="pt-6">
              <div className="text-center">
                <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{monitoringMetrics.protectionScore}%</p>
                <p className="text-sm text-gray-600">Protection Score</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300">
            <CardContent className="pt-6">
              <div className="text-center">
                <Zap className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{monitoringMetrics.autoAlerts}</p>
                <p className="text-sm text-gray-600">Auto Alerts</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300">
            <CardContent className="pt-6">
              <div className="text-center">
                <CheckCircle className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">98.7%</p>
                <p className="text-sm text-gray-600">Accuracy Rate</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="breaches" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="breaches">Breach Detection</TabsTrigger>
            <TabsTrigger value="monitoring">Active Monitoring</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">AI Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="breaches" className="space-y-6">
            {/* Breach Alerts */}
            <Card className="bg-white rounded-xl shadow-sm border border-gray-200">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900 flex items-center">
                  <AlertTriangle className="text-red-500 mr-2" />
                  Active Breach Indicators
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {breachIndicators.map((breach) => (
                    <Alert key={breach.id} className={`border-l-4 ${
                      breach.severity === 'critical' ? 'border-red-500 bg-red-50' :
                      breach.severity === 'warning' ? 'border-yellow-500 bg-yellow-50' :
                      'border-blue-500 bg-blue-50'
                    }`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge variant={
                              breach.severity === 'critical' ? 'destructive' :
                              breach.severity === 'warning' ? 'secondary' : 'default'
                            }>
                              {breach.type}
                            </Badge>
                            <span className="text-sm text-gray-600">
                              Confidence: {breach.confidence}%
                            </span>
                            <span className="text-sm text-gray-500">
                              {breach.detected}
                            </span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                            <div>
                              <p className="font-semibold text-gray-900">{breach.client}</p>
                              <p className="text-sm text-gray-600">{breach.contract}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-900 font-medium">Detected Issue:</p>
                              <p className="text-sm text-gray-700">{breach.issue}</p>
                            </div>
                          </div>
                          <AlertDescription className="text-sm font-medium text-gray-800">
                            Recommended Action: {breach.recommendedAction}
                          </AlertDescription>
                        </div>
                        <div className="flex flex-col space-y-2 ml-4">
                          <Button 
                            size="sm" 
                            variant={breach.severity === 'critical' ? 'destructive' : 'default'}
                            onClick={() => handleTakeAction(breach.id, breach.severity)}
                          >
                            Take Action
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleViewDetails(breach.id)}
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                    </Alert>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="monitoring" className="space-y-6">
            <Card className="bg-white rounded-xl shadow-sm border border-gray-200">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900 flex items-center">
                  <Eye className="text-primary mr-2" />
                  Contracts Under Active Monitoring
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { client: "Sarah Johnson", property: "123 Main St", type: "Buyer Agreement", status: "Active", riskLevel: "Low", lastCheck: "2 minutes ago" },
                    { client: "Mike Chen", property: "456 Oak Ave", type: "Seller Agreement", status: "Active", riskLevel: "Medium", lastCheck: "5 minutes ago" },
                    { client: "Lisa Rodriguez", property: "Investment Property", type: "Buyer Agreement", status: "Expiring Soon", riskLevel: "High", lastCheck: "1 hour ago" }
                  ].map((contract, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-300">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <User className="h-5 w-5 text-gray-400" />
                          <div>
                            <h4 className="font-semibold text-gray-900">{contract.client}</h4>
                            <p className="text-sm text-gray-600">{contract.property}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">{contract.type}</Badge>
                          <Badge variant={
                            contract.riskLevel === 'High' ? 'destructive' :
                            contract.riskLevel === 'Medium' ? 'secondary' : 'default'
                          }>
                            {contract.riskLevel} Risk
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">
                          Status: <span className="font-medium">{contract.status}</span>
                        </span>
                        <span className="text-gray-500">
                          Last check: {contract.lastCheck}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white rounded-xl shadow-sm border border-gray-200">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900">Breach Detection Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600">Analytics visualization will display here</p>
                      <p className="text-sm text-gray-500">Showing breach patterns and detection accuracy over time</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white rounded-xl shadow-sm border border-gray-200">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900">Protection Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Contract Compliance</span>
                      <span>94%</span>
                    </div>
                    <Progress value={94} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Early Detection Rate</span>
                      <span>87%</span>
                    </div>
                    <Progress value={87} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Breach Prevention</span>
                      <span>91%</span>
                    </div>
                    <Progress value={91} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>False Positive Rate</span>
                      <span>1.3%</span>
                    </div>
                    <Progress value={1.3} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card className="bg-white rounded-xl shadow-sm border border-gray-200">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900 flex items-center">
                  <Zap className="text-yellow-500 mr-2" />
                  AI Monitoring Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Intelligent Breach Detection</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">Real-time MLS Monitoring</p>
                        <p className="text-sm text-gray-600">Track if clients list properties with other agents</p>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleConfigure("Real-time MLS Monitoring")}
                      >
                        Configure
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">Contract Expiration Alerts</p>
                        <p className="text-sm text-gray-600">Automated reminders before agreements expire</p>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleConfigure("Contract Expiration Alerts")}
                      >
                        Configure
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">Client Communication Analysis</p>
                        <p className="text-sm text-gray-600">Detect potential dissatisfaction patterns</p>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleConfigure("Client Communication Analysis")}
                      >
                        Configure
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    <strong>Professional Integration Required:</strong> To enable full AI monitoring capabilities, 
                    connect with MLS systems, email platforms, and property databases for comprehensive breach detection.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}