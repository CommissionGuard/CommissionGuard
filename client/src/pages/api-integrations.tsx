import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { 
  MapPin, 
  Search, 
  DollarSign, 
  TrendingUp, 
  Users, 
  Eye,
  Settings,
  Key,
  CheckCircle,
  AlertCircle,
  ExternalLink
} from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function ApiIntegrations() {
  const { toast } = useToast();
  const [searchFilters, setSearchFilters] = useState({
    location: "",
    minPrice: "",
    maxPrice: "",
    propertyType: "",
    bedrooms: "",
    bathrooms: ""
  });
  const [geocodeAddress, setGeocodeAddress] = useState("");
  const [valuationAddress, setValuationAddress] = useState("");
  const [marketLocation, setMarketLocation] = useState("");

  const [geocodeResult, setGeocodeResult] = useState<any>(null);
  const [nearbyResults, setNearbyResults] = useState<any>(null);

  // Property Search
  const propertySearchMutation = useMutation({
    mutationFn: async (filters: any) => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value as string);
      });
      return apiRequest(`/api/properties/search?${params.toString()}`);
    },
    onSuccess: (data: any) => {
      toast({
        title: "Search Complete",
        description: data.message || "Property search completed successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Search Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Geocoding
  const geocodeMutation = useMutation({
    mutationFn: async (address: string) => {
      return apiRequest("/api/properties/geocode", "POST", { address });
    },
    onSuccess: (data: any) => {
      setGeocodeResult(data);
      if (data.success) {
        toast({
          title: "Location Found",
          description: `Located: ${data.address}`,
        });
        // Automatically get nearby properties
        nearbyMutation.mutate({ lat: data.latitude, lng: data.longitude });
      } else {
        toast({
          title: "Location Not Found",
          description: data.error || "Could not locate this address",
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Geocoding Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Nearby Properties
  const nearbyMutation = useMutation({
    mutationFn: async ({ lat, lng, radius = 1000 }: { lat: number; lng: number; radius?: number }) => {
      return apiRequest(`/api/properties/nearby?lat=${lat}&lng=${lng}&radius=${radius}`);
    },
    onSuccess: (data: any) => {
      setNearbyResults(data);
      if (data.success) {
        toast({
          title: "Nearby Properties Found",
          description: `Found ${data.places?.length || 0} nearby real estate locations`,
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Nearby Search Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Property Valuation
  const valuationMutation = useMutation({
    mutationFn: async (address: string) => {
      return apiRequest("/api/properties/valuation", "POST", { address });
    },
    onSuccess: (data: any) => {
      toast({
        title: "Valuation Retrieved",
        description: data.message || "Property valuation completed",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Valuation Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Market Data
  const marketDataMutation = useMutation({
    mutationFn: async (location: string) => {
      return apiRequest(`/api/market-data/${encodeURIComponent(location)}`);
    },
    onSuccess: (data: any) => {
      toast({
        title: "Market Data Retrieved",
        description: data.message || "Market analysis completed",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Market Data Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">API Integrations</h1>
          <p className="text-gray-600 mt-2">
            Connect with real estate data providers to enhance your commission protection platform
          </p>
        </div>

        {/* API Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Search className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">MLS Search</p>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                      Configure
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <MapPin className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Google Maps</p>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Connected
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Zillow API</p>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                      Configure
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-red-100 rounded-lg">
                  <Eye className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Public Records</p>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                      Configure
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="testing" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="testing">API Testing</TabsTrigger>
            <TabsTrigger value="configuration">Configuration</TabsTrigger>
            <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
          </TabsList>

          <TabsContent value="testing" className="space-y-6">
            {/* Property Search Testing */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Search className="h-5 w-5" />
                  <span>Property Search</span>
                </CardTitle>
                <CardDescription>
                  Test MLS and property listing integrations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      placeholder="Beverly Hills, CA"
                      value={searchFilters.location}
                      onChange={(e) => setSearchFilters({...searchFilters, location: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="propertyType">Property Type</Label>
                    <Select 
                      value={searchFilters.propertyType} 
                      onValueChange={(value) => setSearchFilters({...searchFilters, propertyType: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="single-family">Single Family</SelectItem>
                        <SelectItem value="condo">Condo</SelectItem>
                        <SelectItem value="townhouse">Townhouse</SelectItem>
                        <SelectItem value="multi-family">Multi Family</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="priceRange">Price Range</Label>
                    <div className="flex space-x-2">
                      <Input
                        placeholder="Min"
                        value={searchFilters.minPrice}
                        onChange={(e) => setSearchFilters({...searchFilters, minPrice: e.target.value})}
                      />
                      <Input
                        placeholder="Max"
                        value={searchFilters.maxPrice}
                        onChange={(e) => setSearchFilters({...searchFilters, maxPrice: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
                <Button 
                  onClick={() => propertySearchMutation.mutate(searchFilters)}
                  disabled={propertySearchMutation.isPending}
                  className="w-full"
                >
                  {propertySearchMutation.isPending ? "Searching..." : "Search Properties"}
                </Button>
              </CardContent>
            </Card>

            {/* Geocoding Testing */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5" />
                  <span>Address Geocoding</span>
                </CardTitle>
                <CardDescription>
                  Convert addresses to coordinates using Google Maps API
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="geocodeAddress">Property Address</Label>
                  <Input
                    id="geocodeAddress"
                    placeholder="123 Main St, Beverly Hills, CA 90210"
                    value={geocodeAddress}
                    onChange={(e) => setGeocodeAddress(e.target.value)}
                  />
                </div>
                <Button 
                  onClick={() => geocodeMutation.mutate(geocodeAddress)}
                  disabled={geocodeMutation.isPending || !geocodeAddress}
                  className="w-full"
                >
                  {geocodeMutation.isPending ? "Locating..." : "Get Location"}
                </Button>
                
                {/* Display Geocoding Results */}
                {geocodeResult && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold mb-2">Location Results:</h4>
                    {geocodeResult.success ? (
                      <div className="space-y-2 text-sm">
                        <p><strong>Address:</strong> {geocodeResult.address}</p>
                        <p><strong>Coordinates:</strong> {geocodeResult.latitude}, {geocodeResult.longitude}</p>
                        <p><strong>Place ID:</strong> {geocodeResult.placeId}</p>
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Successfully Located
                        </Badge>
                      </div>
                    ) : (
                      <div className="text-red-600 text-sm">
                        <AlertCircle className="h-4 w-4 inline mr-2" />
                        {geocodeResult.error}
                      </div>
                    )}
                  </div>
                )}

                {/* Display Nearby Properties */}
                {nearbyResults && nearbyResults.success && nearbyResults.places.length > 0 && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold mb-2">Nearby Real Estate Locations:</h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {nearbyResults.places.slice(0, 5).map((place: any, index: number) => (
                        <div key={index} className="p-2 bg-white rounded border text-sm">
                          <p className="font-medium">{place.name}</p>
                          <p className="text-gray-600">{place.address}</p>
                          {place.rating && (
                            <p className="text-yellow-600">Rating: {place.rating}/5</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Property Valuation Testing */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5" />
                  <span>Property Valuation</span>
                </CardTitle>
                <CardDescription>
                  Get estimated property values using Zillow API
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="valuationAddress">Property Address</Label>
                  <Input
                    id="valuationAddress"
                    placeholder="123 Main St, Beverly Hills, CA 90210"
                    value={valuationAddress}
                    onChange={(e) => setValuationAddress(e.target.value)}
                  />
                </div>
                <Button 
                  onClick={() => valuationMutation.mutate(valuationAddress)}
                  disabled={valuationMutation.isPending || !valuationAddress}
                  className="w-full"
                >
                  {valuationMutation.isPending ? "Analyzing..." : "Get Valuation"}
                </Button>
              </CardContent>
            </Card>

            {/* Market Data Testing */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>Market Analysis</span>
                </CardTitle>
                <CardDescription>
                  Get local market statistics and trends
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="marketLocation">Market Location</Label>
                  <Input
                    id="marketLocation"
                    placeholder="Beverly Hills, CA"
                    value={marketLocation}
                    onChange={(e) => setMarketLocation(e.target.value)}
                  />
                </div>
                <Button 
                  onClick={() => marketDataMutation.mutate(marketLocation)}
                  disabled={marketDataMutation.isPending || !marketLocation}
                  className="w-full"
                >
                  {marketDataMutation.isPending ? "Analyzing..." : "Get Market Data"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="configuration" className="space-y-6">
            <Alert>
              <Key className="h-4 w-4" />
              <AlertDescription>
                API keys are securely stored as environment variables. Contact your administrator to configure these integrations.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Google Maps Configuration */}
              <Card>
                <CardHeader>
                  <CardTitle>Google Maps API</CardTitle>
                  <CardDescription>
                    Required for address geocoding and mapping features
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>API Key Status</Label>
                    <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                      Not Configured
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <Label>Required Environment Variable</Label>
                    <code className="block p-2 bg-gray-100 rounded text-sm">
                      GOOGLE_MAPS_API_KEY
                    </code>
                  </div>
                  <Button variant="outline" className="w-full">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Get Google Maps API Key
                  </Button>
                </CardContent>
              </Card>

              {/* MLS Configuration */}
              <Card>
                <CardHeader>
                  <CardTitle>MLS Integration</CardTitle>
                  <CardDescription>
                    Connect to your local MLS for property listings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>API Key Status</Label>
                    <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                      Not Configured
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <Label>Required Environment Variable</Label>
                    <code className="block p-2 bg-gray-100 rounded text-sm">
                      MLS_API_KEY
                    </code>
                  </div>
                  <Button variant="outline" className="w-full">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Configure MLS Access
                  </Button>
                </CardContent>
              </Card>

              {/* Zillow Configuration */}
              <Card>
                <CardHeader>
                  <CardTitle>Zillow API</CardTitle>
                  <CardDescription>
                    Access property valuations and market data
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>API Key Status</Label>
                    <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                      Not Configured
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <Label>Required Environment Variable</Label>
                    <code className="block p-2 bg-gray-100 rounded text-sm">
                      ZILLOW_API_KEY
                    </code>
                  </div>
                  <Button variant="outline" className="w-full">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Get Zillow API Access
                  </Button>
                </CardContent>
              </Card>

              {/* Public Records Configuration */}
              <Card>
                <CardHeader>
                  <CardTitle>Public Records API</CardTitle>
                  <CardDescription>
                    Monitor property transactions for breach detection
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>API Key Status</Label>
                    <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                      Not Configured
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <Label>Required Environment Variable</Label>
                    <code className="block p-2 bg-gray-100 rounded text-sm">
                      PUBLIC_RECORDS_API_KEY
                    </code>
                  </div>
                  <Button variant="outline" className="w-full">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Configure Public Records Access
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="monitoring" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>API Usage Monitoring</CardTitle>
                <CardDescription>
                  Track API calls, performance, and costs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">0</div>
                    <div className="text-sm text-gray-600">API Calls Today</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">$0.00</div>
                    <div className="text-sm text-gray-600">Cost This Month</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">0ms</div>
                    <div className="text-sm text-gray-600">Avg Response Time</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}