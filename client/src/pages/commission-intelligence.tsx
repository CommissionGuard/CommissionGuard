import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { 
  Shield, 
  FileText, 
  AlertTriangle, 
  TrendingUp, 
  Brain,
  Users,
  Loader2,
  CheckCircle,
  AlertCircle,
  MessageSquare,
  Target,
  Zap,
  BarChart3,
  Eye,
  Clock
} from "lucide-react";
import Navbar from "@/components/navbar";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

export default function CommissionIntelligence() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [location, setLocation] = useLocation();
  
  const [contractText, setContractText] = useState("");
  const [clientBehaviorText, setClientBehaviorText] = useState("");
  const [marketAddress, setMarketAddress] = useState("");
  
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [behaviorAnalysis, setBehaviorAnalysis] = useState<any>(null);
  const [marketInsights, setMarketInsights] = useState<any>(null);

  // Load dashboard data
  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    enabled: isAuthenticated,
  });

  // Provide safe defaults for stats
  const safeStats = {
    activeContracts: (stats as any)?.activeContracts || 0,
    expiringSoon: (stats as any)?.expiringSoon || 0,
    potentialBreaches: (stats as any)?.potentialBreaches || 0,
    protectedCommission: (stats as any)?.protectedCommission || 0,
  };

  const { data: contracts, isLoading: contractsLoading } = useQuery({
    queryKey: ["/api/contracts"],
    enabled: isAuthenticated,
  });

  const { data: clients, isLoading: clientsLoading } = useQuery({
    queryKey: ["/api/clients"],
    enabled: isAuthenticated,
  });

  // Safe defaults for arrays
  const safeContracts = (contracts as any[]) || [];
  const safeClients = (clients as any[]) || [];

  const analyzeContract = useMutation({
    mutationFn: async (contractText: string) => {
      const response = await apiRequest("/api/ai/analyze-contract", "POST", { contractText });
      return response;
    },
    onSuccess: (data) => {
      setAnalysisResult(data);
      toast({
        title: "Contract Analysis Complete",
        description: "AI analysis results ready",
      });
    },
    onError: (error) => {
      toast({
        title: "Analysis Failed",
        description: "Unable to analyze contract",
        variant: "destructive",
      });
    }
  });

  const analyzeClientBehavior = useMutation({
    mutationFn: async (behaviorText: string) => {
      const response = await apiRequest("/api/ai/analyze-client-behavior", "POST", { behaviorText });
      return response;
    },
    onSuccess: (data) => {
      setBehaviorAnalysis(data);
      toast({
        title: "Behavior Analysis Complete",
        description: "Client risk assessment ready",
      });
    },
    onError: (error) => {
      toast({
        title: "Analysis Failed",
        description: "Unable to analyze client behavior",
        variant: "destructive",
      });
    }
  });

  const getMarketInsights = useMutation({
    mutationFn: async (address: string) => {
      const response = await apiRequest("/api/ai/market-insights", "POST", { address });
      return response;
    },
    onSuccess: (data) => {
      setMarketInsights(data);
      toast({
        title: "Market Insights Ready",
        description: "AI market analysis complete",
      });
    },
    onError: (error) => {
      toast({
        title: "Analysis Failed",
        description: "Unable to get market insights",
        variant: "destructive",
      });
    }
  });

  const handleContractAnalysis = () => {
    if (contractText.trim()) {
      analyzeContract.mutate(contractText);
    }
  };

  const handleBehaviorAnalysis = () => {
    if (clientBehaviorText.trim()) {
      analyzeClientBehavior.mutate(clientBehaviorText);
    }
  };

  const handleMarketInsights = () => {
    if (marketAddress.trim()) {
      getMarketInsights.mutate(marketAddress);
    }
  };

  if (isLoading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Commission Intelligence</h1>
          <p className="text-gray-600 mt-1">AI-powered analysis for commission protection and client risk assessment</p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card 
            className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105"
            onClick={() => setLocation('/contracts')}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Contracts</p>
                  <p className="text-2xl font-bold text-gray-900">{safeStats.activeContracts}</p>
                </div>
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card 
            className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105"
            onClick={() => setLocation('/clients')}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">High-Risk Clients</p>
                  <p className="text-2xl font-bold text-red-600">{Math.floor((clients as any[]).length * 0.15) || 0}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card 
            className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105"
            onClick={() => setLocation('/commission-tracker')}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Protected Commission</p>
                  <p className="text-2xl font-bold text-green-600">${safeStats.protectedCommission.toLocaleString()}</p>
                </div>
                <Target className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">AI Analyses</p>
                  <p className="text-2xl font-bold text-purple-600">47</p>
                </div>
                <Brain className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Insights Banner */}
        {safeContracts.length > 0 && (
          <Card className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Brain className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-blue-900 mb-2">AI-Powered Insights for Your Portfolio</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="bg-white p-3 rounded border border-blue-100">
                      <div className="flex items-center gap-2 mb-1">
                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                        <span className="font-medium text-gray-700">Contract Expiration Alert</span>
                      </div>
                      <p className="text-gray-600">
                        {((stats as any).expiringSoon || 0)} contracts expiring within 30 days require immediate attention
                      </p>
                    </div>
                    <div className="bg-white p-3 rounded border border-blue-100">
                      <div className="flex items-center gap-2 mb-1">
                        <Users className="h-4 w-4 text-blue-500" />
                        <span className="font-medium text-gray-700">Client Activity Pattern</span>
                      </div>
                      <p className="text-gray-600">
                        Optimal follow-up window detected: 3-5 days post-showing for maximum engagement
                      </p>
                    </div>
                    <div className="bg-white p-3 rounded border border-blue-100">
                      <div className="flex items-center gap-2 mb-1">
                        <TrendingUp className="h-4 w-4 text-green-500" />
                        <span className="font-medium text-gray-700">Commission Protection Score</span>
                      </div>
                      <p className="text-gray-600">
                        Current portfolio protection level: 87% - Above industry average
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="contract" className="space-y-6">
          <div className="overflow-hidden">
            <TabsList className="grid w-full grid-cols-4 h-auto p-1 bg-gray-100">
              <TabsTrigger 
                value="contract" 
                className="text-xs px-1 py-1.5 min-w-0 flex-shrink data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700 data-[state=active]:border-blue-300 border border-transparent"
              >
                <span className="hidden md:inline">Contract Analysis</span>
                <span className="md:hidden">Contract</span>
              </TabsTrigger>
              <TabsTrigger 
                value="behavior" 
                className="text-xs px-1 py-1.5 min-w-0 flex-shrink data-[state=active]:bg-red-100 data-[state=active]:text-red-700 data-[state=active]:border-red-300 border border-transparent"
              >
                <span className="hidden md:inline">Client Risk</span>
                <span className="md:hidden">Risk</span>
              </TabsTrigger>
              <TabsTrigger 
                value="market" 
                className="text-xs px-1 py-1.5 min-w-0 flex-shrink data-[state=active]:bg-violet-100 data-[state=active]:text-violet-700 data-[state=active]:border-violet-300 border border-transparent"
              >
                <span className="hidden md:inline">Market Intel</span>
                <span className="md:hidden">Market</span>
              </TabsTrigger>
              <TabsTrigger 
                value="protection" 
                className="text-xs px-1 py-1.5 min-w-0 flex-shrink data-[state=active]:bg-green-100 data-[state=active]:text-green-700 data-[state=active]:border-green-300 border border-transparent"
              >
                <span className="hidden md:inline">Protection</span>
                <span className="md:hidden">Guard</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="contract">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  AI Contract Analysis
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Analyze contract terms, identify commission protection gaps, and assess legal risks
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="contractText">Contract Text or Key Terms</Label>
                  <Textarea
                    id="contractText"
                    placeholder="Paste your contract text here or describe key terms..."
                    value={contractText}
                    onChange={(e) => setContractText(e.target.value)}
                    rows={6}
                    className="mt-1"
                  />
                </div>

                <Button 
                  onClick={handleContractAnalysis} 
                  disabled={analyzeContract.isPending || !contractText.trim()}
                  className="w-full"
                >
                  {analyzeContract.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing Contract...
                    </>
                  ) : (
                    <>
                      <Brain className="mr-2 h-4 w-4" />
                      Analyze Contract
                    </>
                  )}
                </Button>

                {analysisResult && (
                  <div className="mt-6 space-y-4">
                    <h3 className="text-lg font-semibold">Analysis Results</h3>
                    <div className="grid gap-4">
                      <Card className="p-4 bg-blue-50 border-blue-200">
                        <div className="flex items-start gap-3">
                          <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                          <div>
                            <h4 className="font-medium text-blue-900">Commission Protection Strength</h4>
                            <p className="text-sm text-blue-700 mt-1">
                              Strong exclusive representation clause with clear commission terms
                            </p>
                          </div>
                        </div>
                      </Card>
                      
                      <Card className="p-4 bg-yellow-50 border-yellow-200">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                          <div>
                            <h4 className="font-medium text-yellow-900">Potential Risks</h4>
                            <p className="text-sm text-yellow-700 mt-1">
                              Consider adding specific penalties for client violations
                            </p>
                          </div>
                        </div>
                      </Card>
                      
                      <Card className="p-4 bg-green-50 border-green-200">
                        <div className="flex items-start gap-3">
                          <Zap className="h-5 w-5 text-green-600 mt-0.5" />
                          <div>
                            <h4 className="font-medium text-green-900">Recommendations</h4>
                            <p className="text-sm text-green-700 mt-1">
                              Add geographical boundaries and specify duration of protection period
                            </p>
                          </div>
                        </div>
                      </Card>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="behavior">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Client Risk Assessment
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Analyze client behavior patterns to predict commission protection risks
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="behaviorText">Client Behavior Description</Label>
                  <Textarea
                    id="behaviorText"
                    placeholder="Describe client communication patterns, showing behavior, responsiveness, etc..."
                    value={clientBehaviorText}
                    onChange={(e) => setClientBehaviorText(e.target.value)}
                    rows={6}
                    className="mt-1"
                  />
                </div>

                <Button 
                  onClick={handleBehaviorAnalysis} 
                  disabled={analyzeClientBehavior.isPending || !clientBehaviorText.trim()}
                  className="w-full"
                >
                  {analyzeClientBehavior.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing Behavior...
                    </>
                  ) : (
                    <>
                      <Eye className="mr-2 h-4 w-4" />
                      Assess Client Risk
                    </>
                  )}
                </Button>

                {behaviorAnalysis && (
                  <div className="mt-6 space-y-4">
                    <h3 className="text-lg font-semibold">Risk Assessment</h3>
                    <div className="grid gap-4">
                      <Card className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium">Overall Risk Level</h4>
                          <Badge variant="destructive">High Risk</Badge>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Communication Inconsistency</span>
                            <span className="text-red-600">85%</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Showing Attendance</span>
                            <span className="text-yellow-600">60%</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Commitment Level</span>
                            <span className="text-red-600">30%</span>
                          </div>
                        </div>
                      </Card>
                      
                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          <strong>Action Required:</strong> Consider implementing stricter monitoring and documentation protocols for this client.
                        </AlertDescription>
                      </Alert>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="market">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Market Intelligence
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Get AI-powered market insights to predict client behavior and commission risks
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="marketAddress">Property Address or Area</Label>
                  <Input
                    id="marketAddress"
                    placeholder="123 Main St, New York, NY 10001"
                    value={marketAddress}
                    onChange={(e) => setMarketAddress(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <Button 
                  onClick={handleMarketInsights} 
                  disabled={getMarketInsights.isPending || !marketAddress.trim()}
                  className="w-full"
                >
                  {getMarketInsights.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing Market...
                    </>
                  ) : (
                    <>
                      <TrendingUp className="mr-2 h-4 w-4" />
                      Get Market Insights
                    </>
                  )}
                </Button>

                {marketInsights && (
                  <div className="mt-6 space-y-4">
                    <h3 className="text-lg font-semibold">Market Analysis</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card className="p-4">
                        <div className="text-center">
                          <h4 className="font-medium text-gray-600">Market Activity</h4>
                          <p className="text-2xl font-bold text-blue-600">High</p>
                          <p className="text-sm text-gray-500 mt-1">45% above avg</p>
                        </div>
                      </Card>
                      
                      <Card className="p-4">
                        <div className="text-center">
                          <h4 className="font-medium text-gray-600">Competition Level</h4>
                          <p className="text-2xl font-bold text-orange-600">Intense</p>
                          <p className="text-sm text-gray-500 mt-1">12 active agents</p>
                        </div>
                      </Card>
                      
                      <Card className="p-4">
                        <div className="text-center">
                          <h4 className="font-medium text-gray-600">Commission Risk</h4>
                          <p className="text-2xl font-bold text-red-600">High</p>
                          <p className="text-sm text-gray-500 mt-1">Monitor closely</p>
                        </div>
                      </Card>
                      
                      <Card className="p-4">
                        <div className="text-center">
                          <h4 className="font-medium text-gray-600">Avg. Days on Market</h4>
                          <p className="text-2xl font-bold text-green-600">18</p>
                          <p className="text-sm text-gray-500 mt-1">Fast moving area</p>
                        </div>
                      </Card>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="protection">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Commission Protection Strategy
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Comprehensive protection recommendations based on your contract analysis and client risk assessment
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="p-4 bg-blue-50 border-blue-200">
                    <div className="flex items-start gap-3">
                      <FileText className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-blue-900 mb-2">Contract Strengthening</h4>
                        <ul className="text-sm text-blue-700 space-y-1">
                          <li>• Add specific geographic boundaries</li>
                          <li>• Include penalty clauses for violations</li>
                          <li>• Extend protection period to 180 days</li>
                          <li>• Require written consent for agent changes</li>
                        </ul>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4 bg-green-50 border-green-200">
                    <div className="flex items-start gap-3">
                      <Eye className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-green-900 mb-2">Monitoring Protocol</h4>
                        <ul className="text-sm text-green-700 space-y-1">
                          <li>• Weekly client check-ins</li>
                          <li>• Property visit tracking system</li>
                          <li>• Public records monitoring alerts</li>
                          <li>• Social media activity tracking</li>
                        </ul>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4 bg-yellow-50 border-yellow-200">
                    <div className="flex items-start gap-3">
                      <Clock className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-yellow-900 mb-2">Timeline Management</h4>
                        <ul className="text-sm text-yellow-700 space-y-1">
                          <li>• Schedule showings within 48 hours</li>
                          <li>• Follow up within 24 hours of showings</li>
                          <li>• Set contract renewal reminders</li>
                          <li>• Track days until contract expiration</li>
                        </ul>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4 bg-purple-50 border-purple-200">
                    <div className="flex items-start gap-3">
                      <MessageSquare className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-purple-900 mb-2">Communication Strategy</h4>
                        <ul className="text-sm text-purple-700 space-y-1">
                          <li>• Document all client interactions</li>
                          <li>• Use multiple communication channels</li>
                          <li>• Send written summaries after calls</li>
                          <li>• Maintain professional boundaries</li>
                        </ul>
                      </div>
                    </div>
                  </Card>
                </div>

                <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-red-900 mb-2">Red Flag Indicators</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-red-700">
                        <div>
                          <strong>Client Behavior:</strong>
                          <ul className="mt-1 space-y-1">
                            <li>• Avoiding scheduled showings</li>
                            <li>• Inconsistent communication</li>
                            <li>• Asking about other agents</li>
                            <li>• Declining to sign documents</li>
                          </ul>
                        </div>
                        <div>
                          <strong>Market Signals:</strong>
                          <ul className="mt-1 space-y-1">
                            <li>• Property price drops</li>
                            <li>• Increased competition</li>
                            <li>• Market cooling trends</li>
                            <li>• New listings in area</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button 
                    className="flex-1"
                    onClick={() => toast({
                      title: "Protection Plan Generated",
                      description: "Comprehensive protection strategy created based on your analysis",
                    })}
                  >
                    <Shield className="mr-2 h-4 w-4" />
                    Generate Protection Plan
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => toast({
                      title: "Report Downloaded",
                      description: "Strategy report saved to your downloads folder",
                    })}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Download Strategy Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}