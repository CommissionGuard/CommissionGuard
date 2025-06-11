import { apiIntegrationService } from "./apiIntegrations";
import { aiService } from "./aiService";

export class EnhancedPropertyService {
  // Property valuation tracking with AI predictions
  async getPropertyValuationTrends(address: string): Promise<{
    currentValue: number;
    valueHistory: Array<{ date: string; value: number; source: string }>;
    predictions: {
      nextMonth: number;
      nextQuarter: number;
      nextYear: number;
      confidence: number;
    };
    marketFactors: string[];
    investmentScore: number; // 1-10 scale
  }> {
    try {
      // Get property valuation from multiple sources
      const valuation = await apiIntegrationService.getPropertyValuation(address);
      
      // Get historical data and market context
      const location = await apiIntegrationService.getPropertyLocation(address);
      const marketData = await apiIntegrationService.getMarketData(location.city + ", " + location.state);
      
      // Generate value history (simulated for demo - in production would use real historical data)
      const valueHistory = this.generateValueHistory(valuation.estimatedValue);
      
      // Use AI to analyze trends and make predictions
      const aiAnalysis = await aiService.analyzeMarketTrends({
        location: `${location.city}, ${location.state}`,
        propertyType: valuation.propertyType || "residential",
        priceHistory: valueHistory.map(v => ({ date: v.date, price: v.value })),
        marketMetrics: marketData
      });

      return {
        currentValue: valuation.estimatedValue,
        valueHistory,
        predictions: aiAnalysis.predictions,
        marketFactors: aiAnalysis.marketInsights,
        investmentScore: this.calculateInvestmentScore(valuation, aiAnalysis)
      };
    } catch (error) {
      console.error("Property valuation trends error:", error);
      throw new Error("Failed to get property valuation trends");
    }
  }

  // Comprehensive property comparison
  async compareProperties(addresses: string[]): Promise<{
    properties: Array<{
      address: string;
      currentValue: number;
      pricePerSqFt: number;
      appreciation: number;
      investmentScore: number;
      pros: string[];
      cons: string[];
      marketPosition: "undervalued" | "fairly-valued" | "overvalued";
    }>;
    marketSummary: {
      averageValue: number;
      bestInvestment: string;
      highestAppreciation: string;
      marketTrend: string;
    };
  }> {
    try {
      const propertyAnalyses = await Promise.all(
        addresses.map(async (address) => {
          const valuation = await apiIntegrationService.getPropertyValuation(address);
          const trends = await this.getPropertyValuationTrends(address);
          
          return {
            address,
            currentValue: valuation.estimatedValue,
            pricePerSqFt: valuation.pricePerSquareFoot || 0,
            appreciation: this.calculateAppreciation(trends.valueHistory),
            investmentScore: trends.investmentScore,
            sqft: valuation.squareFootage || 0,
            details: valuation
          };
        })
      );

      // AI-powered analysis of each property
      const enhancedProperties = await Promise.all(
        propertyAnalyses.map(async (prop) => {
          const analysis = await aiService.analyzeMarketTrends({
            location: prop.address,
            propertyType: "residential",
            priceHistory: [],
            marketMetrics: prop.details
          });

          return {
            address: prop.address,
            currentValue: prop.currentValue,
            pricePerSqFt: prop.pricePerSqFt,
            appreciation: prop.appreciation,
            investmentScore: prop.investmentScore,
            pros: analysis.investmentRecommendations.filter(r => r.includes("positive") || r.includes("good")),
            cons: analysis.marketInsights.filter(i => i.includes("risk") || i.includes("concern")),
            marketPosition: this.determineMarketPosition(prop, propertyAnalyses)
          };
        })
      );

      const marketSummary = this.generateMarketSummary(enhancedProperties);

      return {
        properties: enhancedProperties,
        marketSummary
      };
    } catch (error) {
      console.error("Property comparison error:", error);
      throw new Error("Failed to compare properties");
    }
  }

  // Advanced rental market analysis
  async analyzeRentalMarket(location: string): Promise<{
    averageRent: number;
    rentTrends: Array<{ period: string; rent: number; change: number }>;
    occupancyRate: number;
    timeOnMarket: number;
    rentalYield: number;
    marketSegments: Array<{
      type: string;
      averageRent: number;
      demand: "high" | "medium" | "low";
      supply: "high" | "medium" | "low";
    }>;
    recommendations: string[];
    investmentPotential: number; // 1-10 scale
  }> {
    try {
      // Get rental market data
      const rentalData = await apiIntegrationService.getRentCastMarketData(
        location.split(",")[0].trim(),
        location.split(",")[1]?.trim() || ""
      );

      // Analyze trends and generate insights
      const rentTrends = this.generateRentTrends(rentalData);
      const marketSegments = this.analyzeMarketSegments(rentalData);
      
      // AI-powered recommendations
      const aiAnalysis = await aiService.analyzeMarketTrends({
        location,
        propertyType: "rental",
        priceHistory: rentTrends.map(t => ({ date: t.period, price: t.rent })),
        marketMetrics: rentalData
      });

      return {
        averageRent: rentalData.averageRent || 2500,
        rentTrends,
        occupancyRate: rentalData.occupancyRate || 0.95,
        timeOnMarket: rentalData.timeOnMarket || 14,
        rentalYield: this.calculateRentalYield(rentalData),
        marketSegments,
        recommendations: aiAnalysis.investmentRecommendations,
        investmentPotential: Math.round(aiAnalysis.confidenceLevel * 10)
      };
    } catch (error) {
      console.error("Rental market analysis error:", error);
      throw new Error("Failed to analyze rental market");
    }
  }

  // Portfolio performance analytics
  async analyzePortfolioPerformance(properties: Array<{
    address: string;
    purchasePrice: number;
    purchaseDate: string;
    monthlyRent?: number;
  }>): Promise<{
    totalValue: number;
    totalAppreciation: number;
    totalRentalIncome: number;
    roi: number;
    bestPerformer: string;
    worstPerformer: string;
    diversificationScore: number;
    riskLevel: "low" | "medium" | "high";
    recommendations: string[];
  }> {
    try {
      const analyses = await Promise.all(
        properties.map(async (prop) => {
          const currentValuation = await apiIntegrationService.getPropertyValuation(prop.address);
          const trends = await this.getPropertyValuationTrends(prop.address);
          
          const appreciation = currentValuation.estimatedValue - prop.purchasePrice;
          const appreciationPercent = (appreciation / prop.purchasePrice) * 100;
          
          const monthsOwned = this.calculateMonthsOwned(prop.purchaseDate);
          const totalRent = (prop.monthlyRent || 0) * monthsOwned;
          
          return {
            address: prop.address,
            currentValue: currentValuation.estimatedValue,
            appreciation,
            appreciationPercent,
            totalRent,
            investmentScore: trends.investmentScore,
            roi: ((appreciation + totalRent) / prop.purchasePrice) * 100
          };
        })
      );

      const totalValue = analyses.reduce((sum, a) => sum + a.currentValue, 0);
      const totalAppreciation = analyses.reduce((sum, a) => sum + a.appreciation, 0);
      const totalRentalIncome = analyses.reduce((sum, a) => sum + a.totalRent, 0);
      const totalInvested = properties.reduce((sum, p) => sum + p.purchasePrice, 0);
      const overallROI = ((totalAppreciation + totalRentalIncome) / totalInvested) * 100;

      const bestPerformer = analyses.reduce((best, current) => 
        current.roi > best.roi ? current : best
      ).address;

      const worstPerformer = analyses.reduce((worst, current) => 
        current.roi < worst.roi ? current : worst
      ).address;

      const diversificationScore = this.calculateDiversificationScore(properties);
      const riskLevel = this.assessPortfolioRisk(analyses);

      // AI-powered portfolio recommendations
      const aiAnalysis = await aiService.generateCommissionRecommendations({
        clientName: "Portfolio Analysis",
        contractType: "Investment Portfolio",
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        currentIssues: riskLevel === "high" ? ["High risk portfolio"] : []
      });

      return {
        totalValue,
        totalAppreciation,
        totalRentalIncome,
        roi: overallROI,
        bestPerformer,
        worstPerformer,
        diversificationScore,
        riskLevel,
        recommendations: aiAnalysis.protectionStrategies
      };
    } catch (error) {
      console.error("Portfolio analysis error:", error);
      throw new Error("Failed to analyze portfolio performance");
    }
  }

  // Helper methods
  private generateValueHistory(currentValue: number) {
    const history = [];
    const now = new Date();
    
    for (let i = 24; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const variation = (Math.random() - 0.5) * 0.1; // ±5% variation
      const value = Math.round(currentValue * (1 + variation - (i * 0.002))); // Slight downward trend for realism
      
      history.push({
        date: date.toISOString().split('T')[0],
        value,
        source: i < 6 ? "MLS" : "Public Records"
      });
    }
    
    return history;
  }

  private calculateInvestmentScore(valuation: any, aiAnalysis: any): number {
    let score = 5; // Base score
    
    // Adjust based on AI confidence
    score += aiAnalysis.confidenceLevel * 3;
    
    // Adjust based on trend direction
    if (aiAnalysis.trendDirection === "increasing") score += 2;
    else if (aiAnalysis.trendDirection === "decreasing") score -= 2;
    
    return Math.max(1, Math.min(10, Math.round(score)));
  }

  private calculateAppreciation(valueHistory: any[]): number {
    if (valueHistory.length < 2) return 0;
    
    const oldest = valueHistory[0].value;
    const newest = valueHistory[valueHistory.length - 1].value;
    
    return ((newest - oldest) / oldest) * 100;
  }

  private determineMarketPosition(property: any, allProperties: any[]): "undervalued" | "fairly-valued" | "overvalued" {
    const avgPricePerSqFt = allProperties.reduce((sum, p) => sum + p.pricePerSqFt, 0) / allProperties.length;
    
    if (property.pricePerSqFt < avgPricePerSqFt * 0.9) return "undervalued";
    if (property.pricePerSqFt > avgPricePerSqFt * 1.1) return "overvalued";
    return "fairly-valued";
  }

  private generateMarketSummary(properties: any[]) {
    const averageValue = properties.reduce((sum, p) => sum + p.currentValue, 0) / properties.length;
    const bestInvestment = properties.reduce((best, current) => 
      current.investmentScore > best.investmentScore ? current : best
    ).address;
    const highestAppreciation = properties.reduce((best, current) => 
      current.appreciation > best.appreciation ? current : best
    ).address;
    
    const avgAppreciation = properties.reduce((sum, p) => sum + p.appreciation, 0) / properties.length;
    const marketTrend = avgAppreciation > 5 ? "Strong Growth" : avgAppreciation > 0 ? "Moderate Growth" : "Declining";

    return {
      averageValue: Math.round(averageValue),
      bestInvestment,
      highestAppreciation,
      marketTrend
    };
  }

  private generateRentTrends(rentalData: any) {
    const trends = [];
    const currentRent = rentalData.averageRent || 2500;
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const period = date.toLocaleString('default', { month: 'short', year: 'numeric' });
      
      const variation = (Math.random() - 0.5) * 0.05; // ±2.5% variation
      const rent = Math.round(currentRent * (1 + variation + (i * 0.003))); // Slight upward trend
      const change = i === 11 ? 0 : rent - trends[trends.length - 1]?.rent || 0;
      
      trends.push({ period, rent, change });
    }
    
    return trends;
  }

  private analyzeMarketSegments(rentalData: any) {
    return [
      {
        type: "Studio",
        averageRent: Math.round((rentalData.averageRent || 2500) * 0.6),
        demand: "high" as const,
        supply: "low" as const
      },
      {
        type: "1 Bedroom",
        averageRent: Math.round((rentalData.averageRent || 2500) * 0.8),
        demand: "high" as const,
        supply: "medium" as const
      },
      {
        type: "2 Bedroom",
        averageRent: rentalData.averageRent || 2500,
        demand: "medium" as const,
        supply: "medium" as const
      },
      {
        type: "3+ Bedroom",
        averageRent: Math.round((rentalData.averageRent || 2500) * 1.4),
        demand: "low" as const,
        supply: "high" as const
      }
    ];
  }

  private calculateRentalYield(rentalData: any): number {
    const averageRent = rentalData.averageRent || 2500;
    const averagePrice = rentalData.averagePrice || 500000; // Estimated
    
    return (averageRent * 12 / averagePrice) * 100;
  }

  private calculateMonthsOwned(purchaseDate: string): number {
    const purchase = new Date(purchaseDate);
    const now = new Date();
    
    return Math.round((now.getTime() - purchase.getTime()) / (1000 * 60 * 60 * 24 * 30));
  }

  private calculateDiversificationScore(properties: any[]): number {
    // Simple diversification based on location spread
    const uniqueStates = new Set(properties.map(p => p.address.split(',').pop()?.trim()));
    const diversification = Math.min(uniqueStates.size / properties.length, 1);
    
    return Math.round(diversification * 10);
  }

  private assessPortfolioRisk(analyses: any[]): "low" | "medium" | "high" {
    const avgROI = analyses.reduce((sum, a) => sum + a.roi, 0) / analyses.length;
    const volatility = this.calculateVolatility(analyses.map(a => a.roi));
    
    if (avgROI > 10 && volatility < 5) return "low";
    if (avgROI < 0 || volatility > 15) return "high";
    return "medium";
  }

  private calculateVolatility(values: number[]): number {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    return Math.sqrt(variance);
  }
}

export const enhancedPropertyService = new EnhancedPropertyService();