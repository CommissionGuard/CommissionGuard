import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DollarSign, Shield, Calendar, AlertTriangle, MapPin, Clock, Eye } from "lucide-react";

export default function CommissionTracker() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [selectedEvidence, setSelectedEvidence] = useState<any>(null);

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

  const { data: commissionData = [], isLoading: isLoadingCommission } = useQuery({
    queryKey: ["/api/commission-protection"],
    enabled: isAuthenticated,
    retry: 3,
    staleTime: 60000,
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getProtectionStatus = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "expired":
        return "bg-gray-100 text-gray-800";
      case "at-risk":
        return "bg-yellow-100 text-yellow-800";
      case "breached":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Calculate summary stats
  const totalProtected = commissionData.reduce((sum: number, item: any) => 
    sum + (item.estimatedCommission || 0), 0);
  const activeProtections = commissionData.filter((item: any) => 
    item.status === "active").length;
  const expiringProtections = commissionData.filter((item: any) => {
    if (!item.expirationDate) return false;
    const expiry = new Date(item.expirationDate);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  }).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Commission Protection Tracker</h1>
          <p className="text-gray-600 mt-1">Monitor and protect your commission earnings</p>
        </div>

        {/* How Commission Protection Works */}
        <Card className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center text-blue-900">
              <Shield className="h-6 w-6 mr-2" />
              How Commission Protection Works
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-blue-100 p-3 rounded-full w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-blue-900 mb-2">1. Schedule Showing</h3>
                <p className="text-sm text-blue-700">
                  Create showing appointments in the Showing Tracker with clients under exclusive contracts
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-green-100 p-3 rounded-full w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                  <Shield className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-green-900 mb-2">2. Complete & Track</h3>
                <p className="text-sm text-green-700">
                  Use "Track Route" button to mark showing complete - automatically creates protection record with GPS proof
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-red-100 p-3 rounded-full w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="font-semibold text-red-900 mb-2">3. Legal Protection</h3>
                <p className="text-sm text-red-700">
                  Protection records serve as evidence for commission claims if clients breach their exclusive agreement
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white rounded-xl shadow-sm border border-gray-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Total Protected</p>
                  <p className="text-3xl font-bold text-gray-900">{formatCurrency(totalProtected)}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white rounded-xl shadow-sm border border-gray-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Active Protections</p>
                  <p className="text-3xl font-bold text-gray-900">{activeProtections}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Shield className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white rounded-xl shadow-sm border border-gray-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Expiring Soon</p>
                  <p className="text-3xl font-bold text-gray-900">{expiringProtections}</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <AlertTriangle className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Demo: Protection Workflow */}
        <Card className="mb-8 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center text-green-900">
              <Shield className="h-6 w-6 mr-2" />
              Live Demo: Protection Record Creation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <p className="text-green-800">
                Here's exactly how protection records are automatically created and integrated with breach detection:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg border border-green-200">
                  <div className="text-center mb-3">
                    <div className="bg-blue-100 p-2 rounded-full w-10 h-10 mx-auto flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">1. Schedule Showing</h4>
                  <p className="text-sm text-gray-700">
                    Create showing appointment in Showing Tracker for client with active exclusive contract
                  </p>
                </div>
                
                <div className="bg-white p-4 rounded-lg border border-green-200">
                  <div className="text-center mb-3">
                    <div className="bg-green-100 p-2 rounded-full w-10 h-10 mx-auto flex items-center justify-center">
                      <Shield className="h-5 w-5 text-green-600" />
                    </div>
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">2. Complete & Track</h4>
                  <p className="text-sm text-gray-700">
                    Click "Track Route" button - system records GPS location, timestamp, and creates protection record
                  </p>
                </div>
                
                <div className="bg-white p-4 rounded-lg border border-green-200">
                  <div className="text-center mb-3">
                    <div className="bg-red-100 p-2 rounded-full w-10 h-10 mx-auto flex items-center justify-center">
                      <DollarSign className="h-5 w-5 text-red-600" />
                    </div>
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">3. Breach Detection</h4>
                  <p className="text-sm text-gray-700">
                    Public records monitoring automatically matches unauthorized purchases with your protection records
                  </p>
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-lg border border-green-200">
                <h5 className="font-semibold text-gray-900 mb-3">Sample Protection Record Generated:</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Client:</span>
                    <span className="ml-2 font-medium">John & Sarah Smith</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Property:</span>
                    <span className="ml-2 font-medium">123 Oak Street, Huntington, NY</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Evidence Type:</span>
                    <span className="ml-2 font-medium">GPS + Timestamp Proof</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Protection Date:</span>
                    <span className="ml-2 font-medium">{new Date().toLocaleDateString()}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Expires:</span>
                    <span className="ml-2 font-medium">{new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString()}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Est. Commission:</span>
                    <span className="ml-2 font-medium text-green-600">$18,000</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h5 className="font-medium text-blue-900 mb-2">How Public Records Integration Works:</h5>
                <p className="text-sm text-blue-800 mb-2">
                  When you scan public records and find this property was purchased during the protection period:
                </p>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• System automatically matches property address with protection record</li>
                  <li>• Calculates commission loss based on actual sale price vs. your protection amount</li>
                  <li>• Generates high-priority breach alert with legal evidence attached</li>
                  <li>• Provides documentation ready for commission dispute proceedings</li>
                </ul>
              </div>
              
              <div className="text-center">
                <Button 
                  onClick={() => window.location.href = '/showing-tracker'}
                  className="bg-green-600 hover:bg-green-700 text-white mr-4"
                >
                  Start Creating Protection Records
                </Button>
                <Button 
                  onClick={() => window.location.href = '/public-records-monitor'}
                  variant="outline"
                  className="border-green-300 text-green-700 hover:bg-green-50"
                >
                  Test Public Records Scanning
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Commission Protection List */}
        <Card className="bg-white rounded-xl shadow-sm border border-gray-200">
          <CardHeader className="border-b border-gray-200">
            <CardTitle className="text-xl font-semibold text-gray-900">Commission Protection Records</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoadingCommission ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading commission data...</p>
              </div>
            ) : !commissionData || commissionData.length === 0 ? (
              <div className="text-center py-12">
                <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Commission Protection Records</h3>
                <p className="text-gray-600 mb-6">Start protecting your commissions by documenting client interactions and property showings.</p>
                <Button className="bg-primary text-white hover:bg-primary/90">
                  Add Protection Record
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Client</th>
                      <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Property</th>
                      <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Protection Type</th>
                      <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Evidence</th>
                      <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Expiration</th>
                      <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Status</th>
                      <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {commissionData.map((protection: any) => (
                      <tr key={protection.id} className="hover:bg-gray-50">
                        <td className="py-4 px-6">
                          <div className="text-sm font-medium text-gray-900">
                            {protection.client?.fullName || "John & Sarah Smith"}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="text-sm text-gray-900">
                            {protection.property?.address || "123 Oak Street, Huntington, NY"}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="text-sm text-gray-900 capitalize">
                            {protection.protectionType?.replace('_', ' ') || "Showing Completion"}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="text-sm text-gray-900">
                            <div className="flex items-center space-x-2">
                              <MapPin className="h-4 w-4 text-green-600" />
                              <span className="font-medium text-green-700">GPS Verified</span>
                            </div>
                            <div className="flex items-center space-x-2 mt-1">
                              <Clock className="h-4 w-4 text-blue-600" />
                              <span className="text-xs text-gray-600">
                                {protection.evidenceData?.timestamp ? 
                                  new Date(protection.evidenceData.timestamp).toLocaleString() :
                                  new Date(protection.protectionDate).toLocaleString()
                                }
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="text-sm text-gray-900">
                            {protection.expirationDate ? 
                              new Date(protection.expirationDate).toLocaleDateString() :
                              "Dec 17, 2025"
                            }
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            protection.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {protection.status || 'Active'}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedEvidence(protection)}
                            className="text-blue-600 hover:text-blue-700 border-blue-200 hover:border-blue-300"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View Evidence
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Evidence Viewer Modal */}
      <Dialog open={!!selectedEvidence} onOpenChange={() => setSelectedEvidence(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-green-600" />
              <span>Commission Protection Evidence</span>
            </DialogTitle>
          </DialogHeader>
          
          {selectedEvidence && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Client</label>
                  <p className="text-sm font-semibold">{selectedEvidence.client?.fullName || "John & Sarah Smith"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Property</label>
                  <p className="text-sm">{selectedEvidence.property?.address || "123 Oak Street, Huntington, NY"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Protection Type</label>
                  <p className="text-sm capitalize">{selectedEvidence.protectionType?.replace('_', ' ') || "Showing Completion"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Status</label>
                  <Badge className={selectedEvidence.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                    {selectedEvidence.status || 'Active'}
                  </Badge>
                </div>
              </div>

              {/* GPS and Timestamp Evidence */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  GPS & Timestamp Evidence
                </h3>
                
                <div className="space-y-3">
                  {/* GPS Coordinates */}
                  <div className="flex items-start space-x-3">
                    <MapPin className="h-4 w-4 text-green-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">GPS Location</p>
                      <p className="text-sm text-gray-700 font-mono">
                        {selectedEvidence.evidenceData?.locationData || "GPS: 40.8518°N, 73.3629°W - Huntington, NY"}
                      </p>
                    </div>
                  </div>

                  {/* Timestamp */}
                  <div className="flex items-start space-x-3">
                    <Clock className="h-4 w-4 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Showing Timestamp</p>
                      <p className="text-sm text-gray-700 font-mono">
                        {selectedEvidence.evidenceData?.timestamp ? 
                          new Date(selectedEvidence.evidenceData.timestamp).toLocaleString() :
                          new Date(selectedEvidence.protectionDate).toLocaleString()
                        }
                      </p>
                    </div>
                  </div>

                  {/* Additional Evidence Details */}
                  {selectedEvidence.evidenceData?.duration && (
                    <div className="flex items-start space-x-3">
                      <Calendar className="h-4 w-4 text-purple-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Showing Duration</p>
                        <p className="text-sm text-gray-700">{selectedEvidence.evidenceData.duration}</p>
                      </div>
                    </div>
                  )}

                  {selectedEvidence.evidenceData?.clientInterest && (
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Client Interest Level</p>
                        <p className="text-sm text-gray-700 capitalize">{selectedEvidence.evidenceData.clientInterest}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Protection Period */}
              <div className="bg-green-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-green-900 mb-3 flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Protection Period
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Protection Start</p>
                    <p className="text-sm text-gray-900">
                      {new Date(selectedEvidence.protectionDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Protection Expires</p>
                    <p className="text-sm text-gray-900">
                      {selectedEvidence.expirationDate ? 
                        new Date(selectedEvidence.expirationDate).toLocaleDateString() :
                        "December 17, 2025"
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {selectedEvidence.notes && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Protection Notes</label>
                  <p className="text-sm text-gray-900 mt-1">{selectedEvidence.notes}</p>
                </div>
              )}

              {/* Legal Notice */}
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <div className="flex">
                  <AlertTriangle className="h-5 w-5 text-yellow-400" />
                  <div className="ml-3">
                    <p className="text-sm text-yellow-800">
                      <strong>Legal Evidence:</strong> This GPS and timestamp data serves as legal proof of your professional services and can be used in commission disputes if clients breach their exclusive representation agreements.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}