import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import Navbar from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Scale, MapPin, Phone, Mail, Star, FileText } from "lucide-react";

export default function LegalSupport() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();
  const [selectedFirm, setSelectedFirm] = useState<any>(null);
  const [caseDetails, setCaseDetails] = useState("");

  const submitCaseMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/legal-referral", data);
    },
    onSuccess: () => {
      toast({
        title: "Case Submitted",
        description: "Your case has been submitted to the law firm. They will contact you within 24 hours.",
      });
      setCaseDetails("");
      setSelectedFirm(null);
      queryClient.invalidateQueries({ queryKey: ["/api/alerts"] });
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
        title: "Error",
        description: "Failed to submit case. Please try again.",
        variant: "destructive",
      });
    },
  });

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

  // Sample law firms - in production this would come from your partner program
  const lawFirms = [
    {
      id: 1,
      name: "Henderson & Associates Real Estate Law",
      specialization: "Real Estate Commission Disputes",
      location: "New York, NY",
      rating: 4.9,
      cases: 150,
      phone: "(555) 123-4567",
      email: "cases@hendersonlaw.com",
      description: "Specializing in real estate commission protection with over 15 years of experience in agent representation.",
      successRate: "94%",
      avgResponse: "2 hours"
    },
    {
      id: 2,
      name: "Miller Property Law Group",
      specialization: "Contract Breach & Commission Recovery",
      location: "Los Angeles, CA",
      rating: 4.8,
      cases: 230,
      phone: "(555) 987-6543",
      email: "support@millerlaw.com",
      description: "Dedicated to protecting real estate professionals' income through aggressive contract enforcement.",
      successRate: "91%",
      avgResponse: "4 hours"
    },
    {
      id: 3,
      name: "Thompson Real Estate Legal",
      specialization: "Agent Rights & Commission Protection",
      location: "Chicago, IL",
      rating: 4.7,
      cases: 89,
      phone: "(555) 456-7890",
      email: "intake@thompsonlegal.com",
      description: "Boutique firm focused exclusively on real estate agent legal matters and commission disputes.",
      successRate: "89%",
      avgResponse: "6 hours"
    }
  ];

  const handleSubmitCase = () => {
    if (!selectedFirm || !caseDetails.trim()) {
      toast({
        title: "Missing Information",
        description: "Please select a law firm and provide case details.",
        variant: "destructive",
      });
      return;
    }

    submitCaseMutation.mutate({
      firmId: selectedFirm.id,
      firmName: selectedFirm.name,
      caseDetails: caseDetails.trim(),
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Legal Support Network</h1>
          <p className="text-gray-600 mt-1">Connect with vetted real estate law firms specializing in commission protection</p>
        </div>

        {/* Commission Guard Legal Benefits */}
        <Card className="bg-gradient-to-r from-primary to-blue-600 text-white rounded-xl shadow-sm mb-8">
          <CardContent className="p-6">
            <div className="flex items-center mb-4">
              <Scale className="h-8 w-8 mr-3" />
              <h2 className="text-xl font-semibold">Legal Protection Included</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h3 className="font-semibold mb-2">Expert Referrals</h3>
                <p className="text-blue-100 text-sm">Access to vetted law firms specializing in real estate commission disputes</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Proven Track Record</h3>
                <p className="text-blue-100 text-sm">Partner firms with 85%+ success rate in commission recovery cases</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Priority Support</h3>
                <p className="text-blue-100 text-sm">Commission Guard subscribers receive expedited case review and consultation</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Law Firm Directory */}
          <div className="lg:col-span-2">
            <Card className="bg-white rounded-xl shadow-sm border border-gray-200">
              <CardHeader className="border-b border-gray-200">
                <CardTitle className="text-xl font-semibold text-gray-900">Partner Law Firms</CardTitle>
                <p className="text-gray-600">Exclusive network of real estate commission specialists</p>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-6 p-6">
                  {lawFirms.map((firm) => (
                    <div 
                      key={firm.id} 
                      className={`border rounded-lg p-6 cursor-pointer transition-all ${
                        selectedFirm?.id === firm.id 
                          ? "border-primary bg-blue-50" 
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => setSelectedFirm(firm)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{firm.name}</h3>
                            <div className="flex items-center">
                              <Star className="h-4 w-4 text-yellow-400 fill-current" />
                              <span className="text-sm text-gray-600 ml-1">{firm.rating}</span>
                            </div>
                          </div>
                          <p className="text-primary font-medium text-sm mb-2">{firm.specialization}</p>
                          <p className="text-gray-600 text-sm mb-3">{firm.description}</p>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-gray-500">Location</p>
                              <p className="font-medium flex items-center">
                                <MapPin className="h-3 w-3 mr-1" />
                                {firm.location}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-500">Success Rate</p>
                              <p className="font-medium text-success">{firm.successRate}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Cases Handled</p>
                              <p className="font-medium">{firm.cases}+</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Avg Response</p>
                              <p className="font-medium">{firm.avgResponse}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-4 mt-3 text-sm text-gray-600">
                            <div className="flex items-center">
                              <Phone className="h-3 w-3 mr-1" />
                              {firm.phone}
                            </div>
                            <div className="flex items-center">
                              <Mail className="h-3 w-3 mr-1" />
                              {firm.email}
                            </div>
                          </div>
                        </div>
                        {selectedFirm?.id === firm.id && (
                          <Badge className="bg-primary text-white">Selected</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Case Submission */}
          <div>
            <Card className="bg-white rounded-xl shadow-sm border border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                  <FileText className="text-primary mr-2" />
                  Submit Your Case
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedFirm ? (
                  <div className="space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900">{selectedFirm.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{selectedFirm.specialization}</p>
                    </div>
                    
                    <div>
                      <Label htmlFor="caseDetails" className="block text-sm font-medium text-gray-700 mb-2">
                        Case Details *
                      </Label>
                      <Textarea
                        id="caseDetails"
                        placeholder="Describe your commission dispute, breach details, client information, and any supporting documentation you have..."
                        value={caseDetails}
                        onChange={(e) => setCaseDetails(e.target.value)}
                        rows={6}
                        className="w-full"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Provide as much detail as possible to help the law firm assess your case.
                      </p>
                    </div>

                    <Button
                      onClick={handleSubmitCase}
                      disabled={submitCaseMutation.isPending || !caseDetails.trim()}
                      className="w-full bg-primary text-white hover:bg-blue-700"
                    >
                      {submitCaseMutation.isPending ? "Submitting..." : "Submit Case for Review"}
                    </Button>

                    <div className="text-xs text-gray-500 space-y-1">
                      <p>• Free initial consultation for Commission Guard subscribers</p>
                      <p>• Firm will contact you within 24 hours</p>
                      <p>• No upfront legal fees - contingency basis available</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Scale className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Law Firm</h3>
                    <p className="text-gray-600 text-sm">Choose a legal partner from our verified network to proceed with your case submission.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Legal Process Guide */}
            <Card className="bg-white rounded-xl shadow-sm border border-gray-200 mt-6">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">How It Works</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-sm">
                  <div className="flex items-start space-x-3">
                    <div className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-semibold">1</div>
                    <div>
                      <p className="font-medium">Submit Your Case</p>
                      <p className="text-gray-600">Provide details about your commission dispute</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-semibold">2</div>
                    <div>
                      <p className="font-medium">Legal Review</p>
                      <p className="text-gray-600">Firm evaluates your case within 24 hours</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-semibold">3</div>
                    <div>
                      <p className="font-medium">Legal Action</p>
                      <p className="text-gray-600">Pursue recovery of your rightful commission</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}