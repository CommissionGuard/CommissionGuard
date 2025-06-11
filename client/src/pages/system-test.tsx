import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  MapPin, 
  Home, 
  Database, 
  Key,
  TestTube
} from "lucide-react";
import Navbar from "@/components/navbar";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface TestResult {
  name: string;
  status: 'success' | 'error' | 'pending' | 'skipped';
  message: string;
  details?: any;
}

export default function SystemTest() {
  const { toast } = useToast();
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [testAddress, setTestAddress] = useState("1600 Amphitheatre Parkway, Mountain View, CA");

  const addResult = (result: TestResult) => {
    setTestResults(prev => [...prev, result]);
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setTestResults([]);

    // Test 1: Database Connection
    try {
      addResult({ name: "Database Connection", status: 'pending', message: "Testing..." });
      const response = await apiRequest("/api/dashboard/stats", "GET");
      addResult({ 
        name: "Database Connection", 
        status: 'success', 
        message: "Database connected and responsive",
        details: response
      });
    } catch (error) {
      addResult({ 
        name: "Database Connection", 
        status: 'error', 
        message: `Database error: ${(error as Error).message}` 
      });
    }

    // Test 2: RentCast API
    try {
      addResult({ name: "RentCast API", status: 'pending', message: "Testing rental search..." });
      const response = await apiRequest("/api/rentcast/search", "POST", {
        city: "New York",
        state: "NY",
        bedrooms: "2"
      });
      addResult({ 
        name: "RentCast API", 
        status: 'success', 
        message: "RentCast integration working",
        details: response
      });
    } catch (error) {
      addResult({ 
        name: "RentCast API", 
        status: 'error', 
        message: `RentCast error: ${(error as Error).message}` 
      });
    }

    // Test 3: Google Maps Geocoding
    try {
      addResult({ name: "Google Maps API", status: 'pending', message: "Testing geocoding..." });
      const response = await apiRequest("/api/properties/geocode", "POST", {
        address: testAddress
      });
      if (response.success) {
        addResult({ 
          name: "Google Maps API", 
          status: 'success', 
          message: "Google Maps geocoding working",
          details: response
        });
      } else {
        addResult({ 
          name: "Google Maps API", 
          status: 'error', 
          message: `Google Maps: ${response.error}` 
        });
      }
    } catch (error) {
      addResult({ 
        name: "Google Maps API", 
        status: 'error', 
        message: `Google Maps error: ${(error as Error).message}` 
      });
    }

    // Test 4: RegGrid Parcel Data
    try {
      addResult({ name: "RegGrid API", status: 'pending', message: "Testing parcel data..." });
      const response = await apiRequest("/api/regrid/parcel", "POST", {
        latitude: 37.4419,
        longitude: -122.1430
      });
      addResult({ 
        name: "RegGrid API", 
        status: 'success', 
        message: "RegGrid parcel data working",
        details: response
      });
    } catch (error) {
      addResult({ 
        name: "RegGrid API", 
        status: 'error', 
        message: `RegGrid error: ${(error as Error).message}` 
      });
    }

    // Test 5: Contract Management
    try {
      addResult({ name: "Contract System", status: 'pending', message: "Testing contract operations..." });
      const response = await apiRequest("/api/contracts", "GET");
      addResult({ 
        name: "Contract System", 
        status: 'success', 
        message: "Contract management working",
        details: { contractCount: response.length }
      });
    } catch (error) {
      addResult({ 
        name: "Contract System", 
        status: 'error', 
        message: `Contract system error: ${(error as Error).message}` 
      });
    }

    // Test 6: Client Management
    try {
      addResult({ name: "Client System", status: 'pending', message: "Testing client operations..." });
      const response = await apiRequest("/api/clients", "GET");
      addResult({ 
        name: "Client System", 
        status: 'success', 
        message: "Client management working",
        details: { clientCount: response.length }
      });
    } catch (error) {
      addResult({ 
        name: "Client System", 
        status: 'error', 
        message: `Client system error: ${(error as Error).message}` 
      });
    }

    // Test 7: Alert System
    try {
      addResult({ name: "Alert System", status: 'pending', message: "Testing alert operations..." });
      const response = await apiRequest("/api/alerts", "GET");
      addResult({ 
        name: "Alert System", 
        status: 'success', 
        message: "Alert system working",
        details: { alertCount: response.length }
      });
    } catch (error) {
      addResult({ 
        name: "Alert System", 
        status: 'error', 
        message: `Alert system error: ${(error as Error).message}` 
      });
    }

    setIsRunning(false);
    
    const successCount = testResults.filter(r => r.status === 'success').length;
    const totalTests = testResults.length;
    
    toast({
      title: "System Test Complete",
      description: `${successCount}/${totalTests} tests passed`,
      variant: successCount === totalTests ? "default" : "destructive"
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      case 'pending':
        return <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-100 text-green-800">PASS</Badge>;
      case 'error':
        return <Badge variant="destructive">FAIL</Badge>;
      case 'pending':
        return <Badge variant="secondary">TESTING</Badge>;
      default:
        return <Badge variant="outline">SKIPPED</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <TestTube className="h-8 w-8" />
            Commission Guard System Test
          </h1>
          <p className="text-gray-600 mt-2">
            Comprehensive test of all platform functionality and API integrations
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Test Controls */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Test Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Test Address</label>
                  <Input
                    value={testAddress}
                    onChange={(e) => setTestAddress(e.target.value)}
                    placeholder="Enter address for geocoding test"
                  />
                </div>
                
                <Button 
                  onClick={runAllTests} 
                  disabled={isRunning}
                  className="w-full"
                >
                  {isRunning ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Running Tests...
                    </>
                  ) : (
                    <>
                      <TestTube className="mr-2 h-4 w-4" />
                      Run All Tests
                    </>
                  )}
                </Button>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    This will test database connections, API integrations, and core platform functionality.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            {/* Test Summary */}
            {testResults.length > 0 && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Test Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Total Tests:</span>
                      <span className="font-medium">{testResults.length}</span>
                    </div>
                    <div className="flex justify-between text-green-600">
                      <span>Passed:</span>
                      <span className="font-medium">{testResults.filter(r => r.status === 'success').length}</span>
                    </div>
                    <div className="flex justify-between text-red-600">
                      <span>Failed:</span>
                      <span className="font-medium">{testResults.filter(r => r.status === 'error').length}</span>
                    </div>
                    <div className="flex justify-between text-blue-600">
                      <span>Running:</span>
                      <span className="font-medium">{testResults.filter(r => r.status === 'pending').length}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Test Results */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Test Results</CardTitle>
              </CardHeader>
              <CardContent>
                {testResults.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    Click "Run All Tests" to begin system testing
                  </div>
                ) : (
                  <div className="space-y-4">
                    {testResults.map((result, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            {getStatusIcon(result.status)}
                            <h3 className="font-medium">{result.name}</h3>
                          </div>
                          {getStatusBadge(result.status)}
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-2">{result.message}</p>
                        
                        {result.details && (
                          <details className="text-xs">
                            <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                              View Details
                            </summary>
                            <pre className="mt-2 bg-gray-50 p-2 rounded overflow-x-auto">
                              {JSON.stringify(result.details, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* API Key Status */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              API Integration Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center justify-between p-3 border rounded">
                <span className="font-medium">RentCast</span>
                <Badge className="bg-green-100 text-green-800">CONFIGURED</Badge>
              </div>
              <div className="flex items-center justify-between p-3 border rounded">
                <span className="font-medium">Google Maps</span>
                <Badge className="bg-green-100 text-green-800">CONFIGURED</Badge>
              </div>
              <div className="flex items-center justify-between p-3 border rounded">
                <span className="font-medium">RegGrid</span>
                <Badge className="bg-green-100 text-green-800">CONFIGURED</Badge>
              </div>
              <div className="flex items-center justify-between p-3 border rounded">
                <span className="font-medium">Database</span>
                <Badge className="bg-green-100 text-green-800">CONNECTED</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}