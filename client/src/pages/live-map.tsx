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
  Navigation,
  Save,
  Trash2,
  X
} from "lucide-react";

interface PropertyPin {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  estimatedValue: number;
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  squareFootage: number;
  saved: boolean;
}

export default function LiveMap() {
  const { isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [searchLocation, setSearchLocation] = useState("");
  const [mapCenter, setMapCenter] = useState({ lat: 40.7891, lng: -73.1350 }); // Long Island default
  const [zoom, setZoom] = useState(13);
  const [selectedProperty, setSelectedProperty] = useState<PropertyPin | null>(null);
  const [nearbyProperties, setNearbyProperties] = useState<PropertyPin[]>([]);
  const [customPins, setCustomPins] = useState<PropertyPin[]>([]);
  const [isMapLoaded, setIsMapLoaded] = useState(true);

  // Long Island property data
  const sampleProperties: PropertyPin[] = [
    {
      id: "prop-1",
      address: "123 Maple Ave, Huntington, NY 11743",
      latitude: 40.8686,
      longitude: -73.4257,
      price: 850000,
      propertyType: "Single Family",
      bedrooms: 4,
      bathrooms: 3,
      squareFootage: 2400,
      notes: "Beautiful colonial home"
    },
    {
      id: "prop-2", 
      address: "456 Ocean Blvd, Long Beach, NY 11561",
      latitude: 40.5882,
      longitude: -73.6579,
      price: 1200000,
      propertyType: "Beachfront Condo",
      bedrooms: 3,
      bathrooms: 2,
      squareFootage: 1800,
      notes: "Ocean views, walk to beach"
    },
    {
      id: "prop-3",
      address: "789 Pine St, Garden City, NY 11530",
      latitude: 40.7267,
      longitude: -73.6343,
      price: 1850000,
      propertyType: "Luxury Home",
      bedrooms: 5,
      bathrooms: 4,
      squareFootage: 3200,
      notes: "Premium neighborhood, top schools"
    },
    {
      id: "prop-4",
      address: "321 Bay Ave, Oyster Bay, NY 11771",
      latitude: 40.8659,
      longitude: -73.5321,
      price: 2100000,
      propertyType: "Waterfront Estate",
      bedrooms: 6,
      bathrooms: 5,
      squareFootage: 4500,
      notes: "Private dock, spectacular views"
    }
  ];

  const { data: savedPins = [] } = useQuery({
    queryKey: ["/api/property-pins"],
    enabled: isAuthenticated,
  });

  const savePropertyMutation = useMutation({
    mutationFn: async (propertyData: PropertyPin) => {
      const response = await apiRequest("POST", "/api/property-pins", propertyData);
      return response;
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
        description: "Failed to save property. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deletePropertyMutation = useMutation({
    mutationFn: async (propertyId: string) => {
      const response = await apiRequest("DELETE", `/api/property-pins/${propertyId}`);
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Property Removed",
        description: "Property has been removed from your pins.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/property-pins"] });
      setSelectedProperty(null);
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
        description: "Failed to remove property. Please try again.",
        variant: "destructive",
      });
    },
  });

  const searchLocationMutation = useMutation({
    mutationFn: async (address: string) => {
      const response = await apiRequest("POST", "/api/geocode", { address });
      return response;
    },
    onSuccess: (data: any) => {
      if (data.success) {
        setMapCenter({ lat: data.latitude, lng: data.longitude });
        setZoom(14);
        // Find nearby properties
        const nearby = sampleProperties.filter(prop => {
          const distance = Math.sqrt(
            Math.pow(prop.latitude - data.latitude, 2) + 
            Math.pow(prop.longitude - data.longitude, 2)
          );
          return distance < 0.01; // Roughly 1km
        });
        setNearbyProperties(nearby);
        toast({
          title: "Location Found",
          description: `Found ${nearby.length} properties near ${data.address}`,
        });
      }
    },
    onError: () => {
      toast({
        title: "Location Not Found",
        description: "Please try a different address or location.",
        variant: "destructive",
      });
    },
  });

  const handleSearch = () => {
    if (searchLocation.trim()) {
      searchLocationMutation.mutate(searchLocation);
    }
  };

  const handleMapClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Convert pixel coordinates to approximate lat/lng
    const lat = mapCenter.lat + (0.15 - (y / rect.height) * 0.3);
    const lng = mapCenter.lng + ((x / rect.width) * 0.4 - 0.2);
    
    const newPin: PropertyPin = {
      id: Date.now().toString(),
      name: `Custom Pin ${customPins.length + 1}`,
      address: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
      latitude: lat,
      longitude: lng,
      estimatedValue: 500000,
      propertyType: 'Custom Pin',
      bedrooms: 3,
      bathrooms: 2,
      squareFootage: 1800,
      saved: false
    };
    
    setCustomPins(prev => [...prev, newPin]);
    setSelectedProperty(newPin);
    
    toast({
      title: "Pin Added",
      description: `Custom pin added at ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
    });
  };

  const handleSaveProperty = (property: PropertyPin) => {
    savePropertyMutation.mutate({
      ...property,
      saved: true
    });
  };

  const handleDeleteProperty = (propertyId: string) => {
    // For saved properties, delete from backend
    const savedProperty = savedPins.find((p: any) => p.id === propertyId);
    if (savedProperty) {
      deletePropertyMutation.mutate(propertyId);
      return;
    }
    
    // For custom pins, remove from local state
    const customProperty = customPins.find(p => p.id === propertyId);
    if (customProperty) {
      setCustomPins(customPins.filter(p => p.id !== propertyId));
      if (selectedProperty?.id === propertyId) {
        setSelectedProperty(null);
      }
      toast({
        title: "Pin Removed",
        description: "Custom pin has been removed from the map.",
      });
    }
  };

  const createCustomPin = (lat: number, lng: number) => {
    const newPin: PropertyPin = {
      id: `custom-${Date.now()}`,
      address: `Custom pin at ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
      latitude: lat,
      longitude: lng,
      propertyType: "Custom Pin",
      notes: "Added manually from map",
    };
    setCustomPins([...customPins, newPin]);
    setSelectedProperty(newPin);
  };

  const clearAllCustomPins = () => {
    setCustomPins([]);
    if (selectedProperty?.propertyType === "Custom Pin") {
      setSelectedProperty(null);
    }
    toast({
      title: "All Custom Pins Cleared",
      description: "All custom pins have been removed from the map.",
    });
  };

  const allProperties = [...sampleProperties, ...nearbyProperties, ...customPins];

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated) {
    window.location.href = "/api/login";
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Interactive Property Map</h1>
          <p className="text-gray-600">
            Search locations, view properties, and manage your property portfolio with an interactive map interface.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Map and Search Controls */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Navigation className="h-5 w-5" />
                  Interactive Map
                </CardTitle>
                
                {/* Search Bar */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Search for a location (e.g., '123 Main St, NYC' or 'Manhattan')"
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleSearch}
                    disabled={searchLocationMutation.isPending}
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="p-4">
                {/* Interactive Map with SVG */}
                <div className="w-full h-96 relative bg-gray-100 border-2 border-gray-400 rounded-lg overflow-hidden">
                  <svg 
                    width="100%" 
                    height="100%" 
                    viewBox="0 0 800 400" 
                    className="absolute inset-0 cursor-crosshair"
                    onClick={handleMapClick}
                  >
                    {/* Background */}
                    <rect width="800" height="400" fill="#E6F3FF"/>
                    
                    {/* Water (Long Island Sound) */}
                    <rect x="0" y="0" width="800" height="60" fill="#87CEEB" opacity="0.7"/>
                    <rect x="0" y="340" width="800" height="60" fill="#87CEEB" opacity="0.7"/>
                    
                    {/* Long Island Shape */}
                    <ellipse cx="400" cy="200" rx="300" ry="80" fill="#90EE90" opacity="0.5" transform="rotate(5 400 200)"/>
                    <ellipse cx="350" cy="180" rx="200" ry="50" fill="#98FB98" opacity="0.6" transform="rotate(8 350 180)"/>
                    
                    {/* Grid Pattern */}
                    <defs>
                      <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#ccc" strokeWidth="0.5"/>
                      </pattern>
                    </defs>
                    <rect width="800" height="400" fill="url(#grid)" opacity="0.3"/>
                    
                    {/* Major Roads */}
                    <line x1="0" y1="120" x2="800" y2="120" stroke="#666" strokeWidth="2" opacity="0.6"/>
                    <line x1="0" y1="160" x2="600" y2="160" stroke="#666" strokeWidth="2" opacity="0.6"/>
                    <line x1="50" y1="200" x2="550" y2="200" stroke="#666" strokeWidth="1.5" opacity="0.5"/>
                    
                    {/* City Markers */}
                    <circle cx="200" cy="140" r="3" fill="#FF6B6B"/>
                    <text x="205" y="138" fontSize="12" fill="#333" fontWeight="bold">Huntington</text>
                    
                    <circle cx="600" cy="280" r="3" fill="#FF6B6B"/>
                    <text x="605" y="278" fontSize="12" fill="#333" fontWeight="bold">Long Beach</text>
                    
                    <circle cx="360" cy="200" r="3" fill="#FF6B6B"/>
                    <text x="365" y="198" fontSize="12" fill="#333" fontWeight="bold">Garden City</text>
                    
                    <circle cx="480" cy="120" r="3" fill="#FF6B6B"/>
                    <text x="485" y="118" fontSize="12" fill="#333" fontWeight="bold">Oyster Bay</text>
                    
                    {/* Parks */}
                    <rect x="220" y="160" width="25" height="15" fill="#228B22" opacity="0.4" rx="3"/>
                    <rect x="450" y="240" width="20" height="25" fill="#228B22" opacity="0.4" rx="3"/>
                    
                    {/* Property Pins */}
                    {allProperties.map((property, index) => {
                      const positions = [
                        { x: 200, y: 140 }, // Huntington
                        { x: 600, y: 280 }, // Long Beach  
                        { x: 360, y: 200 }, // Garden City
                        { x: 480, y: 120 }, // Oyster Bay
                      ];
                      
                      let position;
                      if (property.propertyType === 'Custom Pin') {
                        // Convert lat/lng to SVG coordinates for custom pins
                        const x = ((property.longitude - mapCenter.lng + 0.2) / 0.4) * 800;
                        const y = ((mapCenter.lat + 0.15 - property.latitude) / 0.3) * 400;
                        position = { x: Math.max(10, Math.min(790, x)), y: Math.max(10, Math.min(390, y)) };
                      } else {
                        position = positions[index % positions.length] || { x: 400, y: 200 };
                      }
                      
                      return (
                        <g key={property.id}>
                          <circle 
                            cx={position.x} 
                            cy={position.y} 
                            r="8" 
                            fill={selectedProperty?.id === property.id ? "#EF4444" : "#3B82F6"}
                            stroke="white" 
                            strokeWidth="2"
                            style={{ cursor: 'pointer' }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedProperty(property);
                            }}
                          />
                          <text 
                            x={position.x} 
                            y={position.y + 3} 
                            textAnchor="middle" 
                            fontSize="10" 
                            fill="white" 
                            fontWeight="bold"
                            style={{ pointerEvents: 'none' }}
                          >
                            $
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                  
                  {/* Map attribution */}
                  <div className="absolute bottom-1 right-1 text-xs text-gray-700 bg-white/90 px-2 py-1 rounded shadow">
                    © OpenStreetMap contributors
                  </div>
                  
                  {/* Map Header */}
                  <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
                    <Badge variant="secondary" className="bg-white/95 shadow">
                      {mapCenter.lat.toFixed(4)}, {mapCenter.lng.toFixed(4)}
                    </Badge>
                    <Badge variant="secondary" className="bg-white/95 shadow">
                      Zoom: {zoom}
                    </Badge>
                  </div>

                  {/* Property Markers */}
                  {allProperties.map((property, index) => {
                    // Position properties across the visible map area
                    const positions = [
                      { left: 25, top: 30 }, // Huntington area
                      { left: 75, top: 70 }, // Long Beach area  
                      { left: 45, top: 50 }, // Garden City area
                      { left: 60, top: 25 }, // Oyster Bay area
                    ];
                    
                    // Use predefined positions for sample properties, calculate for custom pins
                    let position;
                    if (property.propertyType === 'Custom Pin') {
                      // For custom pins, use coordinate-based positioning
                      const latRange = 0.3;
                      const lngRange = 0.4;
                      const latMin = mapCenter.lat - latRange / 2;
                      const latMax = mapCenter.lat + latRange / 2;
                      const lngMin = mapCenter.lng - lngRange / 2;
                      const lngMax = mapCenter.lng + lngRange / 2;
                      
                      const xPercent = ((property.longitude - lngMin) / lngRange) * 100;
                      const yPercent = ((latMax - property.latitude) / latRange) * 100;
                      position = { 
                        left: Math.max(5, Math.min(95, xPercent)), 
                        top: Math.max(10, Math.min(90, yPercent)) 
                      };
                    } else {
                      // Use predefined positions for sample properties
                      position = positions[index % positions.length] || { left: 50, top: 50 };
                    }
                    
                    const canDelete = property.propertyType === 'Custom Pin' || savedPins.some((p: any) => p.id === property.id);
                    
                    return (
                      <div
                        key={property.id}
                        className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20"
                        style={{
                          left: `${position.left}%`,
                          top: `${position.top}%`
                        }}
                      >
                        <button
                          className={`w-8 h-8 rounded-full border-2 border-white shadow-lg transition-all hover:scale-110 ${
                            selectedProperty?.id === property.id 
                              ? 'bg-red-500' 
                              : property.propertyType === 'Custom Pin' 
                              ? 'bg-purple-500' 
                              : 'bg-blue-500'
                          }`}
                          onClick={() => setSelectedProperty(property)}
                          title={property.address}
                        >
                          <MapPin className="h-4 w-4 text-white mx-auto" />
                        </button>
                        {canDelete && (
                          <button
                            className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-xs hover:bg-red-600 transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteProperty(property.id);
                            }}
                            title="Remove pin"
                          >
                            <X className="h-2 w-2 mx-auto" />
                          </button>
                        )}
                      </div>
                    );
                  })}

                  {/* Click to Add Pin Instructions */}
                  <div className="absolute bottom-4 left-4 right-4 bg-white/90 p-3 rounded text-sm text-gray-600">
                    Click anywhere on the map to add a custom pin • {allProperties.length} properties shown
                  </div>

                  {/* Click Handler Overlay */}
                  <div 
                    className="absolute inset-0 cursor-crosshair"
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const x = e.clientX - rect.left;
                      const y = e.clientY - rect.top;
                      
                      // Convert pixel coordinates to lat/lng using the same range as markers
                      const latRange = 0.3;
                      const lngRange = 0.4;
                      
                      const xPercent = (x / rect.width) * 100;
                      const yPercent = (y / rect.height) * 100;
                      
                      const lng = mapCenter.lng - lngRange / 2 + (xPercent / 100) * lngRange;
                      const lat = mapCenter.lat + latRange / 2 - (yPercent / 100) * latRange;
                      
                      createCustomPin(lat, lng);
                    }}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Map Controls */}
            <div className="mt-4 flex gap-2 flex-wrap">
              <Button
                variant="outline"
                onClick={() => setZoom(Math.min(20, zoom + 1))}
              >
                Zoom In
              </Button>
              <Button
                variant="outline"
                onClick={() => setZoom(Math.max(8, zoom - 1))}
              >
                Zoom Out
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setMapCenter({ lat: 40.7891, lng: -73.1350 });
                  setZoom(11);
                }}
              >
                Reset to Long Island
              </Button>
              {customPins.length > 0 && (
                <Button
                  variant="outline"
                  onClick={clearAllCustomPins}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear Custom Pins ({customPins.length})
                </Button>
              )}
            </div>
          </div>

          {/* Property Details Panel */}
          <div className="space-y-6">
            {/* Selected Property Details */}
            {selectedProperty && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Home className="h-5 w-5" />
                    Property Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">{selectedProperty.address}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                      <MapPin className="h-4 w-4" />
                      {selectedProperty.latitude.toFixed(4)}, {selectedProperty.longitude.toFixed(4)}
                    </div>
                  </div>

                  {selectedProperty.price && (
                    <div className="flex items-center gap-2 text-lg font-semibold text-green-600">
                      <DollarSign className="h-5 w-5" />
                      ${selectedProperty.price.toLocaleString()}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    {selectedProperty.bedrooms && (
                      <div className="flex items-center gap-2 text-sm">
                        <Bed className="h-4 w-4 text-gray-500" />
                        {selectedProperty.bedrooms} bed
                      </div>
                    )}
                    {selectedProperty.bathrooms && (
                      <div className="flex items-center gap-2 text-sm">
                        <Bath className="h-4 w-4 text-gray-500" />
                        {selectedProperty.bathrooms} bath
                      </div>
                    )}
                    {selectedProperty.squareFootage && (
                      <div className="flex items-center gap-2 text-sm col-span-2">
                        <Square className="h-4 w-4 text-gray-500" />
                        {selectedProperty.squareFootage.toLocaleString()} sq ft
                      </div>
                    )}
                  </div>

                  {selectedProperty.propertyType && (
                    <Badge variant="secondary">{selectedProperty.propertyType}</Badge>
                  )}

                  {selectedProperty.notes && (
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                      {selectedProperty.notes}
                    </p>
                  )}

                  <div className="flex gap-2 pt-4">
                    {(selectedProperty.propertyType !== 'Custom Pin' && !selectedProperty.saved) && (
                      <Button
                        onClick={() => handleSaveProperty(selectedProperty)}
                        disabled={savePropertyMutation.isPending}
                        className="flex-1"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Save Property
                      </Button>
                    )}
                    
                    {(selectedProperty.propertyType === 'Custom Pin' || savedPins.some((p: any) => p.id === selectedProperty.id)) && (
                      <Button
                        onClick={() => handleDeleteProperty(selectedProperty.id)}
                        disabled={deletePropertyMutation.isPending}
                        variant="destructive"
                        className="flex-1"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remove Pin
                      </Button>
                    )}
                    
                    <Button variant="outline" size="icon">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Property List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Properties ({allProperties.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="all" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="nearby">Nearby</TabsTrigger>
                    <TabsTrigger value="saved">Saved</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="all" className="space-y-3 mt-4">
                    {allProperties.slice(0, 5).map((property) => (
                      <div
                        key={property.id}
                        className={`p-3 border rounded cursor-pointer transition-colors ${
                          selectedProperty?.id === property.id 
                            ? 'border-primary bg-blue-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedProperty(property)}
                      >
                        <div className="font-medium text-sm mb-1">{property.address}</div>
                        <div className="flex justify-between items-center">
                          {property.price && (
                            <span className="text-green-600 font-semibold text-sm">
                              ${property.price.toLocaleString()}
                            </span>
                          )}
                          <Badge variant="outline" className="text-xs">
                            {property.propertyType || 'Property'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                    {allProperties.length === 0 && (
                      <p className="text-gray-500 text-center py-4">
                        No properties found. Search for a location to get started.
                      </p>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="nearby" className="space-y-3 mt-4">
                    {nearbyProperties.map((property) => (
                      <div
                        key={property.id}
                        className="p-3 border rounded cursor-pointer hover:border-gray-300"
                        onClick={() => setSelectedProperty(property)}
                      >
                        <div className="font-medium text-sm mb-1">{property.address}</div>
                        <div className="flex justify-between items-center">
                          {property.price && (
                            <span className="text-green-600 font-semibold text-sm">
                              ${property.price.toLocaleString()}
                            </span>
                          )}
                          <Badge variant="outline" className="text-xs">
                            {property.propertyType}
                          </Badge>
                        </div>
                      </div>
                    ))}
                    {nearbyProperties.length === 0 && (
                      <p className="text-gray-500 text-center py-4">
                        Search for a location to find nearby properties.
                      </p>
                    )}
                  </TabsContent>

                  <TabsContent value="saved" className="space-y-3 mt-4">
                    {savedPins.length > 0 ? (
                      savedPins.map((property: PropertyPin) => (
                        <div
                          key={property.id}
                          className="p-3 border rounded cursor-pointer hover:border-gray-300"
                          onClick={() => setSelectedProperty(property)}
                        >
                          <div className="font-medium text-sm mb-1">{property.address}</div>
                          <div className="flex justify-between items-center">
                            {property.price && (
                              <span className="text-green-600 font-semibold text-sm">
                                ${property.price.toLocaleString()}
                              </span>
                            )}
                            <Badge variant="outline" className="text-xs">
                              Saved
                            </Badge>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-center py-4">
                        No saved properties yet. Save properties from the map to see them here.
                      </p>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}