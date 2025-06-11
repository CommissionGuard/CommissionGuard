import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Search,
  MapPin,
  Building,
  DollarSign,
  Calendar,
  User,
  FileText,
  AlertCircle,
  Home,
  Compass,
  Activity,
  TrendingUp,
  BarChart3,
  Brain,
  Star,
  AlertTriangle,
  CheckCircle,
  Target,
  Sparkles,
  PieChart
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface PropertyData {
  address: string;
  latitude: number;
  longitude: number;
  placeId: string;
  components: any;
  types: string[];
}

interface ParcelData {
  parcelId?: string;
  owner?: string;
  ownerAddress?: string;
  propertyType?: string;
  squareFootage?: number;
  yearBuilt?: number;
  assessedValue?: number;
  marketValue?: number;
  lastSaleDate?: string;
  lastSalePrice?: number;
  taxAssessment?: {
    landValue?: number;
    improvementValue?: number;
    totalValue?: number;
    exemptions?: string[];
  };
}

interface OwnershipRecord {
  date: string;
  owner: string;
  salePrice?: number;
  documentType?: string;
}

interface NearbyProperty {
  address: string;
  distance: number;
  estimatedValue?: number;
  propertyType?: string;
}

const formatCurrency = (amount: number | undefined): string => {
  if (!amount) return "N/A";
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return "N/A";
  try {
    return new Date(dateString).toLocaleDateString();
  } catch {
    return dateString;
  }
};

export default function PropertyResearch() {
  const { toast } = useToast();
  const [searchAddress, setSearchAddress] = useState("");
  const [geocodeResult, setGeocodeResult] = useState<PropertyData | null>(null);
  const [parcelData, setParcelData] = useState<ParcelData | null>(null);
  const [ownershipHistory, setOwnershipHistory] = useState<OwnershipRecord[]>([]);
  const [nearbyResults, setNearbyResults] = useState<NearbyProperty[]>([]);

  const researchMutation = useMutation({
    mutationFn: async (address: string) => {
      // First geocode the address
      const geocodeResponse = await apiRequest("POST", "/api/property/geocode", { address });
      if (!geocodeResponse.success) {
        throw new Error(geocodeResponse.error || "Failed to geocode address");
      }

      setGeocodeResult(geocodeResponse);

      // Get parcel data
      const parcelResponse = await apiRequest("POST", "/api/property/parcel", {
        latitude: geocodeResponse.latitude,
        longitude: geocodeResponse.longitude
      });
      
      if (parcelResponse.success && parcelResponse.data) {
        setParcelData(parcelResponse.data);

        // Get ownership history if we have a parcel ID
        if (parcelResponse.data.parcelId) {
          try {
            const historyResponse = await apiRequest("POST", "/api/property/ownership-history", {
              parcelId: parcelResponse.data.parcelId
            });
            if (historyResponse.success && historyResponse.data) {
              setOwnershipHistory(historyResponse.data);
            }
          } catch (error) {
            console.warn("Could not fetch ownership history:", error);
          }
        }
      }

      // Get nearby properties
      try {
        const nearbyResponse = await apiRequest("POST", "/api/property/nearby", {
          latitude: geocodeResponse.latitude,
          longitude: geocodeResponse.longitude,
          radius: 1000
        });
        if (nearbyResponse.success && nearbyResponse.data) {
          setNearbyResults(nearbyResponse.data);
        }
      } catch (error) {
        console.warn("Could not fetch nearby properties:", error);
      }

      return geocodeResponse;
    },
    onSuccess: () => {
      toast({
        title: "Research Complete",
        description: "Property data has been retrieved successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Research Failed",
        description: error.message || "Could not retrieve property data.",
        variant: "destructive",
      });
    },
  });

  const handleResearch = async () => {
    if (!searchAddress.trim()) {
      toast({
        title: "Address Required",
        description: "Please enter a property address to research.",
        variant: "destructive",
      });
      return;
    }
    
    // Clear previous results
    setGeocodeResult(null);
    setParcelData(null);
    setOwnershipHistory([]);
    setNearbyResults([]);
    
    researchMutation.mutate(searchAddress);
  };

  const clearResults = () => {
    setSearchAddress("");
    setGeocodeResult(null);
    setParcelData(null);
    setOwnershipHistory([]);
    setNearbyResults([]);
    researchMutation.reset();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
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
              Enter any property address to get complete ownership, tax, and market data. For best coverage, try addresses in Texas, California, Colorado, or Georgia.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="address">Property Address</Label>
              <Input
                id="address"
                value={searchAddress}
                onChange={(e) => setSearchAddress(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleResearch()}
                placeholder="e.g., 123 Main Street, Austin, TX 78701"
                className="mt-1"
              />
            </div>
            <div className="flex space-x-2">
              <Button 
                onClick={handleResearch}
                disabled={researchMutation.isPending || !searchAddress.trim()}
                className="flex items-center space-x-2"
              >
                <Search className="h-4 w-4" />
                <span>{researchMutation.isPending ? "Researching..." : "Research Property"}</span>
              </Button>
              <Button 
                variant="outline" 
                onClick={clearResults}
                disabled={researchMutation.isPending}
              >
                Clear Results
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results Section */}
        {geocodeResult && (
          <div className="space-y-6">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="ownership">Ownership</TabsTrigger>
                <TabsTrigger value="nearby">Nearby Properties</TabsTrigger>
                <TabsTrigger value="analysis">Analysis</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                {!parcelData ? (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {parcelData === null ? "No detailed property data available for this address." : "Loading property details..."}
                    </AlertDescription>
                  </Alert>
                ) : null}

                {!nearbyResults?.length ? (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {nearbyResults === null ? "No nearby properties found." : "Loading nearby properties..."}
                    </AlertDescription>
                  </Alert>
                ) : null}

                {/* Property Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <MapPin className="h-5 w-5" />
                      <span>Property Information</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Address</Label>
                        <p className="text-gray-900">{geocodeResult.address}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Coordinates</Label>
                        <p className="text-gray-900">
                          {geocodeResult.latitude.toFixed(6)}, {geocodeResult.longitude.toFixed(6)}
                        </p>
                      </div>
                      {parcelData?.owner && (
                        <div>
                          <Label className="text-sm font-medium text-gray-500">
                            <User className="h-4 w-4 inline mr-1" />
                            Owner
                          </Label>
                          <p className="text-gray-900">{parcelData.owner}</p>
                        </div>
                      )}
                      {parcelData?.propertyType && (
                        <div>
                          <Label className="text-sm font-medium text-gray-500">Property Type</Label>
                          <Badge variant="secondary">{parcelData.propertyType}</Badge>
                        </div>
                      )}
                    </div>

                    {parcelData?.marketValue && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                        <div>
                          <Label className="text-sm font-medium text-gray-500">Market Value</Label>
                          <p className="text-2xl font-bold text-green-600">{formatCurrency(parcelData.marketValue)}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-500">Last Sale Price</Label>
                          <p className="text-lg font-semibold text-gray-900">{formatCurrency(parcelData.lastSalePrice)}</p>
                          <p className="text-sm text-gray-500">{formatDate(parcelData.lastSaleDate)}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-500">Square Footage</Label>
                          <p className="text-lg font-semibold text-gray-900">
                            {parcelData.squareFootage ? `${parcelData.squareFootage?.toLocaleString()} sq ft` : "N/A"}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Property Details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Year Built</Label>
                        <p className="text-gray-900">{parcelData?.yearBuilt || "N/A"}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Assessed Value</Label>
                        <p className="text-gray-900">{formatCurrency(parcelData?.assessedValue)}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Parcel ID</Label>
                        <p className="text-gray-900 text-sm font-mono">{parcelData?.parcelId || "N/A"}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Tax Assessment */}
                {parcelData?.taxAssessment && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <FileText className="h-5 w-5" />
                        <span>Tax Assessment</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-gray-500">Land Value</Label>
                          <p className="text-lg font-semibold text-gray-900">{formatCurrency(parcelData.taxAssessment.landValue)}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-500">Improvement Value</Label>
                          <p className="text-lg font-semibold text-gray-900">{formatCurrency(parcelData.taxAssessment.improvementValue)}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-500">Total Assessed Value</Label>
                          <p className="text-lg font-semibold text-gray-900">{formatCurrency(parcelData.taxAssessment.totalValue)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Coverage Information */}
                {parcelData?.parcelId ? (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      ✓ Complete property data available from Regrid API including ownership, assessment, and parcel details.
                      {parcelData.owner && ` Current owner: ${parcelData.owner}.`}
                      {parcelData.propertyType && ` Property type: ${parcelData.propertyType}.`}
                      {parcelData.yearBuilt && ` Built in ${parcelData.yearBuilt}.`}
                      {parcelData.marketValue && ` Market value: ${formatCurrency(parcelData.marketValue)}.`}
                      {parcelData.lastSaleDate && parcelData.lastSalePrice && 
                        ` Last sold on ${formatDate(parcelData.lastSaleDate)} for ${formatCurrency(parcelData.lastSalePrice)}.`}
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Limited property data available. This may be due to the property being outside our coverage area or data not being publicly available.
                    </AlertDescription>
                  </Alert>
                )}
              </TabsContent>

              {/* Ownership Tab */}
              <TabsContent value="ownership" className="space-y-6">
                {ownershipHistory && ownershipHistory.length > 0 ? (
                  <Card>
                    <CardHeader>
                      <CardTitle>Ownership History</CardTitle>
                      <CardDescription>
                        Historical ownership records and property transfers
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {ownershipHistory.map((record, index) => (
                          <div key={index} className="border-l-2 border-blue-200 pl-4 pb-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium text-gray-900">{record.owner}</p>
                                <p className="text-sm text-gray-500">{formatDate(record.date)}</p>
                              </div>
                              {record.salePrice && (
                                <p className="text-lg font-semibold text-green-600">{formatCurrency(record.salePrice)}</p>
                              )}
                            </div>
                            {record.documentType && (
                              <Badge variant="outline" className="mt-2">{record.documentType}</Badge>
                            )}
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

              {/* Nearby Properties Tab */}
              <TabsContent value="nearby" className="space-y-6">
                {nearbyResults && nearbyResults.length > 0 ? (
                  <Card>
                    <CardHeader>
                      <CardTitle>Nearby Properties</CardTitle>
                      <CardDescription>
                        Properties within 1 kilometer of the searched address
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {nearbyResults.map((property, index) => (
                          <div key={index} className="border rounded-lg p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium text-gray-900">{property.address}</p>
                                <p className="text-sm text-gray-500">{property.distance}m away</p>
                                {property.propertyType && (
                                  <Badge variant="secondary" className="mt-1">{property.propertyType}</Badge>
                                )}
                              </div>
                              {property.estimatedValue && (
                                <p className="text-lg font-semibold text-green-600">
                                  {formatCurrency(property.estimatedValue)}
                                </p>
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
                      No nearby properties found.
                    </AlertDescription>
                  </Alert>
                )}
              </TabsContent>

              {/* Analysis Tab */}
              <TabsContent value="analysis" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Property Analysis</CardTitle>
                    <CardDescription>
                      Insights and recommendations based on available data
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {parcelData?.marketValue ? (
                      <div className="space-y-4">
                        <Alert>
                          <Target className="h-4 w-4" />
                          <AlertDescription>
                            This property analysis is based on current market data and public records.
                          </AlertDescription>
                        </Alert>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-4 border rounded-lg">
                            <h4 className="font-medium text-gray-900 mb-2">Market Position</h4>
                            <p className="text-sm text-gray-600">
                              Current market value: {formatCurrency(parcelData.marketValue)}
                            </p>
                          </div>
                          <div className="p-4 border rounded-lg">
                            <h4 className="font-medium text-gray-900 mb-2">Investment Potential</h4>
                            <p className="text-sm text-gray-600">
                              Analysis requires additional market data for comprehensive evaluation.
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          Analysis requires property valuation data. Please try a different address or check back later.
                        </AlertDescription>
                      </Alert>
                    )}
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