// Property Data Service - Provides clear, honest feedback about data availability

export class PropertyDataService {
  // Known addresses with good data coverage for demonstrations
  private knownGoodAddresses = [
    { 
      address: "1600 Amphitheatre Parkway, Mountain View, CA",
      type: "tech_campus",
      dataAvailable: false,
      reason: "Corporate campus - limited residential data"
    },
    {
      address: "123 Main Street, Austin, TX 78701", 
      type: "downtown_residential",
      dataAvailable: true,
      reason: "Good coverage in Austin downtown area"
    },
    {
      address: "456 Congress Ave, Austin, TX 78701",
      type: "commercial", 
      dataAvailable: true,
      reason: "Commercial district with property records"
    },
    {
      address: "789 Peachtree St, Atlanta, GA 30309",
      type: "urban_residential",
      dataAvailable: true, 
      reason: "Atlanta metro area coverage"
    }
  ];

  // Mock realistic property data for demonstration addresses
  private samplePropertyData = {
    "123 Main Street, Austin, TX 78701": {
      owner: "Austin Properties LLC",
      propertyType: "Single Family Residential",
      assessedValue: 485000,
      yearBuilt: 1987,
      squareFeet: 1850,
      bedrooms: 3,
      bathrooms: 2,
      lotSize: 0.25,
      zoning: "SF-3",
      lastSalePrice: 425000,
      lastSaleDate: "2022-06-15",
      taxAmount: 8250,
      county: "Travis County",
      state: "Texas"
    },
    "456 Congress Ave, Austin, TX 78701": {
      owner: "Downtown Commercial Group",
      propertyType: "Commercial Office",
      assessedValue: 2450000,
      yearBuilt: 1995,
      squareFeet: 12500,
      lotSize: 0.75,
      zoning: "CBD",
      lastSalePrice: 2200000,
      lastSaleDate: "2021-03-22",
      taxAmount: 42500,
      county: "Travis County", 
      state: "Texas"
    },
    "789 Peachtree St, Atlanta, GA 30309": {
      owner: "Georgia Investment Trust",
      propertyType: "Condominium",
      assessedValue: 325000,
      yearBuilt: 2005,
      squareFeet: 1200,
      bedrooms: 2,
      bathrooms: 2,
      lotSize: 0.0,
      zoning: "MR-3",
      lastSalePrice: 310000,
      lastSaleDate: "2023-01-10",
      taxAmount: 5850,
      county: "Fulton County",
      state: "Georgia"
    }
  };

  async analyzeAddress(address: string, coordinates: { latitude: number, longitude: number }) {
    // Check if this is a demonstration address we have sample data for
    const normalizedAddress = this.normalizeAddress(address);
    const sampleData = this.samplePropertyData[normalizedAddress as keyof typeof this.samplePropertyData];
    
    if (sampleData) {
      return {
        success: true,
        dataSource: "demonstration",
        parcel: {
          parcelId: `demo_${Date.now()}`,
          address: address,
          ...sampleData
        },
        note: "This is demonstration data showing the type of property information available when records exist."
      };
    }

    // For other addresses, check data coverage patterns
    const coverageAnalysis = this.analyzeCoverage(address, coordinates);
    
    if (coverageAnalysis.likelyHasData) {
      // Attempt real API call here
      return await this.fetchRealPropertyData(coordinates);
    } else {
      return {
        success: false,
        error: "Limited data coverage for this location",
        coverage: coverageAnalysis,
        suggestions: this.getSuggestions(coordinates)
      };
    }
  }

  private normalizeAddress(address: string): string {
    return address.trim().toLowerCase()
      .replace(/\s+/g, ' ')
      .replace(/,\s*/g, ', ');
  }

  private analyzeCoverage(address: string, coordinates: { latitude: number, longitude: number }) {
    const { latitude, longitude } = coordinates;
    
    // Analyze geographic patterns for data coverage
    const inTexas = latitude >= 25.8 && latitude <= 36.5 && longitude >= -106.6 && longitude <= -93.5;
    const inCalifornia = latitude >= 32.5 && latitude <= 42.0 && longitude >= -124.4 && longitude <= -114.1;
    const inGeorgia = latitude >= 30.4 && latitude <= 35.0 && longitude >= -85.6 && longitude <= -80.8;
    const inColorado = latitude >= 37.0 && latitude <= 41.0 && longitude >= -109.1 && longitude <= -102.0;
    
    const isCommercialHub = address.toLowerCase().includes('main') || 
                           address.toLowerCase().includes('congress') ||
                           address.toLowerCase().includes('downtown');
    
    return {
      likelyHasData: (inTexas || inGeorgia || inColorado) && isCommercialHub,
      state: inTexas ? 'Texas' : inCalifornia ? 'California' : inGeorgia ? 'Georgia' : inColorado ? 'Colorado' : 'Unknown',
      reason: inTexas || inGeorgia || inColorado ? 
        'This region typically has good property data coverage' : 
        'Property databases have limited coverage in this area'
    };
  }

  private async fetchRealPropertyData(coordinates: { latitude: number, longitude: number }) {
    // This would contain the actual Regrid API calls
    // For now, return realistic limitation info
    return {
      success: false,
      error: "Real property data service connection in development",
      note: "Property data APIs require specialized licenses and have geographic limitations. Use demonstration addresses to see the interface."
    };
  }

  private getSuggestions(coordinates: { latitude: number, longitude: number }) {
    return {
      message: "For reliable property data demonstration, try these addresses:",
      addresses: [
        "123 Main Street, Austin, TX 78701",
        "456 Congress Ave, Austin, TX 78701", 
        "789 Peachtree St, Atlanta, GA 30309"
      ],
      note: "These addresses show the complete property research interface with realistic data."
    };
  }
}

export const propertyDataService = new PropertyDataService();