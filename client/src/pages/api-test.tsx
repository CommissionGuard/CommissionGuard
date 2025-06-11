import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertCircle } from "lucide-react";

export default function ApiTest() {
  const [address, setAddress] = useState("1600 Amphitheatre Parkway, Mountain View, CA");
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testApis = async () => {
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      // Test Google Maps Geocoding
      console.log("Testing geocoding API...");
      const geocodeResponse = await fetch("/api/properties/geocode", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ address }),
      });

      if (!geocodeResponse.ok) {
        throw new Error(`Geocoding failed: ${geocodeResponse.status} ${geocodeResponse.statusText}`);
      }

      const geocodeData = await geocodeResponse.json();
      console.log("Geocoding result:", geocodeData);

      if (!geocodeData.success) {
        throw new Error(`Geocoding unsuccessful: ${geocodeData.error}`);
      }

      // Test Regrid Parcel API
      console.log("Testing parcel data API...");
      const parcelResponse = await fetch(
        `/api/parcels/coordinates?lat=${geocodeData.latitude}&lng=${geocodeData.longitude}`,
        {
          credentials: "include",
        }
      );

      const parcelData = await parcelResponse.json();
      console.log("Parcel result:", parcelData);

      // Test Nearby Properties API
      console.log("Testing nearby properties API...");
      const nearbyResponse = await fetch(
        `/api/properties/nearby?lat=${geocodeData.latitude}&lng=${geocodeData.longitude}&radius=2000`,
        {
          credentials: "include",
        }
      );

      const nearbyData = await nearbyResponse.json();
      console.log("Nearby result:", nearbyData);

      setResults({
        geocode: geocodeData,
        parcel: parcelData,
        nearby: nearbyData,
      });

    } catch (err: any) {
      console.error("API test error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">API Integration Test</h1>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Test Property APIs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Test Address</label>
              <Input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter property address"
              />
            </div>
            <Button
              onClick={testApis}
              disabled={loading || !address.trim()}
              className="w-full"
            >
              {loading ? "Testing APIs..." : "Test All APIs"}
            </Button>
          </CardContent>
        </Card>

        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-600">
              <strong>Error:</strong> {error}
            </AlertDescription>
          </Alert>
        )}

        {results && (
          <div className="space-y-6">
            {/* Geocoding Results */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  {results.geocode.success ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  )}
                  <span>Google Maps Geocoding</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {results.geocode.success ? (
                  <div className="space-y-2 text-sm">
                    <p><strong>Address:</strong> {results.geocode.address}</p>
                    <p><strong>Coordinates:</strong> {results.geocode.latitude}, {results.geocode.longitude}</p>
                    <p><strong>Place ID:</strong> {results.geocode.placeId}</p>
                  </div>
                ) : (
                  <p className="text-red-600">{results.geocode.error}</p>
                )}
              </CardContent>
            </Card>

            {/* Parcel Data Results */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  {results.parcel.success ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  )}
                  <span>Regrid Parcel Data</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {results.parcel.success ? (
                  <div className="space-y-2 text-sm">
                    <p><strong>Owner:</strong> {results.parcel.parcel.owner || "Not available"}</p>
                    <p><strong>Property Type:</strong> {results.parcel.parcel.propertyType || "Not available"}</p>
                    <p><strong>Assessed Value:</strong> {results.parcel.parcel.assessedValue ? `$${parseInt(results.parcel.parcel.assessedValue).toLocaleString()}` : "Not available"}</p>
                    <p><strong>Year Built:</strong> {results.parcel.parcel.yearBuilt || "Not available"}</p>
                  </div>
                ) : (
                  <div className="text-red-600">
                    <p>{results.parcel.error}</p>
                    {results.parcel.debug && (
                      <pre className="mt-2 text-xs bg-gray-100 p-2 rounded">
                        {JSON.stringify(results.parcel.debug, null, 2)}
                      </pre>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Nearby Properties Results */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  {results.nearby.success ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  )}
                  <span>Nearby Real Estate Locations</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {results.nearby.success ? (
                  <div className="space-y-2 text-sm">
                    <p><strong>Found:</strong> {results.nearby.places?.length || 0} locations</p>
                    {results.nearby.places?.slice(0, 3).map((place: any, index: number) => (
                      <div key={index} className="border-l-2 border-blue-500 pl-3">
                        <p className="font-medium">{place.name}</p>
                        <p className="text-gray-600">{place.address}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-red-600">{results.nearby.error}</p>
                )}
              </CardContent>
            </Card>

            {/* Raw API Responses */}
            <Card>
              <CardHeader>
                <CardTitle>Raw API Responses (Debug)</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-xs bg-gray-100 p-4 rounded overflow-auto max-h-96">
                  {JSON.stringify(results, null, 2)}
                </pre>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}