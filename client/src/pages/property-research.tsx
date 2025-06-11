import { useState } from "react";
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
  Home, 
  DollarSign, 
  Calendar, 
  User, 
  FileText,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Building
} from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function PropertyResearch() {
  const { toast } = useToast();
  const [searchAddress, setSearchAddress] = useState("");
  const [geocodeResult, setGeocodeResult] = useState<any>(null);
  const [parcelData, setParcelData] = useState<any>(null);
  const [ownershipHistory, setOwnershipHistory] = useState<any>(null);
  const [nearbyResults, setNearbyResults] = useState<any>(null);

  const researchMutation = useMutation({
    mutationFn: async (address: string) => {
      // First geocode the address
      const response = await fetch("/api/properties/geocode", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ address }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const geocodeData = await response.json();
      
      if (geocodeData.success) {
        // Get parcel data using coordinates
        const parcelResponse = await fetch(`/api/parcels/coordinates?lat=${geocodeData.latitude}&lng=${geocodeData.longitude}`, {
          credentials: "include",
        });
        const parcelData = await parcelResponse.json();
        
        // Get nearby real estate locations
        const nearbyResponse = await fetch(`/api/properties/nearby?lat=${geocodeData.latitude}&lng=${geocodeData.longitude}&radius=2000`, {
          credentials: "include",
        });
        const nearbyData = await nearbyResponse.json();
        
        return {
          geocode: geocodeData,
          parcel: parcelData,
          nearby: nearbyData
        };
      }
      
      throw new Error("Failed to geocode address");
    },
    onSuccess: async (data: any) => {
      setGeocodeResult(data.geocode);
      setParcelData(data.parcel);
      setNearbyResults(data.nearby);
      
      // Get ownership history if parcel data is available
      if (data.parcel.success && data.parcel.parcel.parcelId) {
        try {
          const ownershipResponse = await fetch(`/api/parcels/${data.parcel.parcel.parcelId}/ownership`, {
            credentials: "include",
          });
          const ownershipData = await ownershipResponse.json();
          setOwnershipHistory(ownershipData);
        } catch (error) {
          console.error("Could not fetch ownership history:", error);
        }
      }
      
      toast({
        title: "Property Research Complete",
        description: `Comprehensive data found for ${data.geocode.address}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Research Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleResearch = () => {
    if (searchAddress.trim()) {
      researchMutation.mutate(searchAddress);
    }
  };

  const formatCurrency = (value: any) => {
    if (!value) return "Not available";
    const numValue = parseInt(value);
    return isNaN(numValue) ? "Not available" : `$${numValue.toLocaleString()}`;
  };

  const formatDate = (dateStr: any) => {
    if (!dateStr) return "Not available";
    try {
      return new Date(dateStr).toLocaleDateString();
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Property Research Center</h1>
          <p className="text-gray-600 mt-2">
            Comprehensive property intelligence powered by Google Maps and Regrid APIs
          </p>
        </div>

        {/* Search Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Search className="h-5 w-5" />
              <span>Property Address Research</span>
            </CardTitle>
            <CardDescription>
              Enter any property address to get complete ownership, tax, and market data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="address">Property Address</Label>
              <Input
                id="address"
                placeholder="Try: 1234 Elm Street, Austin, TX 78701"
                value={searchAddress}
                onChange={(e) => setSearchAddress(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleResearch()}
              />
            </div>
            <Button 
              onClick={handleResearch}
              disabled={researchMutation.isPending || !searchAddress.trim()}
              className="w-full"
              size="lg"
            >
              {researchMutation.isPending ? (
                <>
                  <Search className="h-4 w-4 mr-2 animate-spin" />
                  Researching Property...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Research Property
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Results Section */}
        {geocodeResult && geocodeResult.success && (
          <div className="space-y-6">
            {/* Property Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Home className="h-5 w-5" />
                  <span>Property Overview</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <MapPin className="h-4 w-4 text-blue-600" />
                      <span className="font-medium text-blue-800">Location</span>
                    </div>
                    <p className="text-sm text-blue-600">{geocodeResult.address}</p>
                    <p className="text-xs text-blue-500 mt-1">
                      {geocodeResult.latitude.toFixed(6)}, {geocodeResult.longitude.toFixed(6)}
                    </p>
                  </div>

                  {parcelData && parcelData.success && (
                    <>
                      <div className="p-4 bg-green-50 rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          <User className="h-4 w-4 text-green-600" />
                          <span className="font-medium text-green-800">Owner</span>
                        </div>
                        <p className="text-sm text-green-600">{parcelData.parcel.owner || 'Not available'}</p>
                        <p className="text-xs text-green-500 mt-1">Current Property Owner</p>
                      </div>

                      <div className="p-4 bg-purple-50 rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          <DollarSign className="h-4 w-4 text-purple-600" />
                          <span className="font-medium text-purple-800">Assessed Value</span>
                        </div>
                        <p className="text-sm text-purple-600">{formatCurrency(parcelData.parcel.assessedValue)}</p>
                        <p className="text-xs text-purple-500 mt-1">Tax Assessment {parcelData.parcel.taxYear || ''}</p>
                      </div>

                      <div className="p-4 bg-orange-50 rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          <TrendingUp className="h-4 w-4 text-orange-600" />
                          <span className="font-medium text-orange-800">Last Sale</span>
                        </div>
                        <p className="text-sm text-orange-600">{formatCurrency(parcelData.parcel.lastSalePrice)}</p>
                        <p className="text-xs text-orange-500 mt-1">{formatDate(parcelData.parcel.lastSaleDate)}</p>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="details" className="space-y-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="details">Property Details</TabsTrigger>
                <TabsTrigger value="ownership">Ownership History</TabsTrigger>
                <TabsTrigger value="market">Market Analysis</TabsTrigger>
                <TabsTrigger value="monitoring">Breach Monitoring</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-4">
                {parcelData && parcelData.success ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <Building className="h-4 w-4" />
                          <span>Building Information</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <span className="font-medium text-gray-700">Property Type:</span>
                            <p className="text-gray-600">{parcelData.parcel.propertyType || 'Not available'}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Year Built:</span>
                            <p className="text-gray-600">{parcelData.parcel.yearBuilt || 'Not available'}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Square Feet:</span>
                            <p className="text-gray-600">{parcelData.parcel.squareFeet || 'Not available'}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Bedrooms:</span>
                            <p className="text-gray-600">{parcelData.parcel.bedrooms || 'Not available'}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Bathrooms:</span>
                            <p className="text-gray-600">{parcelData.parcel.bathrooms || 'Not available'}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Lot Size:</span>
                            <p className="text-gray-600">{parcelData.parcel.lotSize || 'Not available'} acres</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <FileText className="h-4 w-4" />
                          <span>Tax & Legal Information</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="grid grid-cols-1 gap-3 text-sm">
                          <div>
                            <span className="font-medium text-gray-700">Zoning:</span>
                            <p className="text-gray-600">{parcelData.parcel.zoning || 'Not available'}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Land Use:</span>
                            <p className="text-gray-600">{parcelData.parcel.landUse || 'Not available'}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Market Value:</span>
                            <p className="text-gray-600">{formatCurrency(parcelData.parcel.marketValue)}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Annual Tax:</span>
                            <p className="text-gray-600">{formatCurrency(parcelData.parcel.taxAmount)}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">County:</span>
                            <p className="text-gray-600">{parcelData.parcel.county || 'Not available'}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">State:</span>
                            <p className="text-gray-600">{parcelData.parcel.state || 'Not available'}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      No detailed property data available for this address. This may be due to limited parcel data coverage in this area.
                    </AlertDescription>
                  </Alert>
                )}
              </TabsContent>

              <TabsContent value="ownership" className="space-y-4">
                {ownershipHistory && ownershipHistory.success && ownershipHistory.history.length > 0 ? (
                  <Card>
                    <CardHeader>
                      <CardTitle>Ownership Timeline</CardTitle>
                      <CardDescription>
                        Historical property ownership changes and sale transactions
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {ownershipHistory.history.map((record: any, index: number) => (
                          <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium text-gray-900">{record.owner_name}</p>
                                <p className="text-sm text-gray-600">{formatDate(record.deed_date)}</p>
                              </div>
                              {record.sale_price && (
                                <div className="text-right">
                                  <p className="font-bold text-green-600">{formatCurrency(record.sale_price)}</p>
                                  <p className="text-xs text-gray-500">Sale Price</p>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      No ownership history available for this property.
                    </AlertDescription>
                  </Alert>
                )}
              </TabsContent>

              <TabsContent value="market" className="space-y-4">
                {nearbyResults && nearbyResults.success && nearbyResults.places.length > 0 ? (
                  <Card>
                    <CardHeader>
                      <CardTitle>Local Real Estate Market</CardTitle>
                      <CardDescription>
                        Real estate agencies and services within 2km radius
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {nearbyResults.places.slice(0, 6).map((place: any, index: number) => (
                          <div key={index} className="p-4 border rounded-lg hover:bg-gray-50">
                            <h4 className="font-medium text-gray-900">{place.name}</h4>
                            <p className="text-sm text-gray-600 mt-1">{place.address}</p>
                            {place.rating && (
                              <div className="flex items-center space-x-1 mt-2">
                                <span className="text-yellow-500">★</span>
                                <span className="text-sm">{place.rating}/5</span>
                              </div>
                            )}
                            <div className="flex flex-wrap gap-1 mt-2">
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
                ) : (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      No real estate market data available for this area.
                    </AlertDescription>
                  </Alert>
                )}
              </TabsContent>

              <TabsContent value="monitoring" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Commission Protection Setup</CardTitle>
                    <CardDescription>
                      Monitor this property for ownership changes and potential contract breaches
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {parcelData && parcelData.success ? (
                      <div className="space-y-4">
                        <Alert className="border-green-200 bg-green-50">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <AlertDescription>
                            Property data found. You can now set up automated monitoring for ownership changes.
                          </AlertDescription>
                        </Alert>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-4 border rounded-lg">
                            <h4 className="font-medium mb-2">Current Owner Monitoring</h4>
                            <p className="text-sm text-gray-600 mb-3">
                              Track changes to: {parcelData.parcel.owner}
                            </p>
                            <Button variant="outline" className="w-full">
                              Enable Owner Alerts
                            </Button>
                          </div>
                          
                          <div className="p-4 border rounded-lg">
                            <h4 className="font-medium mb-2">Sale Transaction Alerts</h4>
                            <p className="text-sm text-gray-600 mb-3">
                              Get notified of new sale recordings
                            </p>
                            <Button variant="outline" className="w-full">
                              Enable Sale Alerts
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          Property data required to set up monitoring. Please ensure the address is valid.
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}

        {/* API Status */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Data Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="font-medium text-green-800">Google Maps Geocoding</span>
                <Badge variant="outline" className="text-green-600 border-green-600">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Live
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="font-medium text-green-800">Regrid Property Data</span>
                <Badge variant="outline" className="text-green-600 border-green-600">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Live
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="font-medium text-green-800">Real Estate Market Data</span>
                <Badge variant="outline" className="text-green-600 border-green-600">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Live
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}