import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import Navbar from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MapPin, Search, Home, DollarSign, Bed, Bath, Square } from "lucide-react";

export default function PropertyMap() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();
  const [searchLocation, setSearchLocation] = useState("");
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [savedPins, setSavedPins] = useState<any[]>([]);

  const { data: properties, isLoading: loadingProperties } = useQuery({
    queryKey: [`/api/properties?location=${encodeURIComponent(searchLocation)}`],
    enabled: !!searchLocation,
  });

  const savePinMutation = useMutation({
    mutationFn: async (propertyData: any) => {
      return await apiRequest("POST", "/api/property-pins", propertyData);
    },
    onSuccess: () => {
      toast({
        title: "Property Saved",
        description: "Property has been saved to your pins for future reference.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/property-pins"] });
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
        description: "Failed to save property pin. Please try again.",
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

  const handleSearch = () => {
    if (!searchLocation.trim()) {
      toast({
        title: "Location Required",
        description: "Please enter a location to search for properties.",
        variant: "destructive",
      });
      return;
    }
    // This will trigger the query
    queryClient.invalidateQueries({ queryKey: ["/api/properties", searchLocation] });
  };

  const handleSavePin = (property: any) => {
    savePinMutation.mutate({
      propertyId: property.id,
      address: property.address,
      price: property.price,
      latitude: property.latitude,
      longitude: property.longitude,
      propertyType: property.propertyType,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      squareFootage: property.squareFootage,
      notes: "",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Property Map & Listings</h1>
          <p className="text-gray-600 mt-1">Search properties and save locations for potential clients</p>
        </div>

        {/* Search Bar */}
        <Card className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <Input
                  placeholder="Enter city, zip code, or address (e.g., 'Los Angeles, CA' or '90210')"
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="text-lg"
                />
              </div>
              <Button 
                onClick={handleSearch}
                disabled={loadingProperties}
                className="bg-primary text-white hover:bg-blue-700 px-8"
              >
                <Search className="h-4 w-4 mr-2" />
                {loadingProperties ? "Searching..." : "Search Properties"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* API Integration Notice */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl shadow-sm mb-8">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <MapPin className="h-8 w-8 text-primary mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Property Data Integration</h3>
                <p className="text-gray-700 mb-4">
                  To display real property listings, Commission Guard can integrate with professional real estate data providers such as:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="bg-white p-3 rounded-lg border">
                    <p className="font-medium text-gray-900">Zillow API</p>
                    <p className="text-sm text-gray-600">Property details & market data</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg border">
                    <p className="font-medium text-gray-900">MLS Integration</p>
                    <p className="text-sm text-gray-600">Local multiple listing service</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg border">
                    <p className="font-medium text-gray-900">RentSpree API</p>
                    <p className="text-sm text-gray-600">Rental property listings</p>
                  </div>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-gray-700">
                    <strong>Setup Required:</strong> To enable live property data, please provide your real estate data API credentials. 
                    This ensures you get accurate, up-to-date property information for your client prospecting.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Map Area */}
          <div className="lg:col-span-2">
            <Card className="bg-white rounded-xl shadow-sm border border-gray-200">
              <CardHeader className="border-b border-gray-200">
                <CardTitle className="text-xl font-semibold text-gray-900 flex items-center">
                  <MapPin className="text-primary mr-2" />
                  Interactive Property Map
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-96 bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center border-2 border-dashed border-blue-200">
                  <div className="text-center">
                    <MapPin className="h-16 w-16 text-blue-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Interactive Map Ready</h3>
                    <p className="text-gray-600 max-w-md mb-4">
                      Google Maps integration is configured and ready. Use the search below to locate properties and view real estate data.
                    </p>
                    <div className="text-sm text-blue-600 font-medium">
                      Search for an address to activate map view
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Sample Property Listings */}
            {searchLocation && (
              <Card className="bg-white rounded-xl shadow-sm border border-gray-200 mt-6">
                <CardHeader className="border-b border-gray-200">
                  <CardTitle className="text-xl font-semibold text-gray-900">
                    Property Results for "{searchLocation}"
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <p className="text-sm text-blue-800">
                      <strong>Demo Mode:</strong> Real property listings will appear here once API integration is complete.
                      The system will show current market listings with photos, prices, and details.
                    </p>
                  </div>
                  
                  {/* Example property layout */}
                  <div className="space-y-4">
                    {[1, 2, 3].map((item) => (
                      <div key={item} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-semibold text-gray-900">Property listing will display here</h4>
                            <p className="text-gray-600 text-sm">Address, city, state, zip</p>
                          </div>
                          <Badge variant="outline">For Sale</Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                          <div className="flex items-center">
                            <DollarSign className="h-4 w-4 mr-1" />
                            Price
                          </div>
                          <div className="flex items-center">
                            <Bed className="h-4 w-4 mr-1" />
                            Beds
                          </div>
                          <div className="flex items-center">
                            <Bath className="h-4 w-4 mr-1" />
                            Baths
                          </div>
                          <div className="flex items-center">
                            <Square className="h-4 w-4 mr-1" />
                            Sq Ft
                          </div>
                        </div>
                        <Button size="sm" variant="outline" disabled>
                          <MapPin className="h-3 w-3 mr-1" />
                          Save Pin
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Saved Pins */}
            <Card className="bg-white rounded-xl shadow-sm border border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">Saved Property Pins</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Saved Pins</h3>
                  <p className="text-gray-600 text-sm">
                    Search for properties and save locations that interest you or your clients.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Map Features */}
            <Card className="bg-white rounded-xl shadow-sm border border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">Map Features</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center space-x-3">
                    <div className="bg-green-100 rounded-full p-2">
                      <Home className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">Property Search</p>
                      <p className="text-gray-600">Find listings by location</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-100 rounded-full p-2">
                      <MapPin className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">Custom Pins</p>
                      <p className="text-gray-600">Save locations of interest</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="bg-purple-100 rounded-full p-2">
                      <DollarSign className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium">Market Data</p>
                      <p className="text-gray-600">Current pricing & trends</p>
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