import OpenAI from "openai";
import sgMail from "@sendgrid/mail";
import { db } from "./db.js";
import { notificationReminders, showings, clients, users } from "../shared/schema.js";
import { eq, and, isNull, lt } from "drizzle-orm";

// Initialize SendGrid (will need API key from user)
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
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
      
      // Send SMS if method includes SMS (placeholder - would need SMS service)
      if (reminder.notificationMethod === "sms" || reminder.notificationMethod === "both") {
        if (client.phone) {
          // SMS sending would go here with Twilio or similar service
          console.log("SMS would be sent to:", client.phone, content.sms);
          smsSent = true;
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
}

export const notificationService = new NotificationService();