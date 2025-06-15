import OpenAI from "openai";
import { storage } from "./storage";
import type { 
  InsertDripCampaign, 
  InsertCampaignStep, 
  InsertClientCommunication,
  InsertAiConversation,
  DripCampaign,
  CampaignStep,
  ClientCommunication
} from "@shared/schema";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export class AiCommunicationService {
  
  async createDripCampaign(campaignData: {
    agentId: string;
    campaignType: string;
    targetAudience: string;
    description?: string;
  }): Promise<{ campaign: any; steps: any[] }> {
    try {
      // Generate campaign content using AI
      const campaignContent = await this.generateCampaignContent(
        campaignData.campaignType,
        campaignData.targetAudience,
        campaignData.description
      );

      // Create the campaign
      const campaign = await storage.createDripCampaign({
        agentId: campaignData.agentId,
        name: campaignContent.name,
        description: campaignContent.description,
        targetAudience: campaignData.targetAudience,
        campaignType: campaignData.campaignType,
        status: "draft",
        totalSteps: campaignContent.steps.length,
      });

      // Create campaign steps
      const steps = [];
      for (let i = 0; i < campaignContent.steps.length; i++) {
        const stepData = campaignContent.steps[i];
        const step = await storage.createCampaignStep({
          campaignId: campaign.id,
          stepNumber: i + 1,
          title: stepData.title,
          messageType: stepData.messageType,
          delayDays: stepData.delayDays,
          subject: stepData.subject,
          content: stepData.content,
          aiGenerated: true,
        });
        steps.push(step);
      }

      return { campaign, steps };
    } catch (error) {
      console.error("Error creating drip campaign:", error);
      throw new Error("Failed to create drip campaign");
    }
  }

  async generateCampaignContent(
    campaignType: string,
    targetAudience: string,
    description?: string
  ): Promise<{
    name: string;
    description: string;
    steps: Array<{
      title: string;
      messageType: string;
      delayDays: number;
      subject?: string;
      content: string;
    }>;
  }> {
    const prompt = `Create a real estate drip campaign for ${targetAudience} with campaign type: ${campaignType}.
    ${description ? `Additional context: ${description}` : ''}
    
    Generate a professional drip campaign with 5-7 steps that provides genuine value to potential clients.
    Each step should be spaced appropriately and include:
    - Professional, helpful content
    - Clear value proposition
    - Appropriate call-to-actions
    - Personal touch from a real estate agent
    
    Return JSON format:
    {
      "name": "Campaign Name",
      "description": "Brief description",
      "steps": [
        {
          "title": "Step Title",
          "messageType": "email",
          "delayDays": 0,
          "subject": "Email Subject",
          "content": "Full message content with personalization placeholders like {{clientName}}, {{agentName}}, {{agentPhone}}"
        }
      ]
    }`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert real estate marketing consultant. Create professional, valuable drip campaigns that build trust and provide genuine assistance to potential clients."
        },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    return JSON.parse(response.choices[0].message.content || "{}");
  }

  async generatePersonalizedMessage(
    messageType: string,
    clientData: any,
    agentData: any,
    context?: string
  ): Promise<{ subject?: string; content: string }> {
    const prompt = `Generate a personalized ${messageType} for a real estate client.
    
    Client: ${clientData.fullName} (${clientData.email})
    Agent: ${agentData.firstName} ${agentData.lastName} (${agentData.phone})
    Context: ${context || 'General follow-up'}
    
    Create a professional, helpful message that:
    - Addresses the client by name
    - Provides genuine value
    - Maintains a professional yet warm tone
    - Includes a clear next step or call-to-action
    - Shows expertise in real estate
    
    Return JSON format:
    {
      "subject": "Email subject (if email)",
      "content": "Full message content"
    }`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a professional real estate agent known for excellent client communication. Write helpful, personalized messages that build trust and provide value."
        },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.8,
    });

    return JSON.parse(response.choices[0].message.content || "{}");
  }

  async analyzeInquiry(inquiryText: string, clientData?: any): Promise<{
    sentiment: string;
    intent: string;
    urgency: string;
    suggestedResponse: string;
    keyTopics: string[];
  }> {
    const prompt = `Analyze this client inquiry and provide guidance for response:
    
    Inquiry: "${inquiryText}"
    ${clientData ? `Client: ${clientData.fullName} (${clientData.email})` : ''}
    
    Analyze for:
    - Sentiment (positive, neutral, negative, frustrated)
    - Intent (information_seeking, property_inquiry, scheduling, complaint, etc.)
    - Urgency level (low, medium, high, urgent)
    - Key topics mentioned
    - Suggested response approach
    
    Return JSON format:
    {
      "sentiment": "sentiment",
      "intent": "primary intent",
      "urgency": "urgency level",
      "suggestedResponse": "Suggested response message",
      "keyTopics": ["topic1", "topic2"]
    }`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert at analyzing client communications and providing guidance for real estate professionals on how to respond effectively."
        },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    return JSON.parse(response.choices[0].message.content || "{}");
  }

  async generateFollowUpSuggestions(
    clientData: any,
    communicationHistory: any[],
    context?: string
  ): Promise<{
    suggestions: Array<{
      type: string;
      timing: string;
      content: string;
      priority: string;
    }>;
  }> {
    const prompt = `Suggest follow-up communications for this real estate client:
    
    Client: ${clientData.fullName}
    Recent communications: ${communicationHistory.length} messages
    Last contact: ${communicationHistory[0]?.sentDate || 'No recent contact'}
    Context: ${context || 'General follow-up planning'}
    
    Suggest 3-5 follow-up actions with:
    - Communication type (email, call, text, meeting)
    - Optimal timing (immediate, 1 day, 3 days, 1 week, etc.)
    - Message content or talking points
    - Priority level (low, medium, high)
    
    Return JSON format:
    {
      "suggestions": [
        {
          "type": "email",
          "timing": "3 days",
          "content": "Suggested message content",
          "priority": "medium"
        }
      ]
    }`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a real estate client relationship expert. Provide strategic follow-up suggestions that maintain engagement without being pushy."
        },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.6,
    });

    return JSON.parse(response.choices[0].message.content || "{}");
  }

  async createAiConversation(
    agentId: string,
    conversationType: string,
    title: string,
    context: any = {},
    initialMessage: string
  ): Promise<any> {
    try {
      const conversation = await storage.createAiConversation({
        agentId,
        conversationType,
        title,
        context,
        messages: [
          {
            role: "user",
            content: initialMessage,
            timestamp: new Date().toISOString()
          }
        ],
      });

      return conversation;
    } catch (error) {
      console.error("Error creating AI conversation:", error);
      throw new Error("Failed to create AI conversation");
    }
  }

  async continueAiConversation(
    conversationId: number,
    userMessage: string
  ): Promise<{ response: string; updatedConversation: any }> {
    try {
      const conversation = await storage.getAiConversation(conversationId);
      if (!conversation) {
        throw new Error("Conversation not found");
      }

      const messages = conversation.messages as any[];
      messages.push({
        role: "user",
        content: userMessage,
        timestamp: new Date().toISOString()
      });

      // Generate AI response based on conversation type and context
      const aiResponse = await this.generateAiResponse(
        conversation.conversationType,
        messages,
        conversation.context
      );

      messages.push({
        role: "assistant",
        content: aiResponse,
        timestamp: new Date().toISOString()
      });

      const updatedConversation = await storage.updateAiConversation(conversationId, {
        messages,
        lastMessageAt: new Date(),
      });

      return { response: aiResponse, updatedConversation };
    } catch (error) {
      console.error("Error continuing AI conversation:", error);
      throw new Error("Failed to continue conversation");
    }
  }

  private async generateAiResponse(
    conversationType: string,
    messages: any[],
    context: any
  ): Promise<string> {
    const systemPrompts = {
      campaign_creation: "You are a real estate marketing expert helping create effective drip campaigns. Provide strategic advice on campaign structure, timing, and content.",
      message_drafting: "You are a professional real estate communication consultant. Help draft effective, personalized messages that build relationships and drive action.",
      inquiry_response: "You are a real estate client service expert. Help analyze and respond to client inquiries with professionalism and effectiveness.",
      market_analysis: "You are a real estate market analyst. Provide insights on market trends, property values, and investment opportunities."
    };

    const systemPrompt = systemPrompts[conversationType as keyof typeof systemPrompts] || 
      "You are a helpful real estate assistant providing professional guidance.";

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages.map(msg => ({
          role: msg.role,
          content: msg.content
        }))
      ],
      temperature: 0.7,
    });

    return response.choices[0].message.content || "";
  }
}

export const aiCommunicationService = new AiCommunicationService();