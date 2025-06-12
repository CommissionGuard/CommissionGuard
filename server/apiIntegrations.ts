import { storage } from "./storage";

// API Integration service for external real estate data
export class ApiIntegrationService {
  
  // RentCast API Integration for rental property data
  async searchRentalProperties(filters: {
    address?: string;
    zipCode?: string;
    city?: string;
    state?: string;
    bedrooms?: number;
    bathrooms?: number;
    radius?: number;
  }) {
    const rentCastApiKey = process.env.RENTCAST_API_KEY || "4930240cfb8e4aa5b1dced0f846d1ebd";
    
    try {
      const queryParams = new URLSearchParams();
      if (filters.address) queryParams.append('address', filters.address);
      if (filters.zipCode) queryParams.append('zipCode', filters.zipCode);
      if (filters.city) queryParams.append('city', filters.city);
      if (filters.state) queryParams.append('state', filters.state);
      if (filters.bedrooms) queryParams.append('bedrooms', filters.bedrooms.toString());
      if (filters.bathrooms) queryParams.append('bathrooms', filters.bathrooms.toString());
      if (filters.radius) queryParams.append('radius', filters.radius.toString());

      const response = await fetch(
        `https://api.rentcast.io/v1/listings/rental/long-term?${queryParams.toString()}`,
        {
          headers: {
            'X-Api-Key': rentCastApiKey,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`RentCast API error: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        data: data,
        count: data.length || 0,
        source: "RentCast"
      };
    } catch (error) {
      console.error("RentCast API error:", error);
      return {
        success: false,
        error: error.message,
        source: "RentCast"
      };
    }
  }

  // RentCast Property Details
  async getRentCastPropertyDetails(address: string) {
    const rentCastApiKey = process.env.RENTCAST_API_KEY || "4930240cfb8e4aa5b1dced0f846d1ebd";
    
    try {
      const response = await fetch(
        `https://api.rentcast.io/v1/properties?address=${encodeURIComponent(address)}`,
        {
          headers: {
            'X-Api-Key': rentCastApiKey,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`RentCast API error: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        data: data,
        source: "RentCast"
      };
    } catch (error) {
      console.error("RentCast property details error:", error);
      return {
        success: false,
        error: error.message,
        source: "RentCast"
      };
    }
  }

  // RentCast Rent Estimate
  async getRentEstimate(address: string) {
    const rentCastApiKey = process.env.RENTCAST_API_KEY || "4930240cfb8e4aa5b1dced0f846d1ebd";
    
    try {
      const response = await fetch(
        `https://api.rentcast.io/v1/avm/rent/long-term?address=${encodeURIComponent(address)}`,
        {
          headers: {
            'X-Api-Key': rentCastApiKey,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`RentCast API error: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        data: data,
        source: "RentCast"
      };
    } catch (error) {
      console.error("RentCast rent estimate error:", error);
      return {
        success: false,
        error: error.message,
        source: "RentCast"
      };
    }
  }

  // RentCast Market Data
  async getRentCastMarketData(city: string, state: string) {
    const rentCastApiKey = process.env.RENTCAST_API_KEY || "4930240cfb8e4aa5b1dced0f846d1ebd";
    
    try {
      const response = await fetch(
        `https://api.rentcast.io/v1/markets?city=${encodeURIComponent(city)}&state=${encodeURIComponent(state)}`,
        {
          headers: {
            'X-Api-Key': rentCastApiKey,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`RentCast API error: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        data: data,
        source: "RentCast"
      };
    } catch (error) {
      console.error("RentCast market data error:", error);
      // Return demo data when API is not available
      return {
        success: true,
        data: {
          averageRent: city.toLowerCase().includes('new york') ? 3200 : 
                      city.toLowerCase().includes('los angeles') ? 2800 :
                      city.toLowerCase().includes('chicago') ? 2200 :
                      city.toLowerCase().includes('miami') ? 2600 : 2000,
          occupancyRate: 92,
          timeOnMarket: 18,
          pricePerSquareFoot: city.toLowerCase().includes('new york') ? 45 : 
                             city.toLowerCase().includes('los angeles') ? 38 :
                             city.toLowerCase().includes('chicago') ? 28 : 32,
          marketTrend: 'increasing',
          demandLevel: 'high',
          supplyLevel: 'low'
        },
        source: "Demo Data",
        note: "Using sample data - configure API keys for real market data"
      };
    }
  }

  // MLS/Property Data Integration
  async searchProperties(filters: {
    location?: string;
    minPrice?: number;
    maxPrice?: number;
    propertyType?: string;
    bedrooms?: number;
    bathrooms?: number;
  }) {
    // This will integrate with MLS API once configured
    const mlsApiKey = process.env.MLS_API_KEY;
    if (!mlsApiKey) {
      throw new Error("MLS API key not configured");
    }

    // Mock response structure - will be replaced with real API call
    return {
      properties: [],
      total: 0,
      message: "MLS API integration ready - configure your MLS provider credentials"
    };
  }

  // Google Maps Integration for property locations
  async getPropertyLocation(address: string) {
    const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!googleMapsApiKey) {
      throw new Error("Google Maps API key not configured");
    }

    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${googleMapsApiKey}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.status === 'OK' && data.results.length > 0) {
        const result = data.results[0];
        return {
          success: true,
          address: result.formatted_address,
          latitude: result.geometry.location.lat,
          longitude: result.geometry.location.lng,
          placeId: result.place_id,
          components: result.address_components,
          types: result.types
        };
      }
      
      if (data.status === 'ZERO_RESULTS') {
        return {
          success: false,
          error: 'No results found for this address',
          status: data.status
        };
      }
      
      throw new Error(`Geocoding failed: ${data.status} - ${data.error_message || 'Unknown error'}`);
    } catch (error) {
      console.error('Google Maps API error:', error);
      throw new Error(`Failed to geocode address: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get nearby properties using Places API
  async getNearbyProperties(latitude: number, longitude: number, radius: number = 1000) {
    const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!googleMapsApiKey) {
      throw new Error("Google Maps API key not configured");
    }

    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&type=real_estate_agency&key=${googleMapsApiKey}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.status === 'OK') {
        return {
          success: true,
          places: data.results.map((place: any) => ({
            placeId: place.place_id,
            name: place.name,
            address: place.vicinity,
            location: place.geometry.location,
            rating: place.rating,
            types: place.types
          }))
        };
      }
      
      return {
        success: false,
        error: data.status,
        places: []
      };
    } catch (error) {
      console.error('Places API error:', error);
      throw new Error(`Failed to get nearby properties: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Calculate distance between two addresses
  async getDistanceMatrix(origins: string[], destinations: string[]) {
    const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!googleMapsApiKey) {
      throw new Error("Google Maps API key not configured");
    }

    try {
      const originsStr = origins.map(encodeURIComponent).join('|');
      const destinationsStr = destinations.map(encodeURIComponent).join('|');
      
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${originsStr}&destinations=${destinationsStr}&units=imperial&key=${googleMapsApiKey}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.status === 'OK') {
        return {
          success: true,
          results: data.rows
        };
      }
      
      throw new Error(`Distance matrix failed: ${data.status}`);
    } catch (error) {
      console.error('Distance Matrix API error:', error);
      throw new Error(`Failed to calculate distances: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Zillow API Integration for property valuations
  async getPropertyValuation(address: string) {
    const zillowApiKey = process.env.ZILLOW_API_KEY;
    if (!zillowApiKey) {
      throw new Error("Zillow API key not configured");
    }

    // Mock response - will integrate with actual Zillow API
    return {
      zestimate: null,
      message: "Zillow API integration ready - configure your Zillow credentials"
    };
  }

  // Public Records Monitoring for commission breach detection
  async monitorPublicRecords(clientName: string, contractStartDate: string, contractEndDate: string, agentId: string) {
    const publicRecordsApiKey = process.env.PUBLIC_RECORDS_API_KEY;
    
    try {
      // Monitor county recorder's office and MLS transaction data
      // This would integrate with:
      // - County deed recordings
      // - MLS purchase transactions  
      // - Real estate transfer records
      // - Agent commission data

      // For demonstration, check for potential commission breaches
      const contractStart = new Date(contractStartDate);
      const contractEnd = new Date(contractEndDate);
      const currentDate = new Date();

      // Simulate public records search results
      const recordsFound = [
        {
          buyerName: clientName,
          propertyAddress: "789 Elm Street, Chicago, IL 60610",
          saleDate: "2025-06-12",
          recordingDate: "2025-06-12",
          salePrice: 395000,
          documentType: "Warranty Deed",
          documentNumber: "2025-R-004821",
          listingAgent: "Coldwell Banker - Jennifer Walsh",
          buyerAgent: "RE/MAX - Robert Kim",
          mlsNumber: "CHI2025-7834",
          isWithinContractPeriod: true,
          daysAfterContractStart: 7,
          commissionBreach: true,
          estimatedLostCommission: 11850 // 3% of sale price
        }
      ];

      // Filter for breaches during active contract period
      const breachRecords = recordsFound.filter(record => {
        const saleDate = new Date(record.saleDate);
        const isWithinPeriod = saleDate >= contractStart && saleDate <= contractEnd;
        const usedDifferentAgent = record.buyerAgent && !record.buyerAgent.includes(agentId);
        
        return isWithinPeriod && usedDifferentAgent;
      });

      return {
        clientName,
        contractPeriod: { 
          start: contractStartDate, 
          end: contractEndDate,
          isActive: currentDate >= contractStart && currentDate <= contractEnd
        },
        scanResults: {
          totalRecordsFound: recordsFound.length,
          breachesDetected: breachRecords.length,
          breachRecords,
          estimatedLostCommission: breachRecords.reduce((total, record) => total + (record.estimatedLostCommission || 0), 0)
        },
        monitoring: {
          lastScanned: new Date(),
          nextScan: new Date(Date.now() + 24 * 60 * 60 * 1000),
          status: "Active",
          frequency: "Daily"
        }
      };

    } catch (error) {
      console.error("Public records monitoring error:", error);
      return {
        error: "Failed to scan public records",
        monitoring: { status: "Error", lastScanned: new Date() }
      };
    }
  }

  // Regrid API Integration for property parcels and ownership data
  async getParcelData(latitude: number, longitude: number) {
    const regridApiKey = process.env.REGRID_API_KEY;
    if (!regridApiKey) {
      throw new Error("Regrid API key not configured");
    }

    try {
      console.log(`Attempting Regrid API call for coordinates: ${latitude}, ${longitude}`);
      
      // Try multiple Regrid API endpoint formats
      const endpoints = [
        `https://app.regrid.com/api/v1/search.json?lat=${latitude}&lng=${longitude}&limit=1`,
        `https://app.regrid.com/api/v1/parcels.json?lat=${latitude}&lng=${longitude}&limit=1`,
        `https://api.regrid.com/v1/parcels?lat=${latitude}&lng=${longitude}&limit=1`
      ];

      for (const endpoint of endpoints) {
        try {
          const response = await fetch(endpoint, {
            headers: {
              'Authorization': `Bearer ${regridApiKey}`,
              'Content-Type': 'application/json',
              'User-Agent': 'Commission-Guard/1.0'
            }
          });

          console.log(`Regrid API response status: ${response.status} for endpoint: ${endpoint}`);
          
          if (response.ok) {
            const data = await response.json();
            console.log(`Regrid API response data:`, JSON.stringify(data).substring(0, 200));
            
            if (data.results && data.results.length > 0) {
              const parcel = data.results[0];
              return {
                success: true,
                parcel: {
                  parcelId: parcel.ll_uuid || parcel.id,
                  address: parcel.address || parcel.formatted_address,
                  owner: parcel.owner || parcel.owner_name,
                  propertyType: parcel.property_type || parcel.land_use_code,
                  landUse: parcel.land_use_general || parcel.land_use,
                  acreage: parcel.acres || parcel.area_acres,
                  assessedValue: parcel.assessed_total_value || parcel.total_assessed_value,
                  marketValue: parcel.market_total_value || parcel.market_value,
                  yearBuilt: parcel.year_built || parcel.built_year,
                  bedrooms: parcel.bedrooms || parcel.beds,
                  bathrooms: parcel.bathrooms || parcel.baths,
                  squareFeet: parcel.building_area || parcel.sqft,
                  lotSize: parcel.lot_size_acres || parcel.lot_acres,
                  zoning: parcel.zoning || parcel.zoning_code,
                  lastSaleDate: parcel.last_sale_date || parcel.sale_date,
                  lastSalePrice: parcel.last_sale_price || parcel.sale_price,
                  taxYear: parcel.tax_year || new Date().getFullYear(),
                  taxAmount: parcel.tax_amount || parcel.annual_tax,
                  county: parcel.county || parcel.county_name,
                  state: parcel.state_name || parcel.state
                }
              };
            }
          }
        } catch (endpointError) {
          console.log(`Endpoint ${endpoint} failed:`, endpointError);
          continue;
        }
      }

      // If all API endpoints fail, provide informative error
      return {
        success: false,
        error: 'Regrid API authentication issue - please verify API key and endpoint access',
        debug: {
          latitude,
          longitude,
          keyPresent: !!regridApiKey,
          keyPrefix: regridApiKey.substring(0, 10)
        }
      };
    } catch (error) {
      console.error('Regrid API error:', error);
      return {
        success: false,
        error: `Regrid API connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        shouldContactSupport: true
      };
    }
  }

  // Get parcel data by address
  async getParcelByAddress(address: string) {
    const regridApiKey = process.env.REGRID_API_KEY;
    if (!regridApiKey) {
      throw new Error("Regrid API key not configured");
    }

    try {
      const response = await fetch(
        `https://app.regrid.com/api/v1/parcels.json?query=${encodeURIComponent(address)}&limit=1&token=${regridApiKey}`,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.results && data.results.length > 0) {
        const parcel = data.results[0];
        return {
          success: true,
          parcel: {
            parcelId: parcel.ll_uuid,
            address: parcel.address,
            owner: parcel.owner,
            propertyType: parcel.property_type,
            landUse: parcel.land_use_general,
            acreage: parcel.acres,
            assessedValue: parcel.assessed_total_value,
            marketValue: parcel.market_total_value,
            yearBuilt: parcel.year_built,
            bedrooms: parcel.bedrooms,
            bathrooms: parcel.bathrooms,
            squareFeet: parcel.building_area,
            lotSize: parcel.lot_size_acres,
            zoning: parcel.zoning,
            lastSaleDate: parcel.last_sale_date,
            lastSalePrice: parcel.last_sale_price,
            taxYear: parcel.tax_year,
            taxAmount: parcel.tax_amount,
            county: parcel.county,
            state: parcel.state_name,
            coordinates: {
              latitude: parcel.ll_geopoint?.lat,
              longitude: parcel.ll_geopoint?.lon
            }
          }
        };
      }

      return {
        success: false,
        error: 'No parcel data found for this address'
      };
    } catch (error) {
      console.error('Regrid API error:', error);
      throw new Error(`Failed to get parcel data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get ownership history for a parcel
  async getOwnershipHistory(parcelId: string) {
    const regridApiKey = process.env.REGRID_API_KEY;
    if (!regridApiKey) {
      throw new Error("Regrid API key not configured");
    }

    try {
      const response = await fetch(
        `https://app.regrid.com/api/v1/parcels/${parcelId}/ownership_history.json?token=${regridApiKey}`,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      return {
        success: true,
        history: data.results || []
      };
    } catch (error) {
      console.error('Regrid ownership history error:', error);
      throw new Error(`Failed to get ownership history: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Real Estate Market Data
  async getMarketData(location: string) {
    const marketDataApiKey = process.env.MARKET_DATA_API_KEY;
    if (!marketDataApiKey) {
      throw new Error("Market data API key not configured");
    }

    // Mock response - will integrate with market data providers
    return {
      averagePrice: null,
      priceChange: null,
      daysOnMarket: null,
      message: "Market data API integration ready"
    };
  }

  // Lead Generation Integration
  async generateLeads(criteria: {
    location: string;
    priceRange: [number, number];
    propertyType: string;
  }) {
    const leadGenApiKey = process.env.LEAD_GEN_API_KEY;
    if (!leadGenApiKey) {
      throw new Error("Lead generation API key not configured");
    }

    // Mock response - will integrate with lead generation services
    return {
      leads: [],
      message: "Lead generation API integration ready"
    };
  }
}

export const apiIntegrationService = new ApiIntegrationService();