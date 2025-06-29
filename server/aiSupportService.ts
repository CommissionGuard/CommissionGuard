import OpenAI from 'openai';

const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null;

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export class AISupportService {
  async generateSupportResponse(message: string, conversationHistory: ChatMessage[] = []): Promise<string> {
    if (!openai) {
      const lowerMessage = message.toLowerCase();
      
      if (lowerMessage.includes('contract') || lowerMessage.includes('agreement')) {
        return "I'd be happy to help with contract management! Commission Guard helps you track representation agreements, monitor expiration dates, and set up automated reminders. You can upload contracts in the Contracts section and our system will analyze them for important dates and terms. For specific legal questions, please use our Legal Support feature.";
      }
      
      if (lowerMessage.includes('client') || lowerMessage.includes('customer')) {
        return "For client management, Commission Guard provides comprehensive client tracking, showing schedules, and communication history. You can add clients in the Clients section, track their property interests, and monitor all interactions to protect your commissions. The system also helps detect if clients work with other agents.";
      }
      
      if (lowerMessage.includes('showing') || lowerMessage.includes('appointment')) {
        return "The Showing Tracker helps you schedule and monitor property showings, integrate with ShowingTime, and automatically detect missed appointments. This creates a paper trail to protect your commissions if clients later work with other agents. You can also set up automated SMS reminders for clients.";
      }
      
      if (lowerMessage.includes('commission') || lowerMessage.includes('protection')) {
        return "Commission Guard specializes in protecting your real estate commissions from client ghosting and unauthorized transactions. The platform monitors public records, tracks client activities, and provides legal evidence if clients breach their representation agreements. Check the Commission Tracker for detailed protection records.";
      }
      
      if (lowerMessage.includes('alert') || lowerMessage.includes('notification')) {
        return "The alert system monitors contract expirations, potential breaches, and suspicious client activity. You can view all alerts in the Alerts section and set up automated notifications via email and SMS. The system prioritizes alerts based on urgency and commission risk.";
      }
      
      if (lowerMessage.includes('help') || lowerMessage.includes('how') || lowerMessage.includes('support')) {
        return "Commission Guard offers multiple support options: AI assistance (currently limited), Legal Support for contract issues, IT Support for technical problems, and Real Estate Support through our Frontline Realty partnership. You can access all support options through the Support menu in your user dropdown.";
      }
      
      return "I'm currently experiencing technical difficulties with my AI responses due to API limitations. However, I can still help you navigate Commission Guard! The platform includes Contracts, Clients, Showing Tracker, Commission Protection, Alerts, and Public Records monitoring. For immediate assistance, please use the Support menu or contact our support team directly.";
    }

    try {
      const systemPrompt = `You are an expert AI assistant for Commission Guard, a real estate commission protection platform. You help real estate agents and brokers with:

1. Commission protection strategies and best practices
2. Contract analysis and representation agreement guidance
3. Platform features and how to use them effectively
4. Real estate regulations and legal compliance
5. Breach prevention and detection methods
6. Public records monitoring guidance
7. Client management and relationship protection

Key Platform Features to Reference:
- Contract Management: Upload and analyze representation agreements
- Client Tracking: Manage client relationships and contact history
- Showing Tracker: Log property visits and client interactions
- Commission Protection: Document evidence for commission claims
- Alerts System: Automated notifications for contract expirations and potential breaches
- Public Records Monitoring: Track unauthorized transactions
- AI Contract Analysis: Risk assessment and legal review
- Property Research: Market analysis and valuation tools

Guidelines:
- Provide practical, actionable advice for real estate professionals
- Reference specific Commission Guard features when relevant
- Always emphasize legal compliance and professional ethics
- Suggest consulting legal professionals for complex legal matters
- Be supportive and understanding of the challenges agents face
- Use clear, professional language appropriate for business users
- Focus on commission protection and breach prevention strategies

Maintain a helpful, professional tone while being concise and practical in your responses.`;

      const messages = [
        { role: "system" as const, content: systemPrompt },
        ...conversationHistory.slice(-8),
        { role: "user" as const, content: message }
      ];

      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: messages,
        max_tokens: 800,
        temperature: 0.7,
        presence_penalty: 0.1,
        frequency_penalty: 0.1
      });

      return completion.choices[0]?.message?.content || 
        "I apologize, but I'm having trouble generating a response right now. Please try rephrasing your question or contact our support team for immediate assistance.";

    } catch (error) {
      console.error('Error generating AI support response:', error);
      
      const lowerMessage = message.toLowerCase();
      
      if (lowerMessage.includes('contract') || lowerMessage.includes('agreement')) {
        return "I'd be happy to help with contract management! Commission Guard helps you track representation agreements, monitor expiration dates, and set up automated reminders. You can upload contracts in the Contracts section and our system will analyze them for important dates and terms. For specific legal questions, please use our Legal Support feature.";
      }
      
      if (lowerMessage.includes('client') || lowerMessage.includes('customer')) {
        return "For client management, Commission Guard provides comprehensive client tracking, showing schedules, and communication history. You can add clients in the Clients section, track their property interests, and monitor all interactions to protect your commissions. The system also helps detect if clients work with other agents.";
      }
      
      if (lowerMessage.includes('showing') || lowerMessage.includes('appointment')) {
        return "The Showing Tracker helps you schedule and monitor property showings, integrate with ShowingTime, and automatically detect missed appointments. This creates a paper trail to protect your commissions if clients later work with other agents. You can also set up automated SMS reminders for clients.";
      }
      
      if (lowerMessage.includes('commission') || lowerMessage.includes('protection')) {
        return "Commission Guard specializes in protecting your real estate commissions from client ghosting and unauthorized transactions. The platform monitors public records, tracks client activities, and provides legal evidence if clients breach their representation agreements. Check the Commission Tracker for detailed protection records.";
      }
      
      if (lowerMessage.includes('alert') || lowerMessage.includes('notification')) {
        return "The alert system monitors contract expirations, potential breaches, and suspicious client activity. You can view all alerts in the Alerts section and set up automated notifications via email and SMS. The system prioritizes alerts based on urgency and commission risk.";
      }
      
      if (lowerMessage.includes('help') || lowerMessage.includes('how') || lowerMessage.includes('support')) {
        return "Commission Guard offers multiple support options: AI assistance (currently limited), Legal Support for contract issues, IT Support for technical problems, and Real Estate Support through our Frontline Realty partnership. You can access all support options through the Support menu in your user dropdown.";
      }
      
      return "I'm currently experiencing technical difficulties with my AI responses due to API limitations. However, I can still help you navigate Commission Guard! The platform includes Contracts, Clients, Showing Tracker, Commission Protection, Alerts, and Public Records monitoring. For immediate assistance, please use the Support menu or contact our support team directly.";
    }
  }

  async generateQuickSuggestions(userQuery: string): Promise<string[]> {
    if (!openai) {
      const lowerQuery = userQuery.toLowerCase();
      
      if (lowerQuery.includes('contract')) {
        return [
          "How do I upload and analyze contracts?",
          "What contract terms should I monitor?",
          "How do I set up expiration alerts?"
        ];
      }
      
      if (lowerQuery.includes('client')) {
        return [
          "How do I track client communications?",
          "What signs indicate client ghosting?",
          "How do I add new clients to the system?"
        ];
      }
      
      if (lowerQuery.includes('showing')) {
        return [
          "How do I schedule property showings?",
          "Can I integrate with ShowingTime?",
          "How do I track missed appointments?"
        ];
      }
      
      if (lowerQuery.includes('commission')) {
        return [
          "How does commission protection work?",
          "What evidence do I need for breaches?",
          "How do I monitor public records?"
        ];
      }
      
      return [
        "How do I protect my commissions?",
        "What features help prevent client ghosting?",
        "How do I set up automated monitoring?"
      ];
    }

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "Generate 3 brief follow-up questions related to Commission Guard features and real estate commission protection. Each should be under 80 characters and directly actionable."
          },
          {
            role: "user",
            content: `User asked: "${userQuery}". What related questions might they have?`
          }
        ],
        max_tokens: 200,
        temperature: 0.8
      });

      const suggestions = completion.choices[0]?.message?.content
        ?.split('\n')
        .filter(line => line.trim().length > 0)
        .map(line => line.replace(/^\d+\.\s*/, '').trim())
        .slice(0, 3) || [];

      return suggestions;

    } catch (error) {
      console.error('Error generating suggestions:', error);
      
      const lowerQuery = userQuery.toLowerCase();
      
      if (lowerQuery.includes('contract')) {
        return [
          "How do I upload and analyze contracts?",
          "What contract terms should I monitor?",
          "How do I set up expiration alerts?"
        ];
      }
      
      if (lowerQuery.includes('client')) {
        return [
          "How do I track client communications?",
          "What signs indicate client ghosting?",
          "How do I add new clients to the system?"
        ];
      }
      
      if (lowerQuery.includes('showing')) {
        return [
          "How do I schedule property showings?",
          "Can I integrate with ShowingTime?",
          "How do I track missed appointments?"
        ];
      }
      
      if (lowerQuery.includes('commission')) {
        return [
          "How does commission protection work?",
          "What evidence do I need for breaches?",
          "How do I monitor public records?"
        ];
      }
      
      return [
        "How do I protect my commissions?",
        "What features help prevent client ghosting?",
        "How do I set up automated monitoring?"
      ];
    }
  }

  async analyzeUserIntent(message: string): Promise<{
    category: string;
    urgency: 'low' | 'medium' | 'high';
    suggestedActions: string[];
  }> {
    if (!openai) {
      return {
        category: "general",
        urgency: "medium",
        suggestedActions: ["Review your contracts", "Check platform alerts", "Contact support if needed"]
      };
    }

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `Analyze the user's message and return a JSON response with:
            - category: one of "contract", "platform", "legal", "technical", "commission_protection", "general"
            - urgency: low/medium/high based on time sensitivity
            - suggestedActions: array of 1-3 specific next steps they could take

            Focus on Commission Guard platform features and real estate commission protection needs.`
          },
          {
            role: "user",
            content: message
          }
        ],
        max_tokens: 150,
        temperature: 0.3
      });

      const response = completion.choices[0]?.message?.content;
      if (response) {
        try {
          return JSON.parse(response);
        } catch (parseError) {
          console.error('Error parsing intent analysis:', parseError);
        }
      }

      return {
        category: "general",
        urgency: "medium",
        suggestedActions: ["Review your contracts", "Check platform alerts", "Contact support if needed"]
      };

    } catch (error) {
      console.error('Error analyzing user intent:', error);
      return {
        category: "general",
        urgency: "medium",
        suggestedActions: ["Review your contracts", "Check platform alerts", "Contact support if needed"]
      };
    }
  }
}

export const aiSupportService = new AISupportService();
