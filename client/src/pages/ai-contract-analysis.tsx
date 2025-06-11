import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import Navbar from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Brain, 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp, 
  Shield,
  Lightbulb,
  Target,
  Upload,
  Sparkles
} from "lucide-react";

export default function AIContractAnalysis() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [contractText, setContractText] = useState("");
  const [selectedContract, setSelectedContract] = useState("");
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  const { data: contracts } = useQuery({
    queryKey: ["/api/contracts"],
    enabled: isAuthenticated,
  });

  const analyzeContractMutation = useMutation({
    mutationFn: async (data: { contractText: string; contractId?: number }) => {
      return await apiRequest("POST", "/api/ai/analyze-contract", data);
    },
    onSuccess: (result) => {
      setAnalysisResult(result);
      toast({
        title: "Analysis Complete",
        description: "AI contract analysis has been completed successfully.",
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
        title: "Analysis Failed",
        description: "Failed to analyze contract. Please try again.",
        variant: "destructive",
      });
    },
  });

  const getRecommendationsMutation = useMutation({
    mutationFn: async (contractData: any) => {
      return await apiRequest("POST", "/api/ai/commission-recommendations", contractData);
    },
    onSuccess: (result) => {
      setAnalysisResult(prev => ({ ...prev, recommendations: result }));
      toast({
        title: "Recommendations Generated",
        description: "AI-powered commission protection recommendations are ready.",
      });
    },
    onError: (error) => {
      toast({
        title: "Recommendations Failed",
        description: "Failed to generate recommendations. Please try again.",
        variant: "destructive",
      });
    },
  });

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

  const handleAnalyzeContract = () => {
    if (!contractText.trim()) {
      toast({
        title: "Contract Text Required",
        description: "Please enter contract text or select an existing contract.",
        variant: "destructive",
      });
      return;
    }

    analyzeContractMutation.mutate({
      contractText,
      contractId: selectedContract ? parseInt(selectedContract) : undefined,
    });
  };

  const handleLoadExistingContract = (contractId: string) => {
    const contract = contracts?.find((c: any) => c.id.toString() === contractId);
    if (contract) {
      setSelectedContract(contractId);
      setContractText(contract.contractText || "Sample contract text for analysis...");
    }
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case "low": return "bg-green-100 text-green-800 border-green-200";
      case "medium": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "high": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case "low": return <CheckCircle className="h-4 w-4" />;
      case "medium": return <AlertTriangle className="h-4 w-4" />;
      case "high": return <AlertTriangle className="h-4 w-4" />;
      default: return <Shield className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">AI Contract Analysis</h1>
          </div>
          <p className="text-gray-600">
            Use advanced AI to analyze representation agreements for potential risks and commission protection opportunities
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Input Section */}
          <div className="xl:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <span>Contract Input</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Load Existing Contract (Optional)
                  </label>
                  <Select value={selectedContract} onValueChange={handleLoadExistingContract}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a contract to analyze" />
                    </SelectTrigger>
                    <SelectContent>
                      {contracts?.map((contract: any) => (
                        <SelectItem key={contract.id} value={contract.id.toString()}>
                          {contract.client?.fullName || "Unknown Client"} - {contract.representationType}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Contract Text
                  </label>
                  <Textarea
                    value={contractText}
                    onChange={(e) => setContractText(e.target.value)}
                    placeholder="Paste your representation agreement text here for AI analysis..."
                    className="min-h-[300px] font-mono text-sm"
                  />
                </div>

                <div className="flex space-x-3">
                  <Button
                    onClick={handleAnalyzeContract}
                    disabled={analyzeContractMutation.isPending}
                    className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700"
                  >
                    {analyzeContractMutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Analyze with AI
                      </>
                    )}
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => {
                      setContractText("");
                      setSelectedContract("");
                      setAnalysisResult(null);
                    }}
                  >
                    Clear
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Analysis Results */}
            {analysisResult && (
              <div className="space-y-6">
                {/* Risk Assessment */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Shield className="h-5 w-5 text-primary" />
                      <span>Risk Assessment</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <Badge className={`${getRiskColor(analysisResult.riskLevel)} border`}>
                          {getRiskIcon(analysisResult.riskLevel)}
                          <span className="ml-1 capitalize">{analysisResult.riskLevel} Risk</span>
                        </Badge>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Overall Protection Score</p>
                        <Progress 
                          value={analysisResult.riskLevel === "low" ? 85 : analysisResult.riskLevel === "medium" ? 60 : 25} 
                          className="w-32 mt-1"
                        />
                      </div>
                    </div>

                    {analysisResult.riskFactors && analysisResult.riskFactors.length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-medium text-gray-900 mb-2">Risk Factors</h4>
                        <ul className="space-y-2">
                          {analysisResult.riskFactors.map((factor: string, index: number) => (
                            <li key={index} className="flex items-start space-x-2">
                              <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-gray-700">{factor}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {analysisResult.commissionTerms && (
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-medium text-blue-900 mb-2">Commission Terms</h4>
                        <p className="text-sm text-blue-800">{analysisResult.commissionTerms}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Recommendations */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Lightbulb className="h-5 w-5 text-primary" />
                      <span>AI Recommendations</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {analysisResult.recommendations && analysisResult.recommendations.length > 0 ? (
                      <ul className="space-y-3">
                        {analysisResult.recommendations.map((rec: string, index: number) => (
                          <li key={index} className="flex items-start space-x-2">
                            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-gray-700">{rec}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-center py-4">
                        <Button
                          onClick={() => getRecommendationsMutation.mutate({
                            clientName: "AI Analysis Client",
                            contractType: "Representation Agreement",
                            startDate: new Date().toISOString(),
                            endDate: analysisResult.expirationDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
                            currentIssues: analysisResult.riskFactors
                          })}
                          disabled={getRecommendationsMutation.isPending}
                          variant="outline"
                        >
                          {getRecommendationsMutation.isPending ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                              Generating...
                            </>
                          ) : (
                            <>
                              <Target className="h-4 w-4 mr-2" />
                              Generate Protection Recommendations
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Potential Issues */}
                {analysisResult.potentialIssues && analysisResult.potentialIssues.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <AlertTriangle className="h-5 w-5 text-amber-500" />
                        <span>Potential Issues</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {analysisResult.potentialIssues.map((issue: string, index: number) => (
                          <Alert key={index} className="border-amber-200 bg-amber-50">
                            <AlertTriangle className="h-4 w-4 text-amber-600" />
                            <AlertDescription className="text-amber-800">
                              {issue}
                            </AlertDescription>
                          </Alert>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* AI Features Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Brain className="h-5 w-5 text-purple-600" />
                  <span>AI Analysis Features</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start space-x-3">
                  <Shield className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Risk Detection</p>
                    <p className="text-xs text-gray-600">Identify potential commission risks</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Term Analysis</p>
                    <p className="text-xs text-gray-600">Extract key contract terms</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Target className="h-5 w-5 text-purple-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Smart Recommendations</p>
                    <p className="text-xs text-gray-600">Get actionable protection strategies</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Issue Flagging</p>
                    <p className="text-xs text-gray-600">Highlight potential problems</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Contract File
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  Analyze All Contracts
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  View Risk Trends
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}