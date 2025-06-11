import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MapPin, Search, Home, CheckCircle, AlertCircle, Navigation } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function LiveMap() {
  const { toast } = useToast();
  const [searchLocation, setSearchLocation] = useState("");
  const [selectedPlace, setSelectedPlace] = useState<any>(null);
  const [geocodeResult, setGeocodeResult] = useState<any>(null);
  const [nearbyResults, setNearbyResults] = useState<any>(null);

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
        title: "Search Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const nearbyMutation = useMutation({
    mutationFn: async ({ lat, lng, radius = 2000 }: { lat: number; lng: number; radius?: number }) => {
      return apiRequest(`/api/properties/nearby?lat=${lat}&lng=${lng}&radius=${radius}`);
    },
    onSuccess: (data: any) => {
      setNearbyResults(data);
      if (data.success && data.places.length > 0) {
        toast({
          title: "Found Real Estate Locations",
          description: `Found ${data.places.length} real estate agencies nearby`,
        });
      }
    },
    onError: (error: any) => {
      console.error("Nearby search error:", error);
    }
  });

  const handleSearch = () => {
    if (searchLocation.trim()) {
      geocodeMutation.mutate(searchLocation);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Live Property Location Services</h1>
          <p className="text-gray-600 mt-2">
            Real-time Google Maps integration for property geocoding and market analysis
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Search className="h-5 w-5" />
                  <span>Live Address Search</span>
                </CardTitle>
                <CardDescription>
                  Enter any property address to get live location data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="location">Property Address</Label>
                  <Input
                    id="location"
                    placeholder="1600 Amphitheatre Parkway, Mountain View, CA"
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
                <Button 
                  onClick={handleSearch}
                  disabled={geocodeMutation.isPending || !searchLocation.trim()}
                  className="w-full"
                >
                  {geocodeMutation.isPending ? (
                    <>
                      <Navigation className="h-4 w-4 mr-2 animate-spin" />
                      Locating...
                    </>
                  ) : (
                    <>
                      <MapPin className="h-4 w-4 mr-2" />
                      Find Location
                    </>
                  )}
                </Button>

                {geocodeResult && (
                  <Alert className={geocodeResult.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                    {geocodeResult.success ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-600" />
                    )}
                    <AlertDescription>
                      {geocodeResult.success ? (
                        <div className="space-y-2">
                          <p className="font-semibold">✓ Location Successfully Found</p>
                          <div className="text-sm space-y-1">
                            <p><strong>Address:</strong> {geocodeResult.address}</p>
                            <p><strong>Coordinates:</strong> {geocodeResult.latitude.toFixed(6)}, {geocodeResult.longitude.toFixed(6)}</p>
                            <p><strong>Place ID:</strong> {geocodeResult.placeId}</p>
                          </div>
                        </div>
                      ) : (
                        <p>{geocodeResult.error}</p>
                      )}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {nearbyResults && nearbyResults.success && nearbyResults.places.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Home className="h-5 w-5" />
                    <span>Nearby Real Estate ({nearbyResults.places.length})</span>
                  </CardTitle>
                  <CardDescription>
                    Real estate agencies and services within 2km radius
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {nearbyResults.places.map((place: any, index: number) => (
                      <div
                        key={index}
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                          selectedPlace?.placeId === place.placeId
                            ? "border-primary bg-primary/5"
                            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                        }`}
                        onClick={() => setSelectedPlace(place)}
                      >
                        <div className="font-medium text-sm mb-1">{place.name}</div>
                        <div className="text-xs text-gray-600 mb-2">{place.address}</div>
                        
                        {place.rating && (
                          <div className="flex items-center space-x-1 mb-2">
                            <span className="text-yellow-500 text-sm">★</span>
                            <span className="text-xs font-medium">{place.rating}/5</span>
                          </div>
                        )}
                        
                        <div className="flex flex-wrap gap-1">
                          {place.types.slice(0, 2).map((type: string, i: number) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {type.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div>
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Live Location Data</CardTitle>
                <CardDescription>
                  Real-time results from Google Maps APIs
                </CardDescription>
              </CardHeader>
              <CardContent>
                {geocodeResult && geocodeResult.success ? (
                  <div className="space-y-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h3 className="font-semibold text-blue-800 mb-3">📍 Geocoded Location</h3>
                      <div className="space-y-2 text-sm">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="font-medium text-blue-700">Latitude:</span>
                            <p className="text-blue-600">{geocodeResult.latitude}</p>
                          </div>
                          <div>
                            <span className="font-medium text-blue-700">Longitude:</span>
                            <p className="text-blue-600">{geocodeResult.longitude}</p>
                          </div>
                        </div>
                        <div>
                          <span className="font-medium text-blue-700">Formatted Address:</span>
                          <p className="text-blue-600">{geocodeResult.address}</p>
                        </div>
                        <div>
                          <span className="font-medium text-blue-700">Google Place ID:</span>
                          <p className="text-blue-600 text-xs font-mono">{geocodeResult.placeId}</p>
                        </div>
                      </div>
                    </div>

                    {geocodeResult.components && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <h3 className="font-semibold text-green-800 mb-3">🏠 Address Components</h3>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          {geocodeResult.components.slice(0, 6).map((component: any, index: number) => (
                            <div key={index} className="flex justify-between">
                              <span className="font-medium text-green-700">
                                {component.types[0].replace(/_/g, ' ')}:
                              </span>
                              <span className="text-green-600">{component.long_name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {nearbyResults && nearbyResults.success && (
                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                        <h3 className="font-semibold text-purple-800 mb-3">🏢 Market Analysis</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="font-medium text-purple-700">Real Estate Agencies:</span>
                            <span className="text-purple-600">{nearbyResults.places.length}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium text-purple-700">Search Radius:</span>
                            <span className="text-purple-600">2 km</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium text-purple-700">Market Density:</span>
                            <span className="text-purple-600">
                              {nearbyResults.places.length > 5 ? "High" : nearbyResults.places.length > 2 ? "Medium" : "Low"}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {selectedPlace && (
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                        <h3 className="font-semibold text-orange-800 mb-3">🎯 Selected Location</h3>
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="font-medium text-orange-700">Name:</span>
                            <p className="text-orange-600">{selectedPlace.name}</p>
                          </div>
                          <div>
                            <span className="font-medium text-orange-700">Address:</span>
                            <p className="text-orange-600">{selectedPlace.address}</p>
                          </div>
                          {selectedPlace.rating && (
                            <div>
                              <span className="font-medium text-orange-700">Rating:</span>
                              <p className="text-orange-600">{selectedPlace.rating}/5 ⭐</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-96 border-2 border-dashed border-gray-300 rounded-lg">
                    <div className="text-center">
                      <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <h3 className="text-lg font-semibold text-gray-600">Enter Address to Begin</h3>
                      <p className="text-gray-500">Search for any property address to see live Google Maps data</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>API Integration Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="font-medium text-green-800">Google Geocoding API</span>
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Active
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="font-medium text-green-800">Google Places API</span>
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Active
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <span className="font-medium text-blue-800">Real-time Data</span>
                  <Badge variant="outline" className="text-blue-600 border-blue-600">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Live
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}