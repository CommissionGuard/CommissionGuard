import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Bot, 
  MessageSquare, 
  Send, 
  Sparkles, 
  Users, 
  Mail, 
  Phone, 
  Calendar,
  TrendingUp,
  Lightbulb,
  Target,
  Zap
} from "lucide-react";

interface AiAssistantPanelProps {
  selectedClient?: any;
  onClientSelect?: (clientId: number) => void;
}

export default function AiAssistantPanel({ selectedClient, onClientSelect }: AiAssistantPanelProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("campaigns");
  const [messageInput, setMessageInput] = useState("");
  const [inquiryText, setInquiryText] = useState("");
  const [campaignForm, setCampaignForm] = useState({
    campaignType: "",
    targetAudience: "",
    description: ""
  });

  // Fetch drip campaigns
  const { data: campaigns = [], isLoading: loadingCampaigns } = useQuery({
    queryKey: ["/api/drip-campaigns"],
    staleTime: 60000,
  });

  // Fetch clients for selection
  const { data: clients = [] } = useQuery({
    queryKey: ["/api/clients"],
    staleTime: 60000,
  });

  // Create drip campaign mutation
  const createCampaignMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/drip-campaigns", "POST", data),
    onSuccess: () => {
      toast({ title: "Success", description: "AI drip campaign created successfully!" });
      queryClient.invalidateQueries({ queryKey: ["/api/drip-campaigns"] });
      setCampaignForm({ campaignType: "", targetAudience: "", description: "" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to create campaign",
        variant: "destructive" 
      });
    },
  });

  // Generate AI message mutation
  const generateMessageMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/ai/generate-message", "POST", data),
    onSuccess: (data: any) => {
      setMessageInput(data.content);
      toast({ title: "AI Message Generated", description: "Ready to send or customize!" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to generate message",
        variant: "destructive" 
      });
    },
  });

  // Analyze inquiry mutation
  const analyzeInquiryMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/ai/analyze-inquiry", "POST", data),
    onSuccess: (data: any) => {
      toast({ 
        title: "Inquiry Analyzed", 
        description: `Sentiment: ${data.sentiment}, Intent: ${data.intent}, Urgency: ${data.urgency}` 
      });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to analyze inquiry",
        variant: "destructive" 
      });
    },
  });

  // Get follow-up suggestions mutation
  const followUpMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/ai/follow-up-suggestions", "POST", data),
    onSuccess: (data: any) => {
      toast({ 
        title: "Follow-up Suggestions Ready", 
        description: `Generated ${data.suggestions.length} suggestions` 
      });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to get suggestions",
        variant: "destructive" 
      });
    },
  });

  const handleCreateCampaign = () => {
    if (!campaignForm.campaignType || !campaignForm.targetAudience) {
      toast({ 
        title: "Missing Information", 
        description: "Please select campaign type and target audience",
        variant: "destructive" 
      });
      return;
    }
    createCampaignMutation.mutate(campaignForm);
  };

  const handleGenerateMessage = (messageType: string) => {
    if (!selectedClient) {
      toast({ 
        title: "Select Client", 
        description: "Please select a client first",
        variant: "destructive" 
      });
      return;
    }
    generateMessageMutation.mutate({
      messageType,
      clientId: selectedClient.id,
      context: "Follow-up communication"
    });
  };

  const handleAnalyzeInquiry = () => {
    if (!inquiryText.trim()) {
      toast({ 
        title: "Missing Text", 
        description: "Please enter inquiry text to analyze",
        variant: "destructive" 
      });
      return;
    }
    analyzeInquiryMutation.mutate({
      inquiryText,
      clientId: selectedClient?.id
    });
  };

  const handleGetFollowUp = () => {
    if (!selectedClient) {
      toast({ 
        title: "Select Client", 
        description: "Please select a client first",
        variant: "destructive" 
      });
      return;
    }
    followUpMutation.mutate({
      clientId: selectedClient.id,
      context: "Regular follow-up planning"
    });
  };

  return (
    <Card className="bg-white rounded-xl shadow-sm border border-gray-200">
      <CardHeader className="border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-br from-purple-500 to-blue-600 p-2 rounded-lg">
            <Bot className="h-6 w-6 text-white" />
          </div>
          <div>
            <CardTitle className="text-xl font-semibold text-gray-900">AI Assistant</CardTitle>
            <p className="text-gray-600">Automate communication and campaigns</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 rounded-none border-b">
            <TabsTrigger value="campaigns" className="flex items-center space-x-2">
              <Target className="h-4 w-4" />
              <span>Campaigns</span>
            </TabsTrigger>
            <TabsTrigger value="messages" className="flex items-center space-x-2">
              <MessageSquare className="h-4 w-4" />
              <span>Messages</span>
            </TabsTrigger>
            <TabsTrigger value="analysis" className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4" />
              <span>Analysis</span>
            </TabsTrigger>
            <TabsTrigger value="suggestions" className="flex items-center space-x-2">
              <Lightbulb className="h-4 w-4" />
              <span>Follow-up</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="campaigns" className="p-6 space-y-4">
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 flex items-center">
                <Sparkles className="h-4 w-4 mr-2 text-purple-500" />
                Create AI Drip Campaign
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Campaign Type</label>
                  <Select value={campaignForm.campaignType} onValueChange={(value) => 
                    setCampaignForm({...campaignForm, campaignType: value})
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Select campaign type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="welcome">Welcome Series</SelectItem>
                      <SelectItem value="nurture">Lead Nurturing</SelectItem>
                      <SelectItem value="market_updates">Market Updates</SelectItem>
                      <SelectItem value="listing_alerts">Listing Alerts</SelectItem>
                      <SelectItem value="follow_up">Follow-up Series</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Target Audience</label>
                  <Select value={campaignForm.targetAudience} onValueChange={(value) => 
                    setCampaignForm({...campaignForm, targetAudience: value})
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Select target audience" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new_leads">New Leads</SelectItem>
                      <SelectItem value="warm_prospects">Warm Prospects</SelectItem>
                      <SelectItem value="past_clients">Past Clients</SelectItem>
                      <SelectItem value="referrals">Referrals</SelectItem>
                      <SelectItem value="investors">Investors</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description (Optional)</label>
                <Textarea
                  placeholder="Describe your campaign goals and any specific requirements..."
                  value={campaignForm.description}
                  onChange={(e) => setCampaignForm({...campaignForm, description: e.target.value})}
                  rows={3}
                />
              </div>

              <Button
                onClick={handleCreateCampaign}
                disabled={createCampaignMutation.isPending}
                className="w-full bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700"
              >
                {createCampaignMutation.isPending ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Creating Campaign...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Zap className="h-4 w-4 mr-2" />
                    Create AI Campaign
                  </div>
                )}
              </Button>
            </div>

            <Separator />

            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Active Campaigns</h4>
              {loadingCampaigns ? (
                <div className="animate-pulse space-y-2">
                  <div className="h-16 bg-gray-200 rounded"></div>
                  <div className="h-16 bg-gray-200 rounded"></div>
                </div>
              ) : campaigns.length > 0 ? (
                <div className="space-y-2">
                  {campaigns.map((campaign: any) => (
                    <div key={campaign.id} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="font-medium text-gray-900">{campaign.name}</h5>
                          <p className="text-sm text-gray-600">{campaign.description}</p>
                        </div>
                        <Badge variant={campaign.status === "active" ? "default" : "secondary"}>
                          {campaign.status}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                        <span>{campaign.enrolledCount || 0} enrolled</span>
                        <span>{campaign.totalSteps || 0} steps</span>
                        <span>{campaign.targetAudience}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No campaigns created yet</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="messages" className="p-6 space-y-4">
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 flex items-center">
                <Mail className="h-4 w-4 mr-2 text-blue-500" />
                Generate AI Messages
              </h3>

              {selectedClient && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800">
                    <strong>Selected Client:</strong> {selectedClient.fullName} ({selectedClient.email})
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={() => handleGenerateMessage("email")}
                  disabled={generateMessageMutation.isPending || !selectedClient}
                  className="flex items-center justify-center"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Email
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleGenerateMessage("sms")}
                  disabled={generateMessageMutation.isPending || !selectedClient}
                  className="flex items-center justify-center"
                >
                  <Phone className="h-4 w-4 mr-2" />
                  SMS
                </Button>
              </div>

              {messageInput && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Generated Message</label>
                  <Textarea
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    rows={6}
                    className="resize-none"
                  />
                  <Button className="w-full" disabled={!messageInput.trim()}>
                    <Send className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="analysis" className="p-6 space-y-4">
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 flex items-center">
                <TrendingUp className="h-4 w-4 mr-2 text-green-500" />
                Analyze Client Inquiries
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Client Inquiry Text</label>
                <Textarea
                  placeholder="Paste the client's message or inquiry here..."
                  value={inquiryText}
                  onChange={(e) => setInquiryText(e.target.value)}
                  rows={4}
                />
              </div>

              <Button
                onClick={handleAnalyzeInquiry}
                disabled={analyzeInquiryMutation.isPending || !inquiryText.trim()}
                className="w-full"
              >
                {analyzeInquiryMutation.isPending ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Analyzing...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Analyze Inquiry
                  </div>
                )}
              </Button>

              <div className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                <p><strong>AI Analysis includes:</strong></p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>Sentiment analysis (positive, neutral, negative)</li>
                  <li>Intent detection (inquiry type, urgency level)</li>
                  <li>Suggested response approach</li>
                  <li>Key topics and concerns</li>
                </ul>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="suggestions" className="p-6 space-y-4">
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 flex items-center">
                <Lightbulb className="h-4 w-4 mr-2 text-yellow-500" />
                AI Follow-up Suggestions
              </h3>

              {selectedClient ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-sm text-green-800">
                    <strong>Client:</strong> {selectedClient.fullName}
                  </p>
                </div>
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm text-yellow-800">
                    Select a client to get personalized follow-up suggestions
                  </p>
                </div>
              )}

              <Button
                onClick={handleGetFollowUp}
                disabled={followUpMutation.isPending || !selectedClient}
                className="w-full"
              >
                {followUpMutation.isPending ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Generating Suggestions...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Lightbulb className="h-4 w-4 mr-2" />
                    Get Follow-up Suggestions
                  </div>
                )}
              </Button>

              <div className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                <p><strong>AI Suggestions include:</strong></p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>Optimal timing for next contact</li>
                  <li>Recommended communication method</li>
                  <li>Personalized message content</li>
                  <li>Priority level and action items</li>
                </ul>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}