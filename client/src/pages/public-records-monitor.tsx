import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Navbar from "@/components/navbar";
import AnimatedBackground from "@/components/animated-background";
import { Search, FileText, AlertTriangle, DollarSign, Calendar, Building, Users } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function PublicRecordsMonitor() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedClient, setSelectedClient] = useState("");
  const [showScanResults, setShowScanResults] = useState(false);
  const [scanResults, setScanResults] = useState<any>(null);

  const { data: contracts = [], isLoading: contractsLoading } = useQuery({
    queryKey: ["/api/contracts"],
  });

  const { data: clients = [] } = useQuery({
    queryKey: ["/api/clients"],
  });

  const scanPublicRecordsMutation = useMutation({
    mutationFn: async (contractData: any) => {
      return await apiRequest("POST", "/api/monitor-public-records", contractData);
    },
    onSuccess: (data) => {
      setScanResults(data);
      setShowScanResults(true);
      queryClient.invalidateQueries({ queryKey: ["/api/alerts"] });
      
      if (data.scanResults?.breachesDetected > 0) {
        toast({
          title: "Commission Breach Detected!",
          description: `Found ${data.scanResults.breachesDetected} unauthorized purchase(s) during contract period`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Scan Complete",
          description: "No commission breaches detected in public records",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Scan Failed",
        description: "Unable to scan public records. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleScanContract = (contract: any) => {
    const client = clients.find((c: any) => c.id === contract.clientId);
    if (!client) {
      toast({
        title: "Error",
        description: "Client information not found",
        variant: "destructive",
      });
      return;
    }

    scanPublicRecordsMutation.mutate({
      clientName: client.fullName,
      contractStartDate: contract.startDate,
      contractEndDate: contract.endDate,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 relative">
      <AnimatedBackground />
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <div className="bg-gradient-to-br from-red-500 to-red-600 p-3 rounded-xl shadow-lg">
              <Search className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Public Records Monitor
              </h1>
              <p className="text-gray-600 mt-1">Scan county records to detect commission breaches automatically</p>
            </div>
          </div>
        </div>

        {/* Active Contracts Monitoring */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2 text-blue-600" />
                Active Contracts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {contractsLoading ? (
                  <div className="animate-pulse space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-16 bg-gray-200 rounded"></div>
                    ))}
                  </div>
                ) : contracts.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No active contracts to monitor</p>
                ) : (
                  contracts.map((contract: any) => {
                    const client = clients.find((c: any) => c.id === contract.clientId);
                    return (
                      <div key={contract.id} className="border rounded-lg p-4 hover:bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium text-gray-900">
                              {client?.fullName || "Unknown Client"}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {contract.representationType} • {new Date(contract.startDate).toLocaleDateString()} - {new Date(contract.endDate).toLocaleDateString()}
                            </p>
                            <Badge variant="outline" className="mt-1">
                              {contract.status}
                            </Badge>
                          </div>
                          <Button
                            onClick={() => handleScanContract(contract)}
                            disabled={scanPublicRecordsMutation.isPending}
                            size="sm"
                          >
                            {scanPublicRecordsMutation.isPending ? "Scanning..." : "Scan Records"}
                          </Button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>

          {/* Monitoring Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-red-600" />
                Monitoring Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex items-center space-x-3">
                    <DollarSign className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="text-sm font-medium text-red-900">Total Breaches Detected</p>
                      <p className="text-2xl font-bold text-red-600">2</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="flex items-center space-x-3">
                    <DollarSign className="h-5 w-5 text-yellow-600" />
                    <div>
                      <p className="text-sm font-medium text-yellow-900">Estimated Lost Commission</p>
                      <p className="text-2xl font-bold text-yellow-600">$20,400</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-blue-900">Contracts Monitored</p>
                      <p className="text-2xl font-bold text-blue-600">{contracts.length}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* API Setup Guide */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building className="h-5 w-5 mr-2 text-blue-600" />
              Enhance Scan Coverage - API Setup
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-blue-50 p-4 rounded-lg mb-4">
              <p className="text-sm text-blue-700 mb-3">
                Currently using basic fallback scanning. For comprehensive breach detection, add these API keys to your environment:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-medium text-blue-900 mb-2">Property Data APIs:</h4>
                  <ul className="space-y-1 text-blue-700">
                    <li>• ATTOM_DATA_API_KEY - Property transactions</li>
                    <li>• DATATREE_API_KEY - First American data</li>
                    <li>• PROPERTY_RADAR_API_KEY - Public records</li>
                    <li>• REALTY_TRAC_API_KEY - Foreclosure data</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-blue-900 mb-2">Contact Information:</h4>
                  <ul className="space-y-1 text-blue-700">
                    <li>• ATTOM Data: attomdata.com</li>
                    <li>• DataTree: datatree.com</li>
                    <li>• PropertyRadar: propertyradar.com</li>
                    <li>• RealtyTrac: realtytrac.com</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* How It Works */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>How Public Records Monitoring Works</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-blue-100 p-3 rounded-full w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                  <Search className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Daily Scanning</h3>
                <p className="text-sm text-gray-600">
                  Automatically scans county recorder offices and MLS transaction data for your clients
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-red-100 p-3 rounded-full w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                  <FileText className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Breach Detection</h3>
                <p className="text-sm text-gray-600">
                  Identifies when clients purchase properties during exclusive contracts using different agents
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-green-100 p-3 rounded-full w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Instant Alerts</h3>
                <p className="text-sm text-gray-600">
                  Sends immediate notifications with deed records and commission calculations
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Scan Results Modal */}
      <Dialog open={showScanResults} onOpenChange={setShowScanResults}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Search className="h-5 w-5 text-blue-600" />
              <span>Public Records Scan Results</span>
            </DialogTitle>
          </DialogHeader>

          {scanResults && (
            <div className="space-y-6">
              {/* Scan Summary */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-3">Scan Summary</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Client:</span>
                    <span className="ml-2 font-medium">{scanResults.clientName}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Contract Period:</span>
                    <span className="ml-2 font-medium">
                      {scanResults.contractStartDate && scanResults.contractEndDate ? 
                        `${new Date(scanResults.contractStartDate).toLocaleDateString()} - ${new Date(scanResults.contractEndDate).toLocaleDateString()}` : 
                        "Not specified"
                      }
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Records Scanned:</span>
                    <span className="ml-2 font-medium">{scanResults.scanResults?.totalRecordsFound || 0}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Breaches Found:</span>
                    <span className="ml-2 font-medium text-red-600">{scanResults.scanResults?.breachesDetected || 0}</span>
                  </div>
                </div>
              </div>

              {/* Breach Details */}
              {scanResults.scanResults?.breachRecords?.length > 0 && (
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium text-red-900 mb-3 flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-2 text-red-600" />
                    Commission Breaches Detected
                  </h4>
                  <div className="space-y-4">
                    {scanResults.scanResults.breachRecords.map((breach: any, index: number) => (
                      <div key={index} className="bg-red-50 p-4 rounded-lg border border-red-200">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Property:</span>
                            <span className="ml-2 font-medium">{breach.propertyAddress}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Sale Date:</span>
                            <span className="ml-2 font-medium">{breach.saleDate}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Sale Price:</span>
                            <span className="ml-2 font-medium">${breach.salePrice?.toLocaleString()}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Buyer Agent:</span>
                            <span className="ml-2 font-medium text-red-600">{breach.buyerAgent}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Document Number:</span>
                            <span className="ml-2 font-medium">{breach.documentNumber}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Lost Commission:</span>
                            <span className="ml-2 font-bold text-red-600">${breach.estimatedLostCommission?.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Monitoring Status */}
              <div className="border rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Monitoring Status</h4>
                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    <p className="text-gray-500">Last Scan: {new Date(scanResults.monitoring?.lastScanned).toLocaleString()}</p>
                    <p className="text-gray-500">Next Scan: {new Date(scanResults.monitoring?.nextScan).toLocaleString()}</p>
                  </div>
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    {scanResults.monitoring?.status} Monitoring
                  </Badge>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setShowScanResults(false)}>
                  Close
                </Button>
                <div className="space-x-2">
                  {scanResults.scanResults?.breachesDetected > 0 && (
                    <Button variant="destructive">
                      Contact Legal Team
                    </Button>
                  )}
                  <Button>
                    Download Report
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}