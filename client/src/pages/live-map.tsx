import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, DollarSign, Bed, Bath, Square } from "lucide-react";
import Navbar from "@/components/navbar";

interface Property {
  id: string;
  name: string;
  address: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  type: string;
  x: string;
  y: string;
}

export default function LiveMap() {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  const properties: Property[] = [
    {
      id: "1",
      name: "Huntington Colonial",
      address: "123 Maple Ave, Huntington, NY 11743",
      price: 850000,
      bedrooms: 4,
      bathrooms: 3,
      sqft: 2400,
      type: "Single Family",
      x: "20%",
      y: "25%"
    },
    {
      id: "2", 
      name: "Long Beach Oceanfront",
      address: "456 Ocean Blvd, Long Beach, NY 11561",
      price: 1200000,
      bedrooms: 3,
      bathrooms: 2,
      sqft: 1800,
      type: "Beachfront Condo",
      x: "75%",
      y: "70%"
    },
    {
      id: "3",
      name: "Garden City Luxury",
      address: "789 Pine St, Garden City, NY 11530", 
      price: 1850000,
      bedrooms: 5,
      bathrooms: 4,
      sqft: 3200,
      type: "Luxury Home",
      x: "45%",
      y: "50%"
    },
    {
      id: "4",
      name: "Oyster Bay Waterfront",
      address: "321 Bay Ave, Oyster Bay, NY 11771",
      price: 2100000,
      bedrooms: 6,
      bathrooms: 5,
      sqft: 4500,
      type: "Waterfront Estate",
      x: "65%",
      y: "20%"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
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
                Long Island Map
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative w-full h-96 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg overflow-hidden border-2 border-gray-300">
                
                {/* Geographic Features */}
                <div className="absolute top-16 left-8 w-80 h-32 bg-green-200 opacity-60 rounded-full transform rotate-12"></div>
                <div className="absolute top-24 left-32 w-64 h-24 bg-green-300 opacity-50 rounded-full transform rotate-6"></div>
                
                {/* Water */}
                <div className="absolute top-0 left-0 right-0 h-12 bg-blue-300 opacity-40"></div>
                <div className="absolute bottom-0 left-0 right-0 h-16 bg-blue-300 opacity-40"></div>
                
                {/* Roads */}
                <div className="absolute top-20 left-0 right-0 h-1 bg-gray-500 opacity-60"></div>
                <div className="absolute top-32 left-0 right-0 h-1 bg-gray-500 opacity-60"></div>
                <div className="absolute top-8 left-48 bottom-8 w-1 bg-gray-500 opacity-60"></div>
                
                {/* City Labels */}
                <div className="absolute top-8 left-16 bg-white/90 px-2 py-1 rounded text-xs font-semibold">
                  Huntington
                </div>
                <div className="absolute bottom-16 right-16 bg-white/90 px-2 py-1 rounded text-xs font-semibold">
                  Long Beach
                </div>
                <div className="absolute top-32 left-1/2 bg-white/90 px-2 py-1 rounded text-xs font-semibold">
                  Garden City
                </div>
                <div className="absolute top-16 right-32 bg-white/90 px-2 py-1 rounded text-xs font-semibold">
                  Oyster Bay
                </div>
                
                {/* Property Pins */}
                {properties.map((property) => (
                  <button
                    key={property.id}
                    className={`absolute w-8 h-8 rounded-full border-2 border-white shadow-lg transform -translate-x-1/2 -translate-y-1/2 transition-all hover:scale-110 ${
                      selectedProperty?.id === property.id ? 'bg-red-500' : 'bg-blue-500'
                    } flex items-center justify-center text-white text-xs font-bold`}
                    style={{ left: property.x, top: property.y }}
                    onClick={() => setSelectedProperty(property)}
                    title={`${property.name} - $${property.price.toLocaleString()}`}
                  >
                    $
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Property Details */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Property Details</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedProperty ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg">{selectedProperty.name}</h3>
                    <p className="text-sm text-gray-600">{selectedProperty.address}</p>
                  </div>

                  <div className="flex items-center gap-2 text-lg font-semibold text-green-600">
                    <DollarSign className="h-5 w-5" />
                    ${selectedProperty.price.toLocaleString()}
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
                      {selectedProperty.sqft.toLocaleString()} sq ft
                    </div>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm font-medium text-gray-700">Property Type</p>
                    <p className="text-sm text-gray-600">{selectedProperty.type}</p>
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
              <CardTitle>Properties ({properties.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {properties.map((property) => (
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
                    <div className="text-xs text-gray-600">${property.price.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">{property.type}</div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      </div>
    </div>
  );
}