import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export class AISupportService {
  async generateSupportResponse(message: string, conversationHistory: ChatMessage[] = []): Promise<string> {
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
        ...conversationHistory.slice(-8), // Keep last 8 messages for context
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
      throw new Error('Failed to generate AI response');
    }
  }

  async generateQuickSuggestions(userQuery: string): Promise<string[]> {
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
      return [
        "How do I set up contract alerts?",
        "What evidence should I collect for protection?",
        "How does public records monitoring work?"
      ];
    }
  }

  async analyzeUserIntent(message: string): Promise<{
    category: string;
    urgency: 'low' | 'medium' | 'high';
    suggestedActions: string[];
  }> {
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

      // Fallback response
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