import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useLocation } from "wouter";
import Navbar from "@/components/navbar";
import AnimatedBackground from "@/components/animated-background";
import AiAssistantPanel from "@/components/ai-assistant-panel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  Search, 
  Users, 
  Phone, 
  Mail, 
  Calendar, 
  TrendingUp, 
  Target,
  Star,
  Clock,
  DollarSign,
  Home
} from "lucide-react";

export default function Prospecting() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [selectedClient, setSelectedClient] = useState<any>(null);

  // Handler functions for prospecting buttons
  const handleGenerateLeads = () => {
    toast({
      title: "Lead Generation Started",
      description: "Analyzing market data to generate new prospect leads. This may take a few minutes.",
    });
    // In a real implementation, this would trigger an API call to generate leads
  };

  const handlePropertyMatch = () => {
    toast({
      title: "Property Matching",
      description: "Property matching feature will be available in the next update.",
    });
  };

  const handleAddToCRM = () => {
    // Navigate to clients page to add new client
    setLocation("/clients");
  };
  const [searchCriteria, setSearchCriteria] = useState({
    location: "",
    priceRange: "",
    propertyType: ""
  });

  const handleCardClick = (cardTitle: string) => {
    switch (cardTitle) {
      case "Active Prospects":
        setLocation("/clients");
        break;
      case "Conversion Rate":
        setLocation("/clients");
        break;
      case "Follow-ups Due":
        setLocation("/showing-tracker");
        break;
      case "Pipeline Value":
        setLocation("/commission-tracker");
        break;
      default:
        break;
    }
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

  // Fetch prospecting data
  const { data: clients = [], isLoading: isLoadingClients } = useQuery({
    queryKey: ["/api/clients"],
    enabled: isAuthenticated,
    staleTime: 60000,
  });

  const { data: showings = [], isLoading: isLoadingShowings } = useQuery({
    queryKey: ["/api/showings"],
    enabled: isAuthenticated,
    staleTime: 60000,
  });

  const { data: commissionData = [], isLoading: isLoadingCommission } = useQuery({
    queryKey: ["/api/commission-protection"],
    enabled: isAuthenticated,
    staleTime: 60000,
  });

  // Calculate prospecting stats
  const activeProspects = Array.isArray(clients) ? clients.filter((client: any) => !client.isConverted).length : 0;
  const convertedClients = Array.isArray(clients) ? clients.filter((client: any) => client.isConverted).length : 0;
  const conversionRate = Array.isArray(clients) && clients.length > 0 ? Math.round((convertedClients / clients.length) * 100) : 0;
  
  // Calculate follow-ups due (showings/meetings scheduled for today or overdue)
  const today = new Date();
  const followUpsDue = Array.isArray(showings) ? showings.filter((showing: any) => {
    const showingDate = new Date(showing.scheduledDate);
    return showingDate.toDateString() === today.toDateString() || showingDate < today;
  }).length : 0;

  // Calculate pipeline value from commission protection records
  const pipelineValue = Array.isArray(commissionData) ? 
    commissionData.reduce((sum: number, item: any) => sum + (item.estimatedCommission || 0), 0) : 0;

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}K`;
    }
    return `$${amount.toLocaleString()}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-32 w-32 border-4 border-gray-200"></div>
            <div className="animate-spin rounded-full h-32 w-32 border-4 border-primary border-t-transparent absolute top-0"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Target className="h-8 w-8 text-primary animate-pulse" />
            </div>
          </div>
          <p className="mt-6 text-gray-700 font-medium">Loading prospecting tools...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 relative">
      <AnimatedBackground />
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <div className="bg-gradient-to-br from-primary to-blue-600 p-3 rounded-xl shadow-lg">
              <Target className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Client Prospecting
              </h1>
              <p className="text-gray-600 mt-1">Identify and track potential clients with advanced targeting</p>
            </div>
          </div>
        </div>

        {/* Prospecting Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card 
            className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
            onClick={() => handleCardClick("Active Prospects")}
          >
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Active Prospects</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {isLoadingClients ? "..." : activeProspects}
                  </p>
                </div>
                <div className="bg-blue-100 rounded-full p-3">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="flex items-center mt-4 text-sm">
                <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></div>
                <span className="text-blue-600 font-medium ml-1">Active</span>
                <span className="text-gray-600 ml-1">prospects</span>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
            onClick={() => handleCardClick("Conversion Rate")}
          >
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Conversion Rate</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {isLoadingClients ? "..." : `${conversionRate}%`}
                  </p>
                </div>
                <div className="bg-green-100 rounded-full p-3">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="flex items-center mt-4 text-sm">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                <span className="text-green-600 font-medium">
                  {conversionRate >= 50 ? "Above average" : "Growing"}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
            onClick={() => handleCardClick("Follow-ups Due")}
          >
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Follow-ups Due</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {isLoadingShowings ? "..." : followUpsDue}
                  </p>
                </div>
                <div className={`rounded-full p-3 ${followUpsDue > 0 ? 'bg-yellow-100' : 'bg-green-100'}`}>
                  <Clock className={`h-6 w-6 ${followUpsDue > 0 ? 'text-yellow-600' : 'text-green-600'}`} />
                </div>
              </div>
              <div className="flex items-center mt-4 text-sm">
                <div className={`w-2 h-2 rounded-full animate-pulse ${followUpsDue > 0 ? 'bg-yellow-400' : 'bg-green-400'}`}></div>
                <span className={`font-medium ml-1 ${followUpsDue > 0 ? 'text-yellow-600' : 'text-green-600'}`}>
                  {followUpsDue > 0 ? "Action needed" : "All caught up"}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
            onClick={() => handleCardClick("Pipeline Value")}
          >
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Pipeline Value</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {isLoadingCommission ? "..." : formatCurrency(pipelineValue)}
                  </p>
                </div>
                <div className="bg-purple-100 rounded-full p-3">
                  <DollarSign className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <div className="flex items-center mt-4 text-sm">
                <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></div>
                <span className="text-purple-600 font-medium">Protected</span>
                <span className="text-gray-600 ml-1">commissions</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Lead Generation Tools */}
          <div className="lg:col-span-2 space-y-6">
            {/* Search & Targeting */}
            <Card className="bg-white rounded-xl shadow-sm border border-gray-200">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900 flex items-center">
                  <Search className="text-primary mr-2" />
                  Lead Generation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                    <Input
                      placeholder="City, ZIP, or area"
                      value={searchCriteria.location}
                      onChange={(e) => setSearchCriteria({...searchCriteria, location: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
                    <Input
                      placeholder="e.g., $300K-$500K"
                      value={searchCriteria.priceRange}
                      onChange={(e) => setSearchCriteria({...searchCriteria, priceRange: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Property Type</label>
                    <Input
                      placeholder="Single family, condo, etc."
                      value={searchCriteria.propertyType}
                      onChange={(e) => setSearchCriteria({...searchCriteria, propertyType: e.target.value})}
                    />
                  </div>
                </div>
                <Button 
                  className="w-full bg-gradient-to-r from-primary to-blue-600 hover:from-blue-600 hover:to-purple-600 transition-all duration-300"
                  onClick={handleGenerateLeads}
                >
                  <Target className="h-4 w-4 mr-2" />
                  Generate Leads
                </Button>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                  <p className="text-sm text-blue-800">
                    <strong>Professional Lead Generation:</strong> Connect with real estate data providers to access 
                    homeowner databases, expired listings, and FSBO leads for targeted prospecting campaigns.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Active Prospects */}
            <Card className="bg-white rounded-xl shadow-sm border border-gray-200">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900 flex items-center">
                  <Users className="text-primary mr-2" />
                  Active Prospects
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: "Sarah Johnson", email: "sarah.j@email.com", phone: "(555) 123-4567", status: "Hot", progress: 85, lastContact: "2 days ago", interest: "Downtown Condo" },
                    { name: "Mike Chen", email: "mike.chen@email.com", phone: "(555) 234-5678", status: "Warm", progress: 60, lastContact: "1 week ago", interest: "Suburban Home" },
                    { name: "Lisa Rodriguez", email: "lisa.r@email.com", phone: "(555) 345-6789", status: "Cold", progress: 30, lastContact: "2 weeks ago", interest: "Investment Property" }
                  ].map((prospect, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-300">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-gray-900">{prospect.name}</h4>
                          <p className="text-sm text-gray-600">Interest: {prospect.interest}</p>
                        </div>
                        <Badge 
                          variant={prospect.status === "Hot" ? "default" : prospect.status === "Warm" ? "secondary" : "outline"}
                          className={prospect.status === "Hot" ? "bg-red-100 text-red-800" : prospect.status === "Warm" ? "bg-yellow-100 text-yellow-800" : "bg-gray-100 text-gray-800"}
                        >
                          {prospect.status}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 mr-2" />
                          {prospect.email}
                        </div>
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 mr-2" />
                          {prospect.phone}
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Progress</span>
                          <span>{prospect.progress}%</span>
                        </div>
                        <Progress value={prospect.progress} className="h-2" />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          Last contact: {prospect.lastContact}
                        </span>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <Phone className="h-3 w-3 mr-1" />
                            Call
                          </Button>
                          <Button size="sm" variant="outline">
                            <Mail className="h-3 w-3 mr-1" />
                            Email
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Tools */}
          <div className="space-y-6">
            <AiAssistantPanel 
              selectedClient={selectedClient}
              onClientSelect={(clientId) => {
                const client = Array.isArray(clients) ? clients.find((c: any) => c.id === clientId) : null;
                setSelectedClient(client);
              }}
            />

            {/* Quick Actions */}
            <Card className="bg-white rounded-xl shadow-sm border border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Follow-up
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Mail className="h-4 w-4 mr-2" />
                  Send Campaign
                </Button>
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={handlePropertyMatch}
                >
                  <Home className="h-4 w-4 mr-2" />
                  Property Match
                </Button>
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={handleAddToCRM}
                >
                  <Star className="h-4 w-4 mr-2" />
                  Add to CRM
                </Button>
              </CardContent>
            </Card>

            {/* Prospecting Tips */}
            <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-xl shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">Prospecting Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-start space-x-3">
                  <div className="bg-purple-100 rounded-full p-1 mt-0.5">
                    <Target className="h-3 w-3 text-purple-600" />
                  </div>
                  <p>Focus on expired listings - they're motivated to sell</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="bg-blue-100 rounded-full p-1 mt-0.5">
                    <Clock className="h-3 w-3 text-blue-600" />
                  </div>
                  <p>Best calling times: 6-8 PM on weekdays</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="bg-green-100 rounded-full p-1 mt-0.5">
                    <Mail className="h-3 w-3 text-green-600" />
                  </div>
                  <p>Follow up 7-12 times before moving on</p>
                </div>
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card className="bg-white rounded-xl shadow-sm border border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">This Month</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Calls Made</span>
                    <span>142/200</span>
                  </div>
                  <Progress value={71} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Emails Sent</span>
                    <span>89/150</span>
                  </div>
                  <Progress value={59} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Appointments Set</span>
                    <span>12/20</span>
                  </div>
                  <Progress value={60} className="h-2" />
                </div>
                <Separator />
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">68%</p>
                  <p className="text-sm text-gray-600">Conversion Rate</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}