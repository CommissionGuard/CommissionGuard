import OpenAI from "openai";
import sgMail from "@sendgrid/mail";
import twilio from "twilio";
import { db } from "./db.js";
import { notificationReminders, showings, clients, users } from "../shared/schema.js";
import { eq, and, isNull, lt, sql } from "drizzle-orm";

// Initialize SendGrid (will need API key from user)
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

// Initialize Twilio client
let twilioClient: twilio.Twilio | null = null;
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
}

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export class NotificationService {
  
  async scheduleShowingReminders(showingId: number, agentId: string, clientId: number, scheduledDate: Date) {
    const reminders = [];
    
    // Calculate reminder times
    const showingTime = new Date(scheduledDate);
    const twentyFourHourBefore = new Date(showingTime.getTime() - 24 * 60 * 60 * 1000);
    const oneHourBefore = new Date(showingTime.getTime() - 60 * 60 * 1000);
    
    // Only schedule if reminder time is in the future
    const now = new Date();
    
    if (twentyFourHourBefore > now) {
      reminders.push({
        showingId,
        agentId,
        clientId,
        reminderType: "24_hour",
        notificationMethod: "both",
        scheduledFor: twentyFourHourBefore,
      });
    }
    
    if (oneHourBefore > now) {
      reminders.push({
        showingId,
        agentId,
        clientId,
        reminderType: "1_hour", 
        notificationMethod: "both",
        scheduledFor: oneHourBefore,
      });
    }
    
    // Insert reminders into database
    if (reminders.length > 0) {
      await db.insert(notificationReminders).values(reminders);
    }
    
    return reminders;
  }
  
  async processPendingReminders() {
    const now = new Date();
    
    // Get all pending reminders that should be sent now
    const pendingReminders = await db
      .select({
        reminder: notificationReminders,
        showing: showings,
        client: clients,
        agent: users,
      })
      .from(notificationReminders)
      .leftJoin(showings, eq(notificationReminders.showingId, showings.id))
      .leftJoin(clients, eq(notificationReminders.clientId, clients.id))
      .leftJoin(users, eq(notificationReminders.agentId, users.id))
      .where(
        and(
          eq(notificationReminders.status, "pending"),
          lt(notificationReminders.scheduledFor, now),
          isNull(notificationReminders.sentAt)
        )
      );
    
    for (const record of pendingReminders) {
      await this.sendReminder(record);
    }
  }
  
  private async sendReminder(record: any) {
    const { reminder, showing, client, agent } = record;
    
    try {
      // Generate personalized content using AI
      const content = await this.generateReminderContent(reminder, showing, client, agent);
      
      let emailSent = false;
      let smsSent = false;
      
      // Send email if method includes email
      if (reminder.notificationMethod === "email" || reminder.notificationMethod === "both") {
        if (client.email && process.env.SENDGRID_API_KEY) {
          await this.sendEmail(client.email, agent.firstName || "Your Agent", content.email);
          emailSent = true;
        }
      }
      
      // Send SMS if method includes SMS
      if (reminder.notificationMethod === "sms" || reminder.notificationMethod === "both") {
        if (client.phone && twilioClient && process.env.TWILIO_PHONE_NUMBER) {
          try {
            await this.sendSMS(
              client.phone, 
              content.sms, 
              reminder.agentId, 
              reminder.clientId, 
              reminder.showingId, 
              reminder.id
            );
            smsSent = true;
          } catch (smsError) {
            console.error("Failed to send SMS:", smsError);
            // Continue with other operations even if SMS fails
          }
        } else {
          console.log("SMS not sent - missing Twilio config or client phone:", {
            hasPhone: !!client.phone,
            hasTwilioClient: !!twilioClient,
            hasTwilioPhone: !!process.env.TWILIO_PHONE_NUMBER
          });
        }
      }
      
      // Update reminder status
      await db
        .update(notificationReminders)
        .set({
          status: "sent",
          sentAt: new Date(),
          emailContent: content.email.text,
          smsContent: content.sms,
        })
        .where(eq(notificationReminders.id, reminder.id));
        
    } catch (error) {
      // Log error and update status
      console.error("Failed to send reminder:", error);
      
      await db
        .update(notificationReminders)
        .set({
          status: "failed",
          errorMessage: error instanceof Error ? error.message : "Unknown error",
        })
        .where(eq(notificationReminders.id, reminder.id));
    }
  }
  
  private async generateReminderContent(reminder: any, showing: any, client: any, agent: any) {
    const timeFrame = reminder.reminderType === "24_hour" ? "24 hours" : "1 hour";
    const showingDate = new Date(showing.scheduledDate).toLocaleString();
    
    const prompt = `Generate a professional reminder message for a real estate showing. 
    
    Details:
    - Client: ${client.fullName}
    - Agent: ${agent.firstName} ${agent.lastName}
    - Showing time: ${showingDate}
    - Time until showing: ${timeFrame}
    - Property address: ${showing.propertyAddress || "Property location"}
    
    Create both email and SMS versions. Be professional, friendly, and include all important details.
    
    Respond with JSON in this format:
    {
      "email": {
        "subject": "Showing Reminder - [Property]",
        "text": "Email content here..."
      },
      "sms": "SMS message here (keep under 160 characters)"
    }`;
    
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      });
      
      return JSON.parse(response.choices[0].message.content || "{}");
    } catch (error) {
      // Fallback content if AI fails
      return {
        email: {
          subject: `Showing Reminder - ${timeFrame} Notice`,
          text: `Hello ${client.fullName},\n\nThis is a reminder that you have a property showing scheduled in ${timeFrame}.\n\nDetails:\nDate & Time: ${showingDate}\nAgent: ${agent.firstName} ${agent.lastName}\n\nPlease contact us if you need to reschedule.\n\nBest regards,\n${agent.firstName}`
        },
        sms: `Hi ${client.fullName}, reminder: showing in ${timeFrame} on ${showingDate}. Contact ${agent.firstName} if changes needed.`
      };
    }
  }
  
  private async sendEmail(to: string, agentName: string, content: any) {
    if (!process.env.SENDGRID_API_KEY) {
      throw new Error("SendGrid API key not configured");
    }
    
    const msg = {
      to,
      from: process.env.FROM_EMAIL || "noreply@commissionguard.com",
      subject: content.subject,
      text: content.text,
      html: content.text.replace(/\n/g, '<br>'),
    };
    
    await sgMail.send(msg);
  }

  private async sendSMS(to: string, message: string, agentId?: string, clientId?: number, showingId?: number, relatedReminderId?: number) {
    if (!twilioClient) {
      throw new Error("Twilio client not configured");
    }
    
    if (!process.env.TWILIO_PHONE_NUMBER) {
      throw new Error("Twilio phone number not configured");
    }

    // Format phone number to E.164 format if needed
    const formattedPhone = this.formatPhoneNumber(to);
    
    const messageData = await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: formattedPhone,
    });
    
    // Track the SMS message for response routing using SQL
    if (agentId) {
      try {
        await db.execute(sql`
          INSERT INTO sms_messages (
            twilio_message_sid, agent_id, client_id, showing_id, 
            from_phone, to_phone, message_body, direction, 
            status, message_type, related_reminder_id
          ) VALUES (
            ${messageData.sid}, ${agentId}, ${clientId || null}, ${showingId || null},
            ${process.env.TWILIO_PHONE_NUMBER}, ${formattedPhone}, ${message}, 
            'outbound', ${messageData.status || "sent"}, 'reminder', ${relatedReminderId || null}
          )
        `);
      } catch (trackingError) {
        console.error("Failed to track SMS message:", trackingError);
        // Continue anyway - don't fail the SMS send
      }
    }
    
    console.log(`SMS sent successfully to ${formattedPhone}, SID: ${messageData.sid}`);
    return messageData;
  }

  private formatPhoneNumber(phone: string): string {
    // Remove all non-digit characters
    const digits = phone.replace(/\D/g, '');
    
    // If it's a US number without country code, add +1
    if (digits.length === 10) {
      return `+1${digits}`;
    }
    
    // If it already has country code but no +, add it
    if (digits.length === 11 && digits.startsWith('1')) {
      return `+${digits}`;
    }
    
    // If it's already formatted correctly, return as is
    if (phone.startsWith('+')) {
      return phone;
    }
    
    // Default: assume it needs +1 prefix
    return `+1${digits}`;
  }
  
  async cancelShowingReminders(showingId: number) {
    // Mark all pending reminders for this showing as cancelled
    await db
      .update(notificationReminders)
      .set({ status: "cancelled" })
      .where(
        and(
          eq(notificationReminders.showingId, showingId),
          eq(notificationReminders.status, "pending")
        )
      );
  }
  
  async getRemindersByShowing(showingId: number) {
    return await db
      .select()
      .from(notificationReminders)
      .where(eq(notificationReminders.showingId, showingId));
  }

  async testSMS(phoneNumber: string, message: string) {
    return await this.sendSMS(phoneNumber, message);
  }

  // Handle incoming SMS responses from clients
  async handleIncomingSMS(fromPhone: string, messageBody: string, twilioMessageSid: string) {
    try {
      // Format the phone number to match our database format
      const formattedPhone = this.formatPhoneNumber(fromPhone);
      
      // Find the client and agent associated with this phone number
      const clientAgent = await this.findClientByPhone(formattedPhone);
      
      if (!clientAgent) {
        console.log(`No client found for phone number: ${formattedPhone}`);
        return {
          success: false,
          message: "Client not found",
          shouldReply: false
        };
      }

      // Record the incoming SMS using SQL
      await db.execute(sql`
        INSERT INTO sms_messages (
          twilio_message_sid, agent_id, client_id, showing_id,
          from_phone, to_phone, message_body, direction,
          status, message_type, related_reminder_id
        ) VALUES (
          ${twilioMessageSid}, ${clientAgent.agentId}, ${clientAgent.clientId}, NULL,
          ${formattedPhone}, ${process.env.TWILIO_PHONE_NUMBER || ""}, ${messageBody},
          'inbound', 'received', 'response', NULL
        )
      `);

      // Analyze the message for context and generate agent notification
      const response = await this.processClientResponse(messageBody, clientAgent);
      
      // Notify the agent about the client response
      await this.notifyAgent(clientAgent, messageBody, response);

      return {
        success: true,
        message: "Response processed and agent notified",
        shouldReply: response.shouldAutoReply,
        autoReply: response.autoReply
      };

    } catch (error) {
      console.error("Error handling incoming SMS:", error);
      return {
        success: false,
        message: "Error processing SMS",
        shouldReply: false
      };
    }
  }

  // Find client and their agent by phone number
  async findClientByPhone(phoneNumber: string) {
    const client = await db
      .select({
        clientId: clients.id,
        clientName: clients.firstName,
        agentId: clients.agentId,
        agentEmail: users.email,
        agentFirstName: users.firstName,
        agentLastName: users.lastName,
        agentPhone: users.phone,
      })
      .from(clients)
      .leftJoin(users, eq(clients.agentId, users.id))
      .where(eq(clients.phone, phoneNumber))
      .limit(1);

    return client[0] || null;
  }

  // Process client response using AI to understand context and intent
  private async processClientResponse(messageBody: string, clientAgent: any) {
       if (!openai) {
      return {
        category: "general",
        intent: "unknown",
        urgency: "normal",
        shouldAutoReply: false,
        autoReply: null,
        summary: messageBody
      };
    }
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are analyzing client responses to real estate showing reminders. Categorize the message and determine appropriate responses.

Categories: confirmation, cancellation, reschedule, question, complaint, general
Intent: wants_to_confirm, wants_to_cancel, wants_to_reschedule, has_question, expressing_concern, general_response
Urgency: low, normal, high, urgent

Return JSON with: category, intent, urgency, shouldAutoReply (boolean), autoReply (string or null), summary (brief summary for agent)`
          },
          {
            role: "user",
            content: `Client message: "${messageBody}"
            
Client: ${clientAgent.clientName}
Agent: ${clientAgent.agentFirstName} ${clientAgent.agentLastName}`
          }
        ],
        temperature: 0.3,
        max_tokens: 300
      });

      const result = completion.choices[0]?.message?.content;
      if (result) {
        return JSON.parse(result);
      }
    } catch (error) {
      console.error("Error analyzing client response:", error);
    }

    // Fallback response
    return {
      category: "general",
      intent: "unknown",
      urgency: "normal",
      shouldAutoReply: false,
      autoReply: null,
      summary: messageBody
    };
  }

  // Notify agent about client response via email
  private async notifyAgent(clientAgent: any, originalMessage: string, analysis: any) {
    if (!clientAgent.agentEmail || !process.env.SENDGRID_API_KEY) {
      console.log("Cannot notify agent - missing email or SendGrid config");
      return;
    }

    const urgencyEmoji = {
      low: "🟢",
      normal: "🟡", 
      high: "🟠",
      urgent: "🔴"
    };

    const subject = `${urgencyEmoji[analysis.urgency]} Client Response: ${clientAgent.clientName}`;
    
    const htmlContent = `
      <h3>Client Response Received</h3>
      <p><strong>Client:</strong> ${clientAgent.clientName}</p>
      <p><strong>Category:</strong> ${analysis.category}</p>
      <p><strong>Intent:</strong> ${analysis.intent}</p>
      <p><strong>Urgency:</strong> ${analysis.urgency}</p>
      
      <h4>Original Message:</h4>
      <p style="background: #f5f5f5; padding: 10px; border-radius: 5px;">"${originalMessage}"</p>
      
      <h4>AI Summary:</h4>
      <p>${analysis.summary}</p>
      
      ${analysis.shouldAutoReply ? `
        <h4>Auto-Reply Sent:</h4>
        <p style="background: #e8f5e8; padding: 10px; border-radius: 5px;">"${analysis.autoReply}"</p>
      ` : ''}
      
      <p><em>Reply to this email or contact the client directly to follow up.</em></p>
    `;

    try {
      await sgMail.send({
        to: clientAgent.agentEmail,
        from: process.env.FROM_EMAIL || "noreply@commissionguard.com",
        subject,
        html: htmlContent,
        text: `Client Response from ${clientAgent.clientName}: "${originalMessage}". Category: ${analysis.category}, Urgency: ${analysis.urgency}. ${analysis.summary}`
      });
      
      console.log(`Agent notification sent to ${clientAgent.agentEmail}`);
    } catch (error) {
      console.error("Failed to send agent notification:", error);
    }
  }

  // Send auto-reply to client if appropriate
  async sendAutoReply(toPhone: string, message: string, agentId: string, clientId: number) {
    try {
      return await this.sendSMS(toPhone, message, agentId, clientId);
    } catch (error) {
      console.error("Failed to send auto-reply:", error);
      throw error;
    }
  }

  // Get SMS conversation history for a client using SQL
  async getSMSHistory(clientId: number, agentId: string) {
    const result = await db.execute(sql`
      SELECT * FROM sms_messages 
      WHERE client_id = ${clientId} AND agent_id = ${agentId}
      ORDER BY created_at ASC
    `);
    return result.rows;
  }
}

export const notificationService = new NotificationService();
