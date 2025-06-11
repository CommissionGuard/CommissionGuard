import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, DollarSign, Bed, Bath, Square, X } from "lucide-react";

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
  const { isAuthenticated } = useAuth();
  const [selectedProperty, setSelectedProperty] = useState<PropertyPin | null>(null);
  const [customPins, setCustomPins] = useState<PropertyPin[]>([]);

  // Map center for Long Island
  const mapCenter = {
    lat: 40.7589,
    lng: -73.5179
  };

  // Sample Long Island properties
  const sampleProperties: PropertyPin[] = [
    {
      id: "prop-1",
      name: "Huntington Colonial",
      address: "123 Maple Ave, Huntington, NY 11743",
      latitude: 40.8686,
      longitude: -73.4257,
      estimatedValue: 850000,
      propertyType: "Single Family",
      bedrooms: 4,
      bathrooms: 3,
      squareFootage: 2400,
      saved: false
    },
    {
      id: "prop-2",
      name: "Long Beach Oceanfront",
      address: "456 Ocean Blvd, Long Beach, NY 11561",
      latitude: 40.5882,
      longitude: -73.6579,
      estimatedValue: 1200000,
      propertyType: "Beachfront Condo",
      bedrooms: 3,
      bathrooms: 2,
      squareFootage: 1800,
      saved: false
    },
    {
      id: "prop-3",
      name: "Garden City Luxury",
      address: "789 Pine St, Garden City, NY 11530",
      latitude: 40.7267,
      longitude: -73.6343,
      estimatedValue: 1850000,
      propertyType: "Luxury Home",
      bedrooms: 5,
      bathrooms: 4,
      squareFootage: 3200,
      saved: false
    },
    {
      id: "prop-4",
      name: "Oyster Bay Waterfront",
      address: "321 Bay Ave, Oyster Bay, NY 11771",
      latitude: 40.8659,
      longitude: -73.5321,
      estimatedValue: 2100000,
      propertyType: "Waterfront Estate",
      bedrooms: 6,
      bathrooms: 5,
      squareFootage: 4500,
      saved: false
    }
  ];

  const allProperties = [...sampleProperties, ...customPins];

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Convert click position to approximate lat/lng
    const latRange = 0.3;
    const lngRange = 0.4;
    const lat = mapCenter.lat + (latRange / 2) - (y / rect.height) * latRange;
    const lng = mapCenter.lng - (lngRange / 2) + (x / rect.width) * lngRange;

    const newPin: PropertyPin = {
      id: `custom-${Date.now()}`,
      name: "Custom Property",
      address: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
      latitude: lat,
      longitude: lng,
      estimatedValue: 500000,
      propertyType: "Custom Pin",
      bedrooms: 3,
      bathrooms: 2,
      squareFootage: 1500,
      saved: false
    };

    setCustomPins(prev => [...prev, newPin]);
  };

  const handleDeleteProperty = (id: string) => {
    setCustomPins(prev => prev.filter(p => p.id !== id));
    if (selectedProperty?.id === id) {
      setSelectedProperty(null);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Long Island Property Map</h1>
        <p className="text-gray-600 mt-2">Interactive property visualization for Long Island, NY</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Area */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Interactive Map
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div 
                className="relative w-full h-96 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg overflow-hidden cursor-crosshair border-2 border-gray-200"
                onClick={handleMapClick}
                style={{
                  backgroundImage: `
                    linear-gradient(to right, rgba(59, 130, 246, 0.1) 1px, transparent 1px),
                    linear-gradient(to bottom, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
                  `,
                  backgroundSize: '20px 20px'
                }}
              >
                {/* Long Island landmass representation */}
                <div className="absolute top-16 left-8 w-80 h-32 bg-green-200 opacity-60 rounded-full transform rotate-12"></div>
                <div className="absolute top-24 left-32 w-64 h-24 bg-green-300 opacity-50 rounded-full transform rotate-6"></div>
                
                {/* Water areas */}
                <div className="absolute top-0 left-0 right-0 h-12 bg-blue-300 opacity-40"></div>
                <div className="absolute bottom-0 left-0 right-0 h-16 bg-blue-300 opacity-40"></div>
                
                {/* Roads */}
                <div className="absolute top-20 left-0 right-0 h-1 bg-gray-400 opacity-60 transform rotate-12"></div>
                <div className="absolute top-32 left-0 right-0 h-1 bg-gray-400 opacity-60 transform -rotate-6"></div>
                <div className="absolute top-8 left-48 bottom-8 w-1 bg-gray-400 opacity-60"></div>
                
                {/* City labels */}
                <div className="absolute top-8 left-16 text-sm font-bold text-gray-800 bg-white/90 px-2 py-1 rounded shadow">
                  📍 Huntington
                </div>
                <div className="absolute bottom-16 right-16 text-sm font-bold text-gray-800 bg-white/90 px-2 py-1 rounded shadow">
                  📍 Long Beach
                </div>
                <div className="absolute top-32 left-1/2 text-sm font-bold text-gray-800 bg-white/90 px-2 py-1 rounded shadow">
                  📍 Garden City
                </div>
                <div className="absolute top-16 right-32 text-sm font-bold text-gray-800 bg-white/90 px-2 py-1 rounded shadow">
                  📍 Oyster Bay
                </div>
                
                {/* Property Pins */}
                {allProperties.map((property, index) => {
                  const positions = [
                    { left: '20%', top: '25%' }, // Huntington area
                    { left: '75%', top: '70%' }, // Long Beach area  
                    { left: '45%', top: '50%' }, // Garden City area
                    { left: '65%', top: '20%' }, // Oyster Bay area
                  ];
                  
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
                      left: `${Math.max(5, Math.min(95, xPercent))}%`, 
                      top: `${Math.max(10, Math.min(90, yPercent))}%` 
                    };
                  } else {
                    position = positions[index % positions.length] || { left: '50%', top: '50%' };
                  }
                  
                  const canDelete = property.propertyType === 'Custom Pin';
                  
                  return (
                    <div
                      key={property.id}
                      className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20"
                      style={{
                        left: position.left,
                        top: position.top
                      }}
                    >
                      <button
                        className={`w-8 h-8 rounded-full border-2 border-white shadow-lg transition-all hover:scale-110 ${
                          selectedProperty?.id === property.id 
                            ? 'bg-red-500' 
                            : 'bg-blue-500'
                        } flex items-center justify-center text-white text-xs font-bold`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedProperty(property);
                        }}
                        title={`${property.name} - $${property.estimatedValue.toLocaleString()}`}
                      >
                        $
                      </button>
                      {canDelete && (
                        <button
                          className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 text-white rounded-full text-xs hover:bg-red-700 flex items-center justify-center"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteProperty(property.id);
                          }}
                          title="Remove pin"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  );
                })}
                
                {/* Map instructions */}
                <div className="absolute bottom-2 left-2 text-xs text-gray-600 bg-white/90 px-2 py-1 rounded shadow">
                  Click anywhere to add a property pin
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Property Details Panel */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Property Details
                {selectedProperty && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedProperty(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedProperty ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg">{selectedProperty.name}</h3>
                    <p className="text-sm text-gray-600">{selectedProperty.address}</p>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
                      <MapPin className="h-4 w-4" />
                      {selectedProperty.latitude.toFixed(4)}, {selectedProperty.longitude.toFixed(4)}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-lg font-semibold text-green-600">
                    <DollarSign className="h-5 w-5" />
                    ${selectedProperty.estimatedValue.toLocaleString()}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Bed className="h-4 w-4 text-gray-500" />
                      {selectedProperty.bedrooms} bed
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Bath className="h-4 w-4 text-gray-500" />
                      {selectedProperty.bathrooms} bath
                    </div>
                    <div className="flex items-center gap-2 text-sm col-span-2">
                      <Square className="h-4 w-4 text-gray-500" />
                      {selectedProperty.squareFootage.toLocaleString()} sq ft
                    </div>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm font-medium text-gray-700">Property Type</p>
                    <p className="text-sm text-gray-600">{selectedProperty.propertyType}</p>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Click on a property pin to view details</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Property List */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Property List ({allProperties.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {allProperties.map((property) => (
                  <button
                    key={property.id}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      selectedProperty?.id === property.id
                        ? 'bg-blue-50 border-blue-200'
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    }`}
                    onClick={() => setSelectedProperty(property)}
                  >
                    <div className="font-medium text-sm">{property.name}</div>
                    <div className="text-xs text-gray-600">${property.estimatedValue.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">{property.propertyType}</div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}