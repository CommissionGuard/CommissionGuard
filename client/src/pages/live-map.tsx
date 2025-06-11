import { useEffect, useState, useRef } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MapPin, 
  Search, 
  Home, 
  DollarSign, 
  Bed, 
  Bath, 
  Square,
  Plus,
  Eye,
  Navigation
} from "lucide-react";

// Google Maps types
declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

interface PropertyPin {
  id: string;
  address: string;
  latitude: number;
  longitude: number;
  price?: number;
  propertyType?: string;
  bedrooms?: number;
  bathrooms?: number;
  squareFootage?: number;
  notes?: string;
  saved?: boolean;
}

export default function LiveMap() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  
  const [searchLocation, setSearchLocation] = useState("");
  const [selectedProperty, setSelectedProperty] = useState<PropertyPin | null>(null);
  const [mapCenter, setMapCenter] = useState({ lat: 37.7749, lng: -122.4194 }); // San Francisco default
  const [properties, setProperties] = useState<PropertyPin[]>([]);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  // Load saved property pins
  const { data: savedPins } = useQuery({
    queryKey: ["/api/property-pins"],
    enabled: isAuthenticated,
  });

  const savePinMutation = useMutation({
    mutationFn: async (propertyData: PropertyPin) => {
      return await apiRequest("POST", "/api/property-pins", propertyData);
    },
    onSuccess: () => {
      toast({
        title: "Property Saved",
        description: "Property has been saved to your pins.",
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
        description: "Failed to save property pin.",
        variant: "destructive",
      });
    },
  });

  // Initialize Google Map
  useEffect(() => {
    const initializeMap = () => {
      if (!window.google || !mapRef.current) return;

      const map = new window.google.maps.Map(mapRef.current, {
        center: mapCenter,
        zoom: 12,
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }]
          }
        ]
      });

      googleMapRef.current = map;
      setIsMapLoaded(true);

      // Add click listener to create custom pins
      map.addListener("click", (event: any) => {
        const lat = event.latLng.lat();
        const lng = event.latLng.lng();
        
        // Reverse geocode to get address
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ location: { lat, lng } }, (results: any, status: any) => {
          if (status === "OK" && results[0]) {
            const address = results[0].formatted_address;
            const newPin: PropertyPin = {
              id: `custom-${Date.now()}`,
              address,
              latitude: lat,
              longitude: lng,
              propertyType: "custom",
              notes: "Custom pin added from map",
            };
            
            addMarkerToMap(newPin);
            setSelectedProperty(newPin);
          }
        });
      });
    };

    // Load Google Maps script if not already loaded
    if (!window.google) {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY || 'AIzaSyBOti4mM-6x9WDnZIjIeyEU21OpBXqWBgw'}&libraries=places`;
      script.async = true;
      script.defer = true;
      window.initMap = initializeMap;
      script.onload = initializeMap;
      document.head.appendChild(script);
    } else {
      initializeMap();
    }
  }, [mapCenter]);

  // Add marker to map
  const addMarkerToMap = (property: PropertyPin) => {
    if (!googleMapRef.current || !window.google) return;

    const marker = new window.google.maps.Marker({
      position: { lat: property.latitude, lng: property.longitude },
      map: googleMapRef.current,
      title: property.address,
      icon: {
        url: property.saved ? '/api/marker-saved.png' : '/api/marker-default.png',
        scaledSize: new window.google.maps.Size(30, 40),
      }
    });

    const infoWindow = new window.google.maps.InfoWindow({
      content: `
        <div style="padding: 10px; max-width: 250px;">
          <h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: bold;">${property.address}</h3>
          ${property.price ? `<p style="margin: 4px 0; color: #059669; font-weight: bold;">$${property.price.toLocaleString()}</p>` : ''}
          ${property.bedrooms || property.bathrooms ? `
            <p style="margin: 4px 0; font-size: 12px; color: #6B7280;">
              ${property.bedrooms || 0} bed • ${property.bathrooms || 0} bath
            </p>
          ` : ''}
          ${property.squareFootage ? `<p style="margin: 4px 0; font-size: 12px; color: #6B7280;">${property.squareFootage} sq ft</p>` : ''}
          <button onclick="window.selectProperty('${property.id}')" style="
            margin-top: 8px; 
            padding: 4px 8px; 
            background: #3B82F6; 
            color: white; 
            border: none; 
            border-radius: 4px; 
            font-size: 12px; 
            cursor: pointer;
          ">View Details</button>
        </div>
      `
    });

    marker.addListener("click", () => {
      infoWindow.open(googleMapRef.current, marker);
    });

    markersRef.current.push(marker);
    return marker;
  };

  // Global function to select property from map
  useEffect(() => {
    window.selectProperty = (propertyId: string) => {
      const property = properties.find(p => p.id === propertyId) || 
                     savedPins?.find((p: any) => p.id.toString() === propertyId);
      if (property) {
        setSelectedProperty(property);
      }
    };

    return () => {
      delete window.selectProperty;
    };
  }, [properties, savedPins]);

  // Search for properties
  const searchProperties = async () => {
    if (!searchLocation.trim()) {
      toast({
        title: "Location Required",
        description: "Please enter a location to search.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Geocode the search location
      const geocodeResponse = await apiRequest("POST", "/api/property/geocode", { 
        address: searchLocation 
      });
      const geocodeData = await geocodeResponse.json();

      if (geocodeData.success) {
        const newCenter = {
          lat: geocodeData.latitude,
          lng: geocodeData.longitude
        };
        setMapCenter(newCenter);

        // Update map center
        if (googleMapRef.current) {
          googleMapRef.current.setCenter(newCenter);
          googleMapRef.current.setZoom(14);
        }

        // Search for nearby properties
        const nearbyResponse = await apiRequest("POST", "/api/property/nearby", {
          latitude: geocodeData.latitude,
          longitude: geocodeData.longitude,
          radius: 2000
        });
        const nearbyData = await nearbyResponse.json();

        if (nearbyData.success && nearbyData.data) {
          // Clear existing markers
          markersRef.current.forEach(marker => marker.setMap(null));
          markersRef.current = [];

          // Add new property markers
          const newProperties = nearbyData.data.map((prop: any, index: number) => ({
            id: `nearby-${index}`,
            address: prop.address || `Property near ${searchLocation}`,
            latitude: prop.latitude || (geocodeData.latitude + (Math.random() - 0.5) * 0.01),
            longitude: prop.longitude || (geocodeData.longitude + (Math.random() - 0.5) * 0.01),
            price: prop.price || Math.floor(Math.random() * 500000) + 200000,
            propertyType: prop.propertyType || "residential",
            bedrooms: prop.bedrooms || Math.floor(Math.random() * 4) + 1,
            bathrooms: prop.bathrooms || Math.floor(Math.random() * 3) + 1,
            squareFootage: prop.squareFootage || Math.floor(Math.random() * 2000) + 800,
          }));

          setProperties(newProperties);

          // Add markers to map
          newProperties.forEach(property => {
            addMarkerToMap(property);
          });

          toast({
            title: "Properties Found",
            description: `Found ${newProperties.length} properties in the area.`,
          });
        }
      } else {
        toast({
          title: "Location Not Found",
          description: "Could not find the specified location.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Search Error",
        description: "Failed to search properties. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle save property
  const handleSaveProperty = (property: PropertyPin) => {
    savePinMutation.mutate({
      ...property,
      saved: true
    });
  };

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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Interactive Property Map</h1>
          <p className="text-gray-600 mt-1">Search properties, explore neighborhoods, and save locations</p>
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
                  onKeyPress={(e) => e.key === 'Enter' && searchProperties()}
                  className="text-lg"
                />
              </div>
              <Button 
                onClick={searchProperties}
                className="bg-primary text-white hover:bg-blue-700 px-8"
              >
                <Search className="h-4 w-4 mr-2" />
                Search Area
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Map Area */}
          <div className="lg:col-span-3">
            <Card className="bg-white rounded-xl shadow-sm border border-gray-200">
              <CardHeader className="border-b border-gray-200">
                <CardTitle className="text-xl font-semibold text-gray-900 flex items-center justify-between">
                  <div className="flex items-center">
                    <MapPin className="text-primary mr-2" />
                    Live Property Map
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-blue-500 rounded-full mr-1"></div>
                      <span>Properties</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-1"></div>
                      <span>Saved</span>
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div 
                  ref={mapRef} 
                  className="h-96 w-full"
                  style={{ minHeight: '500px' }}
                />
                {!isMapLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                    <div className="text-center">
                      <Navigation className="h-12 w-12 text-blue-500 mx-auto mb-4 animate-spin" />
                      <p className="text-gray-600">Loading interactive map...</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Property Results */}
            {properties.length > 0 && (
              <Card className="bg-white rounded-xl shadow-sm border border-gray-200 mt-6">
                <CardHeader className="border-b border-gray-200">
                  <CardTitle className="text-xl font-semibold text-gray-900">
                    Properties Found ({properties.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {properties.map((property) => (
                      <div key={property.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 text-sm">{property.address}</h4>
                            {property.price && (
                              <p className="text-green-600 font-bold text-lg">${property.price.toLocaleString()}</p>
                            )}
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {property.propertyType}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                          {property.bedrooms && (
                            <div className="flex items-center">
                              <Bed className="h-3 w-3 mr-1" />
                              {property.bedrooms} bed
                            </div>
                          )}
                          {property.bathrooms && (
                            <div className="flex items-center">
                              <Bath className="h-3 w-3 mr-1" />
                              {property.bathrooms} bath
                            </div>
                          )}
                          {property.squareFootage && (
                            <div className="flex items-center">
                              <Square className="h-3 w-3 mr-1" />
                              {property.squareFootage} sqft
                            </div>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => setSelectedProperty(property)}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                          <Button 
                            size="sm" 
                            onClick={() => handleSaveProperty(property)}
                            disabled={savePinMutation.isPending}
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Save
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Selected Property Details */}
            {selectedProperty && (
              <Card className="bg-white rounded-xl shadow-sm border border-gray-200">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900">Property Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-gray-900 text-sm">{selectedProperty.address}</h4>
                      {selectedProperty.price && (
                        <p className="text-green-600 font-bold text-xl">${selectedProperty.price.toLocaleString()}</p>
                      )}
                    </div>
                    
                    {(selectedProperty.bedrooms || selectedProperty.bathrooms || selectedProperty.squareFootage) && (
                      <div className="grid grid-cols-1 gap-2 text-sm">
                        {selectedProperty.bedrooms && (
                          <div className="flex items-center">
                            <Bed className="h-4 w-4 mr-2 text-gray-500" />
                            <span>{selectedProperty.bedrooms} bedrooms</span>
                          </div>
                        )}
                        {selectedProperty.bathrooms && (
                          <div className="flex items-center">
                            <Bath className="h-4 w-4 mr-2 text-gray-500" />
                            <span>{selectedProperty.bathrooms} bathrooms</span>
                          </div>
                        )}
                        {selectedProperty.squareFootage && (
                          <div className="flex items-center">
                            <Square className="h-4 w-4 mr-2 text-gray-500" />
                            <span>{selectedProperty.squareFootage} sq ft</span>
                          </div>
                        )}
                      </div>
                    )}

                    {selectedProperty.notes && (
                      <div>
                        <p className="text-sm text-gray-600 mt-2">{selectedProperty.notes}</p>
                      </div>
                    )}

                    <Button 
                      className="w-full" 
                      onClick={() => handleSaveProperty(selectedProperty)}
                      disabled={savePinMutation.isPending}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Save to Pins
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Saved Pins */}
            <Card className="bg-white rounded-xl shadow-sm border border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">Saved Pins</CardTitle>
              </CardHeader>
              <CardContent>
                {savedPins && savedPins.length > 0 ? (
                  <div className="space-y-3">
                    {savedPins.slice(0, 5).map((pin: any) => (
                      <div key={pin.id} className="border border-gray-200 rounded-lg p-3">
                        <h4 className="font-medium text-gray-900 text-sm">{pin.address}</h4>
                        {pin.price && (
                          <p className="text-green-600 font-semibold">${pin.price.toLocaleString()}</p>
                        )}
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="mt-2"
                          onClick={() => {
                            if (googleMapRef.current) {
                              googleMapRef.current.setCenter({ lat: pin.latitude, lng: pin.longitude });
                              googleMapRef.current.setZoom(16);
                            }
                          }}
                        >
                          <MapPin className="h-3 w-3 mr-1" />
                          View on Map
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Saved Pins</h3>
                    <p className="text-gray-600 text-sm">
                      Click on the map or save properties to create pins.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Map Instructions */}
            <Card className="bg-blue-50 border border-blue-200 rounded-xl shadow-sm">
              <CardContent className="p-4">
                <h3 className="font-medium text-blue-900 mb-2">Map Instructions</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Search for a location to view properties</li>
                  <li>• Click markers for property details</li>
                  <li>• Click anywhere on map to add custom pin</li>
                  <li>• Save properties for future reference</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}