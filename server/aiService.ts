import OpenAI from "openai";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY environment variable must be set");
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export class AIService {
  // Contract analysis for risk detection
  async analyzeContract(contractText: string): Promise<{
    riskLevel: "low" | "medium" | "high";
    riskFactors: string[];
    recommendations: string[];
    expirationDate?: string;
    commissionTerms?: string;
    potentialIssues: string[];
  }> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are a real estate legal expert analyzing representation agreements for commission protection. 
            Analyze the contract for potential risks, commission terms, expiration dates, and provide recommendations. 
            Respond with JSON in this format: {
              "riskLevel": "low|medium|high",
              "riskFactors": ["factor1", "factor2"],
              "recommendations": ["rec1", "rec2"],
              "expirationDate": "YYYY-MM-DD or null",
              "commissionTerms": "summary of commission terms",
              "potentialIssues": ["issue1", "issue2"]
            }`
          },
          {
            role: "user",
            content: `Analyze this real estate representation agreement:\n\n${contractText}`
          }
        ],
        response_format: { type: "json_object" },
      });

      return JSON.parse(response.choices[0].message.content || "{}");
    } catch (error) {
      console.error("Contract analysis error:", error);
      throw new Error("Failed to analyze contract");
    }
  }

  // Generate commission protection recommendations
  async generateCommissionRecommendations(contractData: {
    clientName: string;
    propertyAddress?: string;
    contractType: string;
    startDate: string;
    endDate: string;
    currentIssues?: string[];
  }): Promise<{
    priority: "low" | "medium" | "high";
    actionItems: string[];
    protectionStrategies: string[];
    riskMitigation: string[];
  }> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are a real estate commission protection expert. Generate specific, actionable recommendations 
            to protect agent commissions based on contract details. Focus on practical steps and risk mitigation.
            Respond with JSON in this format: {
              "priority": "low|medium|high",
              "actionItems": ["action1", "action2"],
              "protectionStrategies": ["strategy1", "strategy2"],
              "riskMitigation": ["risk1", "risk2"]
            }`
          },
          {
            role: "user",
            content: `Generate commission protection recommendations for:
            Client: ${contractData.clientName}
            Property: ${contractData.propertyAddress || "Various"}
            Contract Type: ${contractData.contractType}
            Start Date: ${contractData.startDate}
            End Date: ${contractData.endDate}
            Current Issues: ${contractData.currentIssues?.join(", ") || "None"}`
          }
        ],
        response_format: { type: "json_object" },
      });

      return JSON.parse(response.choices[0].message.content || "{}");
    } catch (error) {
      console.error("Recommendation generation error:", error);
      throw new Error("Failed to generate recommendations");
    }
  }

  // Intelligent alert prioritization
  async prioritizeAlerts(alerts: Array<{
    id: number;
    title: string;
    description: string;
    type: string;
    severity: string;
    contractInfo?: any;
  }>): Promise<Array<{
    id: number;
    aiPriority: number; // 1-10 scale
    reasoning: string;
    suggestedActions: string[];
  }>> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are an AI assistant that prioritizes real estate commission protection alerts. 
            Analyze each alert and assign a priority score (1-10, 10 being most urgent) with reasoning and suggested actions.
            Respond with JSON array in this format: [{
              "id": number,
              "aiPriority": number,
              "reasoning": "explanation",
              "suggestedActions": ["action1", "action2"]
            }]`
          },
          {
            role: "user",
            content: `Prioritize these commission protection alerts:\n${JSON.stringify(alerts, null, 2)}`
          }
        ],
        response_format: { type: "json_object" },
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");
      return result.alerts || [];
    } catch (error) {
      console.error("Alert prioritization error:", error);
      throw new Error("Failed to prioritize alerts");
    }
  }

  // Market trend analysis and predictions
  async analyzeMarketTrends(propertyData: {
    location: string;
    propertyType: string;
    priceHistory: Array<{ date: string; price: number }>;
    marketMetrics: any;
  }): Promise<{
    trendDirection: "increasing" | "decreasing" | "stable";
    confidenceLevel: number;
    predictions: {
      nextMonth: number;
      nextQuarter: number;
      nextYear: number;
    };
    marketInsights: string[];
    investmentRecommendations: string[];
  }> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are a real estate market analyst. Analyze property data and market trends to provide 
            predictions and investment recommendations. Respond with JSON in this format: {
              "trendDirection": "increasing|decreasing|stable",
              "confidenceLevel": number (0-1),
              "predictions": {
                "nextMonth": number,
                "nextQuarter": number,
                "nextYear": number
              },
              "marketInsights": ["insight1", "insight2"],
              "investmentRecommendations": ["rec1", "rec2"]
            }`
          },
          {
            role: "user",
            content: `Analyze this market data:\n${JSON.stringify(propertyData, null, 2)}`
          }
        ],
        response_format: { type: "json_object" },
      });

      return JSON.parse(response.choices[0].message.content || "{}");
    } catch (error) {
      console.error("Market analysis error:", error);
      throw new Error("Failed to analyze market trends");
    }
  }

  // Legal document analysis
  async analyzeLegalDocument(documentText: string, documentType: string): Promise<{
    compliance: "compliant" | "non-compliant" | "needs-review";
    issues: string[];
    suggestions: string[];
    legalRisks: string[];
    requiredActions: string[];
  }> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are a real estate legal compliance expert. Analyze legal documents for compliance issues, 
            legal risks, and provide suggestions for improvement. Respond with JSON in this format: {
              "compliance": "compliant|non-compliant|needs-review",
              "issues": ["issue1", "issue2"],
              "suggestions": ["suggestion1", "suggestion2"],
              "legalRisks": ["risk1", "risk2"],
              "requiredActions": ["action1", "action2"]
            }`
          },
          {
            role: "user",
            content: `Analyze this ${documentType} document for legal compliance:\n\n${documentText}`
          }
        ],
        response_format: { type: "json_object" },
      });

      return JSON.parse(response.choices[0].message.content || "{}");
    } catch (error) {
      console.error("Legal document analysis error:", error);
      throw new Error("Failed to analyze legal document");
    }
  }
}

export const aiService = new AIService();