import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import Navbar from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Scale, 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
  Shield,
  Lightbulb,
  Upload,
  Sparkles,
  BookOpen,
  Users,
  Gavel,
  Clock
} from "lucide-react";

export default function LegalSupport() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [documentText, setDocumentText] = useState("");
  const [documentType, setDocumentType] = useState("");
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [activeTemplate, setActiveTemplate] = useState("");

  const analyzeLegalDocumentMutation = useMutation({
    mutationFn: async (data: { documentText: string; documentType: string }) => {
      return await apiRequest("POST", "/api/ai/legal-analysis", data);
    },
    onSuccess: (result) => {
      setAnalysisResult(result);
      toast({
        title: "Legal Analysis Complete",
        description: "AI-powered legal document analysis has been completed.",
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
        description: "Failed to analyze legal document. Please try again.",
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

  const handleAnalyzeDocument = () => {
    if (!documentText.trim()) {
      toast({
        title: "Document Text Required",
        description: "Please enter document text for analysis.",
        variant: "destructive",
      });
      return;
    }

    if (!documentType) {
      toast({
        title: "Document Type Required",
        description: "Please select a document type.",
        variant: "destructive",
      });
      return;
    }

    analyzeLegalDocumentMutation.mutate({
      documentText,
      documentType,
    });
  };

  const loadTemplate = (templateType: string) => {
    setActiveTemplate(templateType);
    setDocumentType(templateType);
    
    const templates = {
      "listing_agreement": `EXCLUSIVE LISTING AGREEMENT

This Exclusive Listing Agreement ("Agreement") is entered into on [DATE] between [AGENT_NAME] ("Agent") and [CLIENT_NAME] ("Seller").

1. PROPERTY DESCRIPTION
   Address: [PROPERTY_ADDRESS]
   Legal Description: [LEGAL_DESCRIPTION]

2. LISTING PRICE AND TERMS
   Listing Price: $[LISTING_PRICE]
   Terms: [TERMS]

3. COMMISSION
   The Seller agrees to pay Agent a commission of [COMMISSION_RATE]% of the gross sales price upon successful sale of the Property.

4. EXCLUSIVE REPRESENTATION PERIOD
   This Agreement shall commence on [START_DATE] and terminate on [END_DATE].

5. MARKETING AUTHORIZATION
   Agent is authorized to market the Property through MLS, advertising, and other promotional activities.

6. COMMISSION PROTECTION
   If the Property is sold to any buyer procured by Agent during the listing period or within [PROTECTION_PERIOD] days after expiration, commission is due.

7. SELLER OBLIGATIONS
   Seller agrees to refer all inquiries to Agent and cooperate in marketing efforts.

This Agreement shall be binding upon heirs, successors, and assigns.

_____________________        _____________________
Seller Signature             Agent Signature

Date: _______________        Date: _______________`,

      "buyer_agreement": `EXCLUSIVE BUYER REPRESENTATION AGREEMENT

This Agreement is entered into on [DATE] between [AGENT_NAME] ("Agent") and [CLIENT_NAME] ("Buyer").

1. EXCLUSIVE REPRESENTATION
   Buyer grants Agent the exclusive right to represent Buyer in the purchase of real estate.

2. TERM
   This Agreement shall commence on [START_DATE] and terminate on [END_DATE].

3. PROPERTY CRITERIA
   Price Range: $[MIN_PRICE] - $[MAX_PRICE]
   Location: [PREFERRED_AREAS]
   Property Type: [PROPERTY_TYPE]

4. AGENT DUTIES
   - Show properties matching Buyer's criteria
   - Provide market analysis and guidance
   - Negotiate purchase terms
   - Assist through closing process

5. COMMISSION
   Agent commission of [COMMISSION_RATE]% shall be paid from the purchase transaction or by Buyer if no commission is offered.

6. COMMISSION PROTECTION
   If Buyer purchases property shown by Agent within [PROTECTION_PERIOD] days after agreement termination, commission is due.

7. BUYER OBLIGATIONS
   Buyer agrees to work exclusively with Agent and provide financial qualification documentation.

_____________________        _____________________
Buyer Signature              Agent Signature

Date: _______________        Date: _______________`,

      "commission_dispute": `COMMISSION DISPUTE RESOLUTION AGREEMENT

This Agreement addresses commission disputes between [AGENT_NAME] ("Claimant Agent") and [OTHER_PARTY] ("Respondent") regarding property at [PROPERTY_ADDRESS].

1. DISPUTE SUMMARY
   Transaction Date: [TRANSACTION_DATE]
   Sale Price: $[SALE_PRICE]
   Disputed Commission: $[DISPUTED_AMOUNT]

2. BASIS OF CLAIM
   [DETAILED_CLAIM_DESCRIPTION]

3. SUPPORTING DOCUMENTATION
   - Signed representation agreement dated [AGREEMENT_DATE]
   - Evidence of procuring cause: [EVIDENCE]
   - Communication records: [RECORDS]

4. RESOLUTION PROCESS
   The parties agree to resolve this dispute through:
   □ Direct negotiation
   □ Mediation through [MEDIATOR]
   □ Arbitration per NAR guidelines
   □ Legal proceedings

5. COMMISSION PROTECTION CLAUSE
   Reference to specific contract provisions protecting Agent's commission rights.

6. TIMELINE
   Resolution efforts must commence within [DAYS] days of this agreement.

This dispute resolution agreement is binding and enforceable.

_____________________        _____________________
Claimant Signature           Respondent Signature

Date: _______________        Date: _______________`
    };

    setDocumentText(templates[templateType as keyof typeof templates] || "");
  };

  const getComplianceColor = (compliance: string) => {
    switch (compliance) {
      case "compliant": return "bg-green-100 text-green-800 border-green-200";
      case "non-compliant": return "bg-red-100 text-red-800 border-red-200";
      case "needs-review": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getComplianceIcon = (compliance: string) => {
    switch (compliance) {
      case "compliant": return <CheckCircle className="h-4 w-4" />;
      case "non-compliant": return <AlertTriangle className="h-4 w-4" />;
      case "needs-review": return <Clock className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
              <Scale className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Legal Support Center</h1>
          </div>
          <p className="text-gray-600">
            AI-powered legal document analysis, compliance checking, and commission protection templates
          </p>
        </div>

        <Tabs defaultValue="analysis" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="analysis">Document Analysis</TabsTrigger>
            <TabsTrigger value="templates">Legal Templates</TabsTrigger>
            <TabsTrigger value="resources">Legal Resources</TabsTrigger>
          </TabsList>

          {/* Document Analysis Tab */}
          <TabsContent value="analysis">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              <div className="xl:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Gavel className="h-5 w-5 text-primary" />
                      <span>Legal Document Analysis</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Document Type
                      </label>
                      <Select value={documentType} onValueChange={setDocumentType}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select document type for analysis" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="listing_agreement">Listing Agreement</SelectItem>
                          <SelectItem value="buyer_agreement">Buyer Representation Agreement</SelectItem>
                          <SelectItem value="purchase_contract">Purchase Contract</SelectItem>
                          <SelectItem value="commission_dispute">Commission Dispute</SelectItem>
                          <SelectItem value="lease_agreement">Lease Agreement</SelectItem>
                          <SelectItem value="disclosure_form">Disclosure Form</SelectItem>
                          <SelectItem value="addendum">Contract Addendum</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Document Text
                      </label>
                      <Textarea
                        value={documentText}
                        onChange={(e) => setDocumentText(e.target.value)}
                        placeholder="Paste your legal document text here for AI-powered compliance analysis..."
                        className="min-h-[400px] font-mono text-sm"
                      />
                    </div>

                    <div className="flex space-x-3">
                      <Button
                        onClick={handleAnalyzeDocument}
                        disabled={analyzeLegalDocumentMutation.isPending}
                        className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                      >
                        {analyzeLegalDocumentMutation.isPending ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4 mr-2" />
                            Analyze Legal Document
                          </>
                        )}
                      </Button>
                      
                      <Button
                        variant="outline"
                        onClick={() => {
                          setDocumentText("");
                          setDocumentType("");
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
                    {/* Compliance Status */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <Shield className="h-5 w-5 text-primary" />
                          <span>Compliance Assessment</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between mb-4">
                          <Badge className={`${getComplianceColor(analysisResult.compliance)} border`}>
                            {getComplianceIcon(analysisResult.compliance)}
                            <span className="ml-1 capitalize">{analysisResult.compliance.replace("-", " ")}</span>
                          </Badge>
                        </div>

                        {analysisResult.issues && analysisResult.issues.length > 0 && (
                          <div className="mb-4">
                            <h4 className="font-medium text-gray-900 mb-2">Compliance Issues</h4>
                            <ul className="space-y-2">
                              {analysisResult.issues.map((issue: string, index: number) => (
                                <li key={index} className="flex items-start space-x-2">
                                  <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                                  <span className="text-sm text-gray-700">{issue}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {analysisResult.legalRisks && analysisResult.legalRisks.length > 0 && (
                          <div className="bg-red-50 p-4 rounded-lg">
                            <h4 className="font-medium text-red-900 mb-2">Legal Risks Identified</h4>
                            <ul className="space-y-1">
                              {analysisResult.legalRisks.map((risk: string, index: number) => (
                                <li key={index} className="text-sm text-red-800">• {risk}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Suggestions */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <Lightbulb className="h-5 w-5 text-primary" />
                          <span>Legal Recommendations</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {analysisResult.suggestions && analysisResult.suggestions.length > 0 && (
                          <ul className="space-y-3">
                            {analysisResult.suggestions.map((suggestion: string, index: number) => (
                              <li key={index} className="flex items-start space-x-2">
                                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                <span className="text-sm text-gray-700">{suggestion}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </CardContent>
                    </Card>

                    {/* Required Actions */}
                    {analysisResult.requiredActions && analysisResult.requiredActions.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center space-x-2">
                            <AlertTriangle className="h-5 w-5 text-amber-500" />
                            <span>Required Actions</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2">
                            {analysisResult.requiredActions.map((action: string, index: number) => (
                              <Alert key={index} className="border-amber-200 bg-amber-50">
                                <AlertTriangle className="h-4 w-4 text-amber-600" />
                                <AlertDescription className="text-amber-800">
                                  {action}
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
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Scale className="h-5 w-5 text-indigo-600" />
                      <span>Legal AI Features</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <Shield className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-sm">Compliance Check</p>
                        <p className="text-xs text-gray-600">Verify legal requirements</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-sm">Risk Assessment</p>
                        <p className="text-xs text-gray-600">Identify potential legal issues</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Lightbulb className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-sm">Smart Suggestions</p>
                        <p className="text-xs text-gray-600">Get improvement recommendations</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button variant="outline" className="w-full justify-start">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Document
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <FileText className="h-4 w-4 mr-2" />
                      Generate Report
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Users className="h-4 w-4 mr-2" />
                      Consult Attorney
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Legal Templates Tab */}
          <TabsContent value="templates">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="h-5 w-5 text-primary" />
                    <span>Commission Protection Templates</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <Button
                      variant={activeTemplate === "listing_agreement" ? "default" : "outline"}
                      onClick={() => loadTemplate("listing_agreement")}
                      className="h-auto p-4 flex flex-col items-start"
                    >
                      <div className="flex items-center space-x-2 mb-2">
                        <FileText className="h-5 w-5" />
                        <span className="font-medium">Listing Agreement</span>
                      </div>
                      <p className="text-xs text-left opacity-75">Exclusive listing with commission protection</p>
                    </Button>

                    <Button
                      variant={activeTemplate === "buyer_agreement" ? "default" : "outline"}
                      onClick={() => loadTemplate("buyer_agreement")}
                      className="h-auto p-4 flex flex-col items-start"
                    >
                      <div className="flex items-center space-x-2 mb-2">
                        <Users className="h-5 w-5" />
                        <span className="font-medium">Buyer Agreement</span>
                      </div>
                      <p className="text-xs text-left opacity-75">Exclusive buyer representation contract</p>
                    </Button>

                    <Button
                      variant={activeTemplate === "commission_dispute" ? "default" : "outline"}
                      onClick={() => loadTemplate("commission_dispute")}
                      className="h-auto p-4 flex flex-col items-start"
                    >
                      <div className="flex items-center space-x-2 mb-2">
                        <Gavel className="h-5 w-5" />
                        <span className="font-medium">Dispute Resolution</span>
                      </div>
                      <p className="text-xs text-left opacity-75">Commission dispute documentation</p>
                    </Button>
                  </div>

                  {documentText && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium">Template Preview</h3>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">Download PDF</Button>
                          <Button size="sm" variant="outline">Copy Text</Button>
                        </div>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <pre className="whitespace-pre-wrap text-sm font-mono">{documentText}</pre>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Legal Resources Tab */}
          <TabsContent value="resources">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    <span>Legal Knowledge Base</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                      <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-blue-900">Commission Protection Laws</h4>
                        <p className="text-sm text-blue-700">State-specific regulations and requirements</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                      <Gavel className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-green-900">Dispute Resolution Guidelines</h4>
                        <p className="text-sm text-green-700">NAR arbitration and mediation procedures</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 p-3 bg-purple-50 rounded-lg">
                      <Users className="h-5 w-5 text-purple-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-purple-900">Representation Agreements</h4>
                        <p className="text-sm text-purple-700">Best practices for client relationships</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-primary" />
                    <span>Legal Support Services</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full justify-start h-auto p-4">
                      <div className="flex items-start space-x-3">
                        <Scale className="h-5 w-5 text-indigo-600 mt-0.5" />
                        <div className="text-left">
                          <div className="font-medium">Attorney Consultation</div>
                          <div className="text-sm text-gray-600">30-minute legal review session</div>
                        </div>
                      </div>
                    </Button>
                    <Button variant="outline" className="w-full justify-start h-auto p-4">
                      <div className="flex items-start space-x-3">
                        <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div className="text-left">
                          <div className="font-medium">Document Review</div>
                          <div className="text-sm text-gray-600">Professional contract analysis</div>
                        </div>
                      </div>
                    </Button>
                    <Button variant="outline" className="w-full justify-start h-auto p-4">
                      <div className="flex items-start space-x-3">
                        <Gavel className="h-5 w-5 text-red-600 mt-0.5" />
                        <div className="text-left">
                          <div className="font-medium">Dispute Assistance</div>
                          <div className="text-sm text-gray-600">Commission claim support</div>
                        </div>
                      </div>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}