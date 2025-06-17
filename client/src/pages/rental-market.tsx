import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
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
  Zap
} from "lucide-react";
import Navbar from "@/components/navbar";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

export default function CommissionIntelligence() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  
  const [contractText, setContractText] = useState("");
  const [clientBehaviorText, setClientBehaviorText] = useState("");
  const [marketAddress, setMarketAddress] = useState("");
  
  const [analysisResult, setAnalysisResult] = useState(null);
  const [behaviorAnalysis, setBehaviorAnalysis] = useState(null);
  const [marketInsights, setMarketInsights] = useState(null);

  // Load dashboard data
  const { data: stats = {}, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    enabled: isAuthenticated,
  });

  const { data: contracts = [], isLoading: contractsLoading } = useQuery({
    queryKey: ["/api/contracts"],
    enabled: isAuthenticated,
  });

  const { data: clients = [], isLoading: clientsLoading } = useQuery({
    queryKey: ["/api/clients"],
    enabled: isAuthenticated,
  });

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
          <h1 className="text-3xl font-bold text-gray-900">Rental Market Intelligence</h1>
          <p className="text-gray-600 mt-1">Powered by RentCast API - Comprehensive rental property data and market analysis</p>
        </div>

        <Tabs defaultValue="search" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="search">Property Search</TabsTrigger>
            <TabsTrigger value="estimate">Rent Estimates</TabsTrigger>
            <TabsTrigger value="market">Market Data</TabsTrigger>
          </TabsList>

          <TabsContent value="search">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Rental Property Search
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      placeholder="123 Main St"
                      value={searchFilters.address}
                      onChange={(e) => setSearchFilters({...searchFilters, address: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      placeholder="New York"
                      value={searchFilters.city}
                      onChange={(e) => setSearchFilters({...searchFilters, city: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      placeholder="NY"
                      value={searchFilters.state}
                      onChange={(e) => setSearchFilters({...searchFilters, state: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="zipCode">ZIP Code</Label>
                    <Input
                      id="zipCode"
                      placeholder="10001"
                      value={searchFilters.zipCode}
                      onChange={(e) => setSearchFilters({...searchFilters, zipCode: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="bedrooms">Bedrooms</Label>
                    <Select value={searchFilters.bedrooms} onValueChange={(value) => setSearchFilters({...searchFilters, bedrooms: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Any" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Any</SelectItem>
                        <SelectItem value="1">1</SelectItem>
                        <SelectItem value="2">2</SelectItem>
                        <SelectItem value="3">3</SelectItem>
                        <SelectItem value="4">4+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="bathrooms">Bathrooms</Label>
                    <Select value={searchFilters.bathrooms} onValueChange={(value) => setSearchFilters({...searchFilters, bathrooms: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Any" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Any</SelectItem>
                        <SelectItem value="1">1</SelectItem>
                        <SelectItem value="2">2</SelectItem>
                        <SelectItem value="3">3+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button 
                  onClick={handleSearch} 
                  disabled={searchRentals.isPending}
                  className="w-full"
                >
                  {searchRentals.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" />
                      Search Rental Properties
                    </>
                  )}
                </Button>

                {searchResults && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-4">Search Results</h3>
                    {searchResults.success ? (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <span>Found {searchResults.count} properties</span>
                        </div>
                        {searchResults.data && searchResults.data.length > 0 && (
                          <div className="grid gap-4">
                            {searchResults.data.slice(0, 5).map((property: any, index: number) => (
                              <Card key={index} className="p-4">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h4 className="font-medium">{property.address || 'Property Address'}</h4>
                                    <p className="text-sm text-gray-600">
                                      {property.bedrooms}bd / {property.bathrooms}ba
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-bold text-green-600">
                                      ${property.rent || property.price || 'N/A'}/mo
                                    </p>
                                  </div>
                                </div>
                              </Card>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          {searchResults.error || "No properties found matching your criteria"}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="estimate">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Rent Estimate Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="rentAddress">Property Address</Label>
                  <Input
                    id="rentAddress"
                    placeholder="123 Main St, New York, NY 10001"
                    value={rentEstimateAddress}
                    onChange={(e) => setRentEstimateAddress(e.target.value)}
                  />
                </div>

                <Button 
                  onClick={handleRentEstimate} 
                  disabled={getRentEstimate.isPending || !rentEstimateAddress.trim()}
                  className="w-full"
                >
                  {getRentEstimate.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <DollarSign className="mr-2 h-4 w-4" />
                      Get Rent Estimate
                    </>
                  )}
                </Button>

                {rentEstimate && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-4">Rent Analysis</h3>
                    {rentEstimate.success ? (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card className="p-4">
                          <div className="text-center">
                            <h4 className="font-medium text-gray-600">Estimated Rent</h4>
                            <p className="text-2xl font-bold text-green-600">
                              ${rentEstimate.data?.rent || rentEstimate.data?.estimate || 'N/A'}/mo
                            </p>
                          </div>
                        </Card>
                        <Card className="p-4">
                          <div className="text-center">
                            <h4 className="font-medium text-gray-600">Confidence</h4>
                            <p className="text-2xl font-bold text-blue-600">
                              {rentEstimate.data?.confidence || 'N/A'}%
                            </p>
                          </div>
                        </Card>
                        <Card className="p-4">
                          <div className="text-center">
                            <h4 className="font-medium text-gray-600">Property Type</h4>
                            <p className="text-lg font-medium">
                              {rentEstimate.data?.propertyType || 'N/A'}
                            </p>
                          </div>
                        </Card>
                      </div>
                    ) : (
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          {rentEstimate.error || "Unable to generate rent estimate for this property"}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="market">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Market Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="marketCity">City</Label>
                    <Input
                      id="marketCity"
                      placeholder="New York"
                      value={marketCity}
                      onChange={(e) => setMarketCity(e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="marketState">State</Label>
                    <Input
                      id="marketState"
                      placeholder="NY"
                      value={marketState}
                      onChange={(e) => setMarketState(e.target.value)}
                    />
                  </div>
                </div>

                <Button 
                  onClick={handleMarketData} 
                  disabled={getMarketData.isPending || !marketCity.trim() || !marketState.trim()}
                  className="w-full"
                >
                  {getMarketData.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing Market...
                    </>
                  ) : (
                    <>
                      <TrendingUp className="mr-2 h-4 w-4" />
                      Get Market Data
                    </>
                  )}
                </Button>

                {marketData && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-4">Market Overview</h3>
                    {marketData.success ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Card className="p-4">
                          <div className="text-center">
                            <h4 className="font-medium text-gray-600">Avg Rent</h4>
                            <p className="text-xl font-bold text-green-600">
                              ${marketData.data?.averageRent || 'N/A'}
                            </p>
                          </div>
                        </Card>
                        <Card className="p-4">
                          <div className="text-center">
                            <h4 className="font-medium text-gray-600">Vacancy Rate</h4>
                            <p className="text-xl font-bold text-blue-600">
                              {marketData.data?.vacancyRate || 'N/A'}%
                            </p>
                          </div>
                        </Card>
                        <Card className="p-4">
                          <div className="text-center">
                            <h4 className="font-medium text-gray-600">Rent Growth</h4>
                            <p className="text-xl font-bold text-purple-600">
                              {marketData.data?.rentGrowth || 'N/A'}%
                            </p>
                          </div>
                        </Card>
                        <Card className="p-4">
                          <div className="text-center">
                            <h4 className="font-medium text-gray-600">Market Size</h4>
                            <p className="text-xl font-bold text-orange-600">
                              {marketData.data?.totalUnits || 'N/A'}
                            </p>
                          </div>
                        </Card>
                      </div>
                    ) : (
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          {marketData.error || "Unable to retrieve market data for this location"}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="h-5 w-5" />
              RentCast Integration Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span>RentCast API Connected and Ready</span>
              <Badge variant="secondary">Active</Badge>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Access to rental property listings, rent estimates, and market data across the United States.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}