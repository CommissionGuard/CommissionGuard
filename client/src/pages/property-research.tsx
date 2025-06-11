import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import Navbar from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { 
  Search, 
  MapPin, 
  TrendingUp, 
  DollarSign, 
  Home,
  Calendar,
  Users,
  Building,
  Brain,
  Star,
  AlertTriangle,
  CheckCircle,

  Target,
  Sparkles,
  PieChart,
  Activity
} from "lucide-react";

export default function PropertyResearch() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [searchAddress, setSearchAddress] = useState("");
  const [valuationData, setValuationData] = useState<any>(null);
  const [marketAnalysis, setMarketAnalysis] = useState<any>(null);
  const [compareAddresses, setCompareAddresses] = useState<string[]>([""]);
  const [comparisonData, setComparisonData] = useState<any>(null);
  
  const getValuationTrendsMutation = useMutation({
    mutationFn: async (address: string) => {
      return await apiRequest("POST", "/api/properties/valuation-trends", { address });
    },
    onSuccess: (result) => {
      setValuationData(result);
      toast({
        title: "Valuation Analysis Complete",
        description: "AI-powered property valuation trends have been generated.",
      });
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
        title: "Analysis Failed",
        description: "Failed to analyze property valuation. Please try again.",
        variant: "destructive",
      });
    },
  });

  const getRentalAnalysisMutation = useMutation({
    mutationFn: async (location: string) => {
      return await apiRequest("POST", "/api/rental-market/analyze", { location });
    },
    onSuccess: (result) => {
      setMarketAnalysis(result);
      toast({
        title: "Market Analysis Complete",
        description: "Rental market insights have been generated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Analysis Failed",
        description: "Failed to analyze rental market. Please try again.",
        variant: "destructive",
      });
    },
  });

  const comparePropertiesMutation = useMutation({
    mutationFn: async (addresses: string[]) => {
      return await apiRequest("POST", "/api/properties/compare", { addresses });
    },
    onSuccess: (result) => {
      setComparisonData(result);
      toast({
        title: "Comparison Complete",
        description: "Property comparison analysis is ready.",
      });
    },
    onError: (error) => {
      toast({
        title: "Comparison Failed",
        description: "Failed to compare properties. Please try again.",
        variant: "destructive",
      });
    },
  });

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

  const handleAnalyzeProperty = () => {
    if (!searchAddress.trim()) {
      toast({
        title: "Address Required",
        description: "Please enter a property address to analyze.",
        variant: "destructive",
      });
      return;
    }
    getValuationTrendsMutation.mutate(searchAddress);
  };

  const handleRentalAnalysis = () => {
    if (!searchAddress.trim()) {
      toast({
        title: "Location Required",
        description: "Please enter a location for rental market analysis.",
        variant: "destructive",
      });
      return;
    }
    getRentalAnalysisMutation.mutate(searchAddress);
  };

  const handleCompareProperties = () => {
    const validAddresses = compareAddresses.filter(addr => addr.trim());
    if (validAddresses.length < 2) {
      toast({
        title: "Multiple Addresses Required",
        description: "Please enter at least 2 property addresses to compare.",
        variant: "destructive",
      });
      return;
    }
    comparePropertiesMutation.mutate(validAddresses);
  };

  const addCompareAddress = () => {
    setCompareAddresses([...compareAddresses, ""]);
  };

  const updateCompareAddress = (index: number, value: string) => {
    const updated = [...compareAddresses];
    updated[index] = value;
    setCompareAddresses(updated);
  };

  const removeCompareAddress = (index: number) => {
    if (compareAddresses.length > 1) {
      const updated = compareAddresses.filter((_, i) => i !== index);
      setCompareAddresses(updated);
    }
  };

  const getInvestmentScoreColor = (score: number) => {
    if (score >= 8) return "text-green-600";
    if (score >= 6) return "text-yellow-600";
    return "text-red-600";
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-teal-600 rounded-lg">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Enhanced Property Research</h1>
          </div>
          <p className="text-gray-600">
            AI-powered property intelligence with valuation tracking, market predictions, and comparative analysis
          </p>
        </div>

        <Tabs defaultValue="valuation" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="valuation">Valuation Trends</TabsTrigger>
            <TabsTrigger value="rental">Rental Market</TabsTrigger>
            <TabsTrigger value="compare">Property Comparison</TabsTrigger>
          </TabsList>

          {/* Valuation Trends Tab */}
          <TabsContent value="valuation">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      <span>Property Valuation Analysis</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex space-x-3">
                      <Input
                        placeholder="Enter property address..."
                        value={searchAddress}
                        onChange={(e) => setSearchAddress(e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        onClick={handleAnalyzeProperty}
                        disabled={getValuationTrendsMutation.isPending}
                        className="bg-gradient-to-r from-blue-500 to-teal-600 hover:from-blue-600 hover:to-teal-700"
                      >
                        {getValuationTrendsMutation.isPending ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4 mr-2" />
                            Analyze
                          </>
                        )}
                      </Button>
                    </div>

                    {valuationData && (
                      <div className="space-y-6">
                        {/* Current Value & Score */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm text-blue-600 font-medium">Current Value</p>
                                <p className="text-2xl font-bold text-blue-900">
                                  {formatCurrency(valuationData.currentValue)}
                                </p>
                              </div>
                              <Home className="h-8 w-8 text-blue-600" />
                            </div>
                          </div>
                          <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm text-green-600 font-medium">Investment Score</p>
                                <div className="flex items-center space-x-2">
                                  <span className={`text-2xl font-bold ${getInvestmentScoreColor(valuationData.investmentScore)}`}>
                                    {valuationData.investmentScore}/10
                                  </span>
                                  <Star className="h-5 w-5 text-yellow-500" />
                                </div>
                              </div>
                              <Target className="h-8 w-8 text-green-600" />
                            </div>
                          </div>
                        </div>

                        {/* Value History Chart */}
                        <Card>
                          <CardHeader>
                            <CardTitle>Value History & Predictions</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                              <LineChart data={valuationData.valueHistory}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip formatter={(value) => [formatCurrency(Number(value)), "Value"]} />
                                <Line 
                                  type="monotone" 
                                  dataKey="value" 
                                  stroke="#3B82F6" 
                                  strokeWidth={2}
                                  dot={{ fill: "#3B82F6", strokeWidth: 2, r: 4 }}
                                />
                              </LineChart>
                            </ResponsiveContainer>
                          </CardContent>
                        </Card>

                        {/* AI Predictions */}
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                              <Brain className="h-5 w-5 text-purple-600" />
                              <span>AI Market Predictions</span>
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-3 gap-4">
                              <div className="text-center p-3 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-600">Next Month</p>
                                <p className="text-lg font-semibold text-gray-900">
                                  {formatCurrency(valuationData.predictions.nextMonth)}
                                </p>
                              </div>
                              <div className="text-center p-3 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-600">Next Quarter</p>
                                <p className="text-lg font-semibold text-gray-900">
                                  {formatCurrency(valuationData.predictions.nextQuarter)}
                                </p>
                              </div>
                              <div className="text-center p-3 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-600">Next Year</p>
                                <p className="text-lg font-semibold text-gray-900">
                                  {formatCurrency(valuationData.predictions.nextYear)}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Market Factors */}
                        {valuationData.marketFactors && valuationData.marketFactors.length > 0 && (
                          <Card>
                            <CardHeader>
                              <CardTitle>Key Market Factors</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <ul className="space-y-2">
                                {valuationData.marketFactors.map((factor: string, index: number) => (
                                  <li key={index} className="flex items-start space-x-2">
                                    <Activity className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                                    <span className="text-sm text-gray-700">{factor}</span>
                                  </li>
                                ))}
                              </ul>
                            </CardContent>
                          </Card>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Sparkles className="h-5 w-5 text-blue-600" />
                      <span>AI Features</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <TrendingUp className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-sm">Value Tracking</p>
                        <p className="text-xs text-gray-600">Historical trends & predictions</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Brain className="h-5 w-5 text-purple-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-sm">AI Predictions</p>
                        <p className="text-xs text-gray-600">Machine learning forecasts</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Target className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-sm">Investment Score</p>
                        <p className="text-xs text-gray-600">Comprehensive rating system</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Rental Market Tab */}
          <TabsContent value="rental">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Building className="h-5 w-5 text-primary" />
                  <span>Rental Market Analysis</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex space-x-3">
                  <Input
                    placeholder="Enter location (e.g., San Francisco, CA)..."
                    value={searchAddress}
                    onChange={(e) => setSearchAddress(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleRentalAnalysis}
                    disabled={getRentalAnalysisMutation.isPending}
                    className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
                  >
                    {getRentalAnalysisMutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <PieChart className="h-4 w-4 mr-2" />
                        Analyze Market
                      </>
                    )}
                  </Button>
                </div>

                {marketAnalysis && (
                  <div className="space-y-6">
                    {/* Key Metrics */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-purple-600 font-medium">Avg Rent</p>
                            <p className="text-xl font-bold text-purple-900">
                              {formatCurrency(marketAnalysis.averageRent)}
                            </p>
                          </div>
                          <DollarSign className="h-6 w-6 text-purple-600" />
                        </div>
                      </div>
                      <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-green-600 font-medium">Occupancy</p>
                            <p className="text-xl font-bold text-green-900">
                              {Math.round(marketAnalysis.occupancyRate * 100)}%
                            </p>
                          </div>
                          <CheckCircle className="h-6 w-6 text-green-600" />
                        </div>
                      </div>
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-blue-600 font-medium">Days on Market</p>
                            <p className="text-xl font-bold text-blue-900">
                              {marketAnalysis.timeOnMarket}
                            </p>
                          </div>
                          <Calendar className="h-6 w-6 text-blue-600" />
                        </div>
                      </div>
                      <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-yellow-600 font-medium">Rental Yield</p>
                            <p className="text-xl font-bold text-yellow-900">
                              {marketAnalysis.rentalYield.toFixed(1)}%
                            </p>
                          </div>
                          <TrendingUp className="h-6 w-6 text-yellow-600" />
                        </div>
                      </div>
                    </div>

                    {/* Rent Trends Chart */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Rental Trends</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <LineChart data={marketAnalysis.rentTrends}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="period" />
                            <YAxis />
                            <Tooltip formatter={(value) => [formatCurrency(Number(value)), "Rent"]} />
                            <Line 
                              type="monotone" 
                              dataKey="rent" 
                              stroke="#8B5CF6" 
                              strokeWidth={2}
                              dot={{ fill: "#8B5CF6", strokeWidth: 2, r: 4 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>

                    {/* Market Segments */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Market Segments</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {marketAnalysis.marketSegments.map((segment: any, index: number) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center space-x-3">
                                <Building className="h-5 w-5 text-gray-600" />
                                <div>
                                  <p className="font-medium">{segment.type}</p>
                                  <p className="text-sm text-gray-600">{formatCurrency(segment.averageRent)}/month</p>
                                </div>
                              </div>
                              <div className="flex space-x-2">
                                <Badge variant={segment.demand === "high" ? "default" : segment.demand === "medium" ? "secondary" : "outline"}>
                                  {segment.demand} demand
                                </Badge>
                                <Badge variant={segment.supply === "low" ? "default" : segment.supply === "medium" ? "secondary" : "outline"}>
                                  {segment.supply} supply
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* AI Recommendations */}
                    {marketAnalysis.recommendations && marketAnalysis.recommendations.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center space-x-2">
                            <Brain className="h-5 w-5 text-purple-600" />
                            <span>AI Investment Recommendations</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2">
                            {marketAnalysis.recommendations.map((rec: string, index: number) => (
                              <li key={index} className="flex items-start space-x-2">
                                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                <span className="text-sm text-gray-700">{rec}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Property Comparison Tab */}
          <TabsContent value="compare">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5 text-primary" />
                  <span>Property Comparison</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {compareAddresses.map((address, index) => (
                    <div key={index} className="flex space-x-2">
                      <Input
                        placeholder={`Property ${index + 1} address...`}
                        value={address}
                        onChange={(e) => updateCompareAddress(index, e.target.value)}
                        className="flex-1"
                      />
                      {compareAddresses.length > 1 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeCompareAddress(index)}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  ))}
                  <div className="flex space-x-2">
                    <Button variant="outline" onClick={addCompareAddress}>
                      Add Property
                    </Button>
                    <Button
                      onClick={handleCompareProperties}
                      disabled={comparePropertiesMutation.isPending}
                      className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700"
                    >
                      {comparePropertiesMutation.isPending ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Comparing...
                        </>
                      ) : (
                        <>
                          <Activity className="h-4 w-4 mr-2" />
                          Compare Properties
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {comparisonData && (
                  <div className="space-y-6">
                    {/* Market Summary */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Market Summary</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                          <div className="text-center">
                            <p className="text-sm text-gray-600">Average Value</p>
                            <p className="text-lg font-semibold">{formatCurrency(comparisonData.marketSummary.averageValue)}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-gray-600">Best Investment</p>
                            <p className="text-lg font-semibold text-green-600">
                              {comparisonData.marketSummary.bestInvestment.split(',')[0]}
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-gray-600">Highest Appreciation</p>
                            <p className="text-lg font-semibold text-blue-600">
                              {comparisonData.marketSummary.highestAppreciation.split(',')[0]}
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-gray-600">Market Trend</p>
                            <p className="text-lg font-semibold text-purple-600">
                              {comparisonData.marketSummary.marketTrend}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Property Comparison Table */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Property Comparison</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b">
                                <th className="text-left p-2">Address</th>
                                <th className="text-right p-2">Value</th>
                                <th className="text-right p-2">Price/SqFt</th>
                                <th className="text-right p-2">Appreciation</th>
                                <th className="text-center p-2">Score</th>
                                <th className="text-center p-2">Position</th>
                              </tr>
                            </thead>
                            <tbody>
                              {comparisonData.properties.map((property: any, index: number) => (
                                <tr key={index} className="border-b">
                                  <td className="p-2">
                                    <div className="font-medium">{property.address.split(',')[0]}</div>
                                    <div className="text-sm text-gray-600">{property.address.split(',').slice(1).join(',')}</div>
                                  </td>
                                  <td className="text-right p-2 font-semibold">
                                    {formatCurrency(property.currentValue)}
                                  </td>
                                  <td className="text-right p-2">
                                    ${property.pricePerSqFt.toFixed(0)}
                                  </td>
                                  <td className="text-right p-2">
                                    <span className={property.appreciation >= 0 ? "text-green-600" : "text-red-600"}>
                                      {property.appreciation >= 0 ? "+" : ""}{property.appreciation.toFixed(1)}%
                                    </span>
                                  </td>
                                  <td className="text-center p-2">
                                    <span className={`font-semibold ${getInvestmentScoreColor(property.investmentScore)}`}>
                                      {property.investmentScore}/10
                                    </span>
                                  </td>
                                  <td className="text-center p-2">
                                    <Badge 
                                      variant={
                                        property.marketPosition === "undervalued" ? "default" :
                                        property.marketPosition === "fairly-valued" ? "secondary" : "outline"
                                      }
                                    >
                                      {property.marketPosition.replace("-", " ")}
                                    </Badge>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
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
            
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-gray-600 mb-3">
                <strong>Data Coverage Note:</strong> Property databases have geographic limitations. The APIs connect successfully but data availability varies by location and property type.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="text-sm text-gray-600 mr-2">Test with known addresses:</span>
                {[
                  "1600 Amphitheatre Parkway, Mountain View, CA",
                  "1 Apple Park Way, Cupertino, CA", 
                  "410 Terry Ave N, Seattle, WA"
                ].map((addr) => (
                  <Button
                    key={addr}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearchAddress(addr);
                      researchMutation.mutate(addr);
                    }}
                    className="text-xs"
                  >
                    {addr.split(',')[0]}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* API Status Section */}
        {geocodeResult && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span>API Integration Status</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span><strong>Google Maps:</strong> Successfully geocoded address</span>
                </div>
                <div className="flex items-center space-x-2">
                  {parcelData?.success ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-amber-600" />
                  )}
                  <span><strong>Property Data:</strong> {parcelData?.success ? "Records found" : "Limited coverage"}</span>
                </div>
                <div className="flex items-center space-x-2">
                  {nearbyResults?.success ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-amber-600" />
                  )}
                  <span><strong>Local Market:</strong> {nearbyResults?.success ? "Found businesses" : "Limited data"}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

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
                ) : parcelData && !parcelData.success ? (
                  <Alert className="border-blue-200 bg-blue-50">
                    <AlertCircle className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-800">
                      <div className="space-y-2">
                        <div><strong>{parcelData.error || "No property records found"}</strong></div>
                        {parcelData.explanation && (
                          <div className="text-sm">{parcelData.explanation}</div>
                        )}
                        {parcelData.apiStatus && (
                          <div className="text-sm">
                            <span className="font-medium">API Status:</span> {parcelData.apiStatus}
                          </div>
                        )}
                        {parcelData.recommendation && (
                          <div className="text-sm text-blue-600">
                            {parcelData.recommendation}
                          </div>
                        )}
                      </div>
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Search for a property address above to view detailed information.
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