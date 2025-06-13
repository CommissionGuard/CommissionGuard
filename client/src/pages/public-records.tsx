import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, FileText, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/navbar";
import AnimatedBackground from "@/components/animated-background";

interface PublicRecord {
  source: string;
  county: string;
  buyerName: string;
  sellerName?: string;
  propertyAddress: string;
  saleDate: string;
  salePrice: number;
  documentType?: string;
  documentNumber?: string;
  estimatedLostCommission: number;
}

interface SearchResult {
  success: boolean;
  county?: string;
  clientName: string;
  searchPeriod: { startDate: string; endDate: string };
  recordsFound?: number;
  records?: PublicRecord[];
  apiKeyConfigured?: boolean;
  sources?: string[];
  monitoring?: {
    scanResults?: {
      totalRecordsFound: number;
      breachesDetected: number;
      estimatedLostCommission: number;
      breachRecords: PublicRecord[];
      dataSource: string;
    };
    configuredCounties?: string[];
  };
}

export default function PublicRecordsPage() {
  const [clientName, setClientName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedCounty, setSelectedCounty] = useState("both");
  const { toast } = useToast();

  const searchMutation = useMutation({
    mutationFn: async (searchData: { clientName: string; startDate: string; endDate: string; county: string }) => {
      let endpoint = "/api/public-records/search";
      if (searchData.county === "nassau") {
        endpoint = "/api/public-records/nassau";
      } else if (searchData.county === "suffolk") {
        endpoint = "/api/public-records/suffolk";
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(searchData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Search failed: ${response.status} ${errorText}`);
      }

      return await response.json() as SearchResult;
    },
    onSuccess: (data) => {
      const recordCount = data.recordsFound || data.monitoring?.scanResults?.totalRecordsFound || 0;
      toast({
        title: "Search completed",
        description: `Found ${recordCount} records`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Search failed",
        description: error.message || "Unable to search public records",
        variant: "destructive",
      });
    },
  });

  const handleSearch = () => {
    if (!clientName || !startDate || !endDate) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    searchMutation.mutate({
      clientName: clientName.trim(),
      startDate,
      endDate,
      county: selectedCounty,
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusIcon = (apiKeyConfigured: boolean) => {
    return apiKeyConfigured ? (
      <CheckCircle className="w-4 h-4 text-green-600" />
    ) : (
      <XCircle className="w-4 h-4 text-red-600" />
    );
  };

  const renderRecords = (records: PublicRecord[]) => {
    if (!records || records.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No public records found for this search</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {records.map((record, index) => (
          <Card key={index} className="border-l-4 border-l-blue-500">
            <CardContent className="pt-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-lg">{record.propertyAddress}</h3>
                  <p className="text-sm text-gray-600">{record.county}</p>
                </div>
                <Badge variant="outline">{record.source}</Badge>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="font-medium text-gray-700">Buyer</p>
                  <p>{record.buyerName}</p>
                </div>
                {record.sellerName && (
                  <div>
                    <p className="font-medium text-gray-700">Seller</p>
                    <p>{record.sellerName}</p>
                  </div>
                )}
                <div>
                  <p className="font-medium text-gray-700">Sale Date</p>
                  <p>{formatDate(record.saleDate)}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-700">Sale Price</p>
                  <p className="font-semibold">{formatCurrency(record.salePrice)}</p>
                </div>
              </div>
              
              {record.estimatedLostCommission > 0 && (
                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span className="text-sm font-medium text-amber-800">
                      Potential Commission Impact: {formatCurrency(record.estimatedLostCommission)}
                    </span>
                  </div>
                </div>
              )}
              
              {record.documentNumber && (
                <div className="mt-3 text-xs text-gray-500">
                  Document #{record.documentNumber}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const searchResult = searchMutation.data;

  return (
    <div className="min-h-screen bg-gray-50">
      <AnimatedBackground />
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Nassau & Suffolk County Public Records</h1>
          <p className="text-gray-600">
            Search public property records to monitor client transactions and protect your commissions
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Search Form */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  Search Records
                </CardTitle>
                <CardDescription>
                  Enter client information to search public property records
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="clientName">Client Name *</Label>
                  <Input
                    id="clientName"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="John Smith"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="county">County</Label>
                  <Select value={selectedCounty} onValueChange={setSelectedCounty}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="both">Both Counties</SelectItem>
                      <SelectItem value="nassau">Nassau County Only</SelectItem>
                      <SelectItem value="suffolk">Suffolk County Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="startDate">Start Date *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="endDate">End Date *</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <Button 
                  onClick={handleSearch} 
                  disabled={searchMutation.isPending}
                  className="w-full"
                >
                  {searchMutation.isPending ? "Searching..." : "Search Records"}
                </Button>
              </CardContent>
            </Card>

            {/* API Status */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-sm">API Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Nassau County API</span>
                  {getStatusIcon(false)}
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Suffolk County API</span>
                  {getStatusIcon(false)}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Configure API keys for direct county access
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Results */}
          <div className="lg:col-span-2">
            {searchResult && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Search Results
                  </CardTitle>
                  <CardDescription>
                    {searchResult.clientName} • {formatDate(searchResult.searchPeriod?.startDate)} to {formatDate(searchResult.searchPeriod?.endDate)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {searchResult.monitoring ? (
                    // Combined search results
                    <Tabs defaultValue="overview" className="space-y-6">
                      <TabsList>
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="records">Records</TabsTrigger>
                        <TabsTrigger value="breaches">Potential Breaches</TabsTrigger>
                      </TabsList>

                      <TabsContent value="overview">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                          <Card>
                            <CardContent className="pt-6">
                              <div className="text-2xl font-bold">
                                {searchResult.monitoring.scanResults?.totalRecordsFound || 0}
                              </div>
                              <p className="text-xs text-gray-600">Total Records</p>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardContent className="pt-6">
                              <div className="text-2xl font-bold text-red-600">
                                {searchResult.monitoring.scanResults?.breachesDetected || 0}
                              </div>
                              <p className="text-xs text-gray-600">Potential Breaches</p>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardContent className="pt-6">
                              <div className="text-2xl font-bold text-green-600">
                                {formatCurrency(searchResult.monitoring.scanResults?.estimatedLostCommission || 0)}
                              </div>
                              <p className="text-xs text-gray-600">At Risk Commission</p>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardContent className="pt-6">
                              <div className="text-2xl font-bold">
                                {searchResult.monitoring.configuredCounties?.length || 0}
                              </div>
                              <p className="text-xs text-gray-600">Counties Monitored</p>
                            </CardContent>
                          </Card>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <h3 className="font-semibold mb-2">Data Sources</h3>
                            <p className="text-sm text-gray-600">{searchResult.monitoring.scanResults?.dataSource}</p>
                          </div>
                          
                          <div>
                            <h3 className="font-semibold mb-2">Monitoring Status</h3>
                            <div className="space-y-1 text-sm">
                              {searchResult.monitoring.configuredCounties?.map((county: string, index: number) => (
                                <p key={index} className="text-gray-600">{county}</p>
                              ))}
                            </div>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="records">
                        {renderRecords(searchResult.monitoring.scanResults?.breachRecords || [])}
                      </TabsContent>

                      <TabsContent value="breaches">
                        {searchResult.monitoring.scanResults?.breachRecords && searchResult.monitoring.scanResults.breachRecords.length > 0 ? (
                          <div className="space-y-4">
                            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                              <h3 className="font-semibold text-red-800 mb-2">Commission Protection Alert</h3>
                              <p className="text-sm text-red-700">
                                Potential commission breaches detected. Review these transactions carefully.
                              </p>
                            </div>
                            {renderRecords(searchResult.monitoring.scanResults.breachRecords)}
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-600" />
                            <h3 className="font-semibold text-green-800 mb-2">No Breaches Detected</h3>
                            <p className="text-sm text-green-700">
                              All transactions appear to be in compliance with your representation agreements.
                            </p>
                          </div>
                        )}
                      </TabsContent>
                    </Tabs>
                  ) : (
                    // Single county results
                    <div>
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h3 className="font-semibold">
                            {searchResult.recordsFound || 0} records found in {searchResult.county}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Sources: {searchResult.sources?.join(", ") || "Multiple"}
                          </p>
                        </div>
                        <Badge variant={searchResult.apiKeyConfigured ? "default" : "secondary"}>
                          {searchResult.apiKeyConfigured ? "Official API" : "Public Search"}
                        </Badge>
                      </div>
                      {renderRecords(searchResult.records || [])}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {!searchResult && !searchMutation.isPending && (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8 text-gray-500">
                    <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Enter search criteria to find public property records</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}