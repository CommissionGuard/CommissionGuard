import { useState } from "react";
import Navbar from "@/components/navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  MapPin, 
  DollarSign, 
  Calculator,
  TrendingUp,
  Building,
  Users,
  Clock,
  CheckCircle,
  ExternalLink
} from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export default function PropertyAnalyzer() {
  const { toast } = useToast();
  const [address, setAddress] = useState("");
  const [locationData, setLocationData] = useState<any>(null);
  const [nearbyData, setNearbyData] = useState<any>(null);
  const [analysis, setAnalysis] = useState<any>(null);

  const analyzeMutation = useMutation({
    mutationFn: async (searchAddress: string) => {
      // Geocode the address
      const geocodeResponse = await fetch("/api/properties/geocode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ address: searchAddress }),
      });
      
      if (!geocodeResponse.ok) {
        throw new Error("Failed to geocode address");
      }
      
      const geocodeData = await geocodeResponse.json();
      
      if (!geocodeData.success) {
        throw new Error("Address not found");
      }

      // Get nearby real estate businesses
      const nearbyResponse = await fetch(
        `/api/properties/nearby?lat=${geocodeData.latitude}&lng=${geocodeData.longitude}&radius=5000`,
        { credentials: "include" }
      );
      
      const nearbyResults = await nearbyResponse.json();

      return {
        location: geocodeData,
        nearby: nearbyResults,
        analysis: generateMarketAnalysis(geocodeData, nearbyResults)
      };
    },
    onSuccess: (data) => {
      setLocationData(data.location);
      setNearbyData(data.nearby);
      setAnalysis(data.analysis);
      
      toast({
        title: "Analysis Complete",
        description: `Generated market insights for ${data.location.address}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Analysis Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const generateMarketAnalysis = (location: any, nearby: any) => {
    const realEstateBusinesses = nearby.success ? nearby.places.filter((place: any) => 
      place.types.some((type: string) => 
        ['real_estate_agency', 'lawyer', 'insurance_agency', 'bank'].includes(type)
      )
    ) : [];

    const competitorCount = realEstateBusinesses.filter((place: any) =>
      place.types.includes('real_estate_agency')
    ).length;

    return {
      marketActivity: competitorCount > 3 ? "High" : competitorCount > 1 ? "Medium" : "Low",
      competitorCount,
      serviceProviders: realEstateBusinesses.length,
      recommendations: generateRecommendations(location, competitorCount),
      marketScore: calculateMarketScore(competitorCount, realEstateBusinesses.length),
      insights: generateInsights(location, realEstateBusinesses)
    };
  };

  const generateRecommendations = (location: any, competitors: number) => {
    const recommendations = [];
    
    if (competitors > 5) {
      recommendations.push("High competition area - consider specialized niche marketing");
      recommendations.push("Network with local service providers for referrals");
    } else if (competitors < 2) {
      recommendations.push("Low competition - opportunity for market expansion");
      recommendations.push("Consider establishing strong local presence");
    }
    
    recommendations.push("Verify recent sales data through MLS");
    recommendations.push("Research local zoning and development plans");
    
    return recommendations;
  };

  const calculateMarketScore = (competitors: number, services: number) => {
    let score = 50; // Base score
    
    // Competition factor
    if (competitors > 5) score -= 15;
    else if (competitors < 2) score += 10;
    
    // Service provider factor
    if (services > 10) score += 15;
    else if (services < 3) score -= 10;
    
    return Math.max(10, Math.min(100, score));
  };

  const generateInsights = (location: any, businesses: any[]) => {
    const insights = [];
    
    insights.push(`Located at coordinates ${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`);
    
    if (businesses.length > 0) {
      insights.push(`${businesses.length} real estate service providers within 5km radius`);
    }
    
    const banks = businesses.filter(b => b.types.includes('bank')).length;
    if (banks > 0) {
      insights.push(`${banks} banking institutions nearby for financing options`);
    }
    
    return insights;
  };

  const handleAnalyze = () => {
    if (address.trim()) {
      analyzeMutation.mutate(address);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Property Market Analyzer</h1>
          <p className="text-gray-600 mt-2">
            Practical market intelligence for real estate professionals using live location data
          </p>
        </div>

        {/* Search Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Search className="h-5 w-5" />
              <span>Market Analysis</span>
            </CardTitle>
            <CardDescription>
              Analyze local market conditions, competition, and opportunities for any address
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="address">Property or Area Address</Label>
              <Input
                id="address"
                placeholder="Enter any address to analyze the local market"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAnalyze()}
              />
            </div>
            <Button 
              onClick={handleAnalyze}
              disabled={analyzeMutation.isPending || !address.trim()}
              className="w-full"
              size="lg"
            >
              {analyzeMutation.isPending ? (
                <>
                  <Search className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing Market...
                </>
              ) : (
                <>
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Analyze Market
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        {locationData && analysis && (
          <div className="space-y-6">
            {/* Market Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5" />
                  <span>Market Overview</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{analysis.marketScore}</div>
                    <div className="text-sm text-blue-800">Market Score</div>
                  </div>
                  
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{analysis.competitorCount}</div>
                    <div className="text-sm text-green-800">Competitors</div>
                  </div>
                  
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{analysis.serviceProviders}</div>
                    <div className="text-sm text-purple-800">Service Providers</div>
                  </div>
                  
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <Badge variant={analysis.marketActivity === 'High' ? 'destructive' : analysis.marketActivity === 'Medium' ? 'default' : 'secondary'}>
                      {analysis.marketActivity} Activity
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="insights" className="space-y-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="insights">Market Insights</TabsTrigger>
                <TabsTrigger value="competition">Competition</TabsTrigger>
                <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
                <TabsTrigger value="tools">Action Tools</TabsTrigger>
              </TabsList>

              <TabsContent value="insights" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Market Intelligence</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {analysis.insights.map((insight: string, index: number) => (
                      <div key={index} className="flex items-start space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{insight}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="competition" className="space-y-4">
                {nearbyData?.success && nearbyData.places.length > 0 ? (
                  <Card>
                    <CardHeader>
                      <CardTitle>Local Real Estate Market</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {nearbyData.places
                          .filter((place: any) => place.types.includes('real_estate_agency'))
                          .map((agency: any, index: number) => (
                          <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                            <h4 className="font-medium">{agency.name}</h4>
                            <p className="text-sm text-gray-600">{agency.address}</p>
                            <p className="text-xs text-gray-500">
                              Rating: {agency.rating || 'N/A'} | Place ID: {agency.placeId}
                            </p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Alert>
                    <Building className="h-4 w-4" />
                    <AlertDescription>
                      No competing real estate agencies found in immediate area - potential market opportunity.
                    </AlertDescription>
                  </Alert>
                )}
              </TabsContent>

              <TabsContent value="recommendations" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Strategic Recommendations</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {analysis.recommendations.map((rec: string, index: number) => (
                      <div key={index} className="flex items-start space-x-2">
                        <TrendingUp className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{rec}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="tools" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Action Tools</CardTitle>
                    <CardDescription>
                      Quick tools for follow-up research and prospecting
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Button 
                        variant="outline" 
                        className="h-auto p-4 text-left"
                        onClick={() => window.open(`https://www.google.com/maps/search/real+estate+near+${encodeURIComponent(locationData.address)}`, '_blank')}
                      >
                        <div className="flex items-start space-x-3">
                          <MapPin className="h-5 w-5 text-blue-600 mt-1" />
                          <div>
                            <div className="font-medium">View on Google Maps</div>
                            <div className="text-sm text-gray-600">Explore the area in detail</div>
                          </div>
                          <ExternalLink className="h-4 w-4 ml-auto" />
                        </div>
                      </Button>

                      <Button 
                        variant="outline" 
                        className="h-auto p-4 text-left"
                        onClick={() => window.open(`https://www.zillow.com/homes/${encodeURIComponent(locationData.address)}`, '_blank')}
                      >
                        <div className="flex items-start space-x-3">
                          <DollarSign className="h-5 w-5 text-green-600 mt-1" />
                          <div>
                            <div className="font-medium">Check Zillow</div>
                            <div className="text-sm text-gray-600">Recent sales and listings</div>
                          </div>
                          <ExternalLink className="h-4 w-4 ml-auto" />
                        </div>
                      </Button>

                      <Button 
                        variant="outline" 
                        className="h-auto p-4 text-left"
                        onClick={() => window.open(`https://www.realtor.com/realestateandhomes-search/${encodeURIComponent(locationData.address)}`, '_blank')}
                      >
                        <div className="flex items-start space-x-3">
                          <Building className="h-5 w-5 text-purple-600 mt-1" />
                          <div>
                            <div className="font-medium">Search Realtor.com</div>
                            <div className="text-sm text-gray-600">MLS data and market trends</div>
                          </div>
                          <ExternalLink className="h-4 w-4 ml-auto" />
                        </div>
                      </Button>

                      <Button 
                        variant="outline" 
                        className="h-auto p-4 text-left"
                        onClick={() => {
                          const coords = `${locationData.latitude},${locationData.longitude}`;
                          navigator.clipboard.writeText(coords);
                          toast({ title: "Coordinates copied!", description: coords });
                        }}
                      >
                        <div className="flex items-start space-x-3">
                          <Calculator className="h-5 w-5 text-orange-600 mt-1" />
                          <div>
                            <div className="font-medium">Copy Coordinates</div>
                            <div className="text-sm text-gray-600">For GIS and mapping tools</div>
                          </div>
                        </div>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  );
}