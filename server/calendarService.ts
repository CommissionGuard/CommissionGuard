import { google } from 'googleapis';
import { Client } from '@microsoft/microsoft-graph-client';
import { db } from "./db.js";
import { calendarIntegrations, calendarEvents, showings } from "../shared/schema.js";
import { eq, and } from "drizzle-orm";

export class CalendarService {
  
  // Google Calendar Integration
  async setupGoogleCalendar(agentId: string, authCode: string) {
    try {
      const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI
      );

      const { tokens } = await oauth2Client.getToken(authCode);
      oauth2Client.setCredentials(tokens);

      // Get primary calendar
      const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
      const calendarList = await calendar.calendarList.list();
      const primaryCalendar = calendarList.data.items?.find(cal => cal.primary);

      // Store integration in database
      const integration = await db.insert(calendarIntegrations).values({
        agentId,
        provider: 'google',
        accessToken: tokens.access_token!,
        refreshToken: tokens.refresh_token,
        tokenExpiry: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
        calendarId: primaryCalendar?.id || 'primary',
        syncSettings: {
          autoSync: true,
          reminderMinutes: 15,
          includeClientInfo: true
        }
      }).returning();

      return integration[0];
    } catch (error) {
      console.error('Google Calendar setup failed:', error);
      throw new Error('Failed to setup Google Calendar integration');
    }
  }

  // Microsoft Outlook Integration
  async setupOutlookCalendar(agentId: string, accessToken: string, refreshToken?: string) {
    try {
      // Store integration in database
      const integration = await db.insert(calendarIntegrations).values({
        agentId,
        provider: 'outlook',
        accessToken,
        refreshToken,
        calendarId: 'primary',
        syncSettings: {
          autoSync: true,
          reminderMinutes: 15,
          includeClientInfo: true
        }
      }).returning();

      return integration[0];
    } catch (error) {
      console.error('Outlook Calendar setup failed:', error);
      throw new Error('Failed to setup Outlook Calendar integration');
    }
  }

  async createCalendarEvent(showingId: number, agentId: string) {
    // Get active calendar integrations for the agent
    const integrations = await db
      .select()
      .from(calendarIntegrations)
      .where(and(
        eq(calendarIntegrations.agentId, agentId),
        eq(calendarIntegrations.isActive, true)
      ));

    if (integrations.length === 0) {
      console.log('No active calendar integrations found for agent:', agentId);
      return;
    }

    // Get showing details
    const showing = await db
      .select()
      .from(showings)
      .where(eq(showings.id, showingId))
      .limit(1);

    if (showing.length === 0) {
      throw new Error('Showing not found');
    }

    const showingData = showing[0];
    
    // Create events in all active calendars
    for (const integration of integrations) {
      try {
        if (integration.provider === 'google') {
          await this.createGoogleCalendarEvent(integration, showingData);
        } else if (integration.provider === 'outlook') {
          await this.createOutlookCalendarEvent(integration, showingData);
        }
      } catch (error) {
        console.error(`Failed to create ${integration.provider} calendar event:`, error);
      }
    }
  }

  private async createGoogleCalendarEvent(integration: any, showing: any) {
    try {
      const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI
      );

      oauth2Client.setCredentials({
        access_token: integration.accessToken,
        refresh_token: integration.refreshToken,
      });

      const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
      
      const startTime = new Date(showing.scheduledDate);
      const endTime = new Date(startTime.getTime() + (60 * 60 * 1000)); // 1 hour duration

      const event = {
        summary: `Property Showing - ${showing.propertyAddress || 'Property Visit'}`,
        description: `Showing Type: ${showing.showingType}\nAgent Notes: ${showing.agentNotes || 'None'}\nCommission Protected: ${showing.commissionProtected ? 'Yes' : 'No'}`,
        start: {
          dateTime: startTime.toISOString(),
          timeZone: 'America/New_York',
        },
        end: {
          dateTime: endTime.toISOString(),
          timeZone: 'America/New_York',
        },
        location: showing.propertyAddress || '',
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 }, // 24 hours
            { method: 'popup', minutes: 60 }, // 1 hour
          ],
        },
      };

      const response = await calendar.events.insert({
        calendarId: integration.calendarId || 'primary',
        requestBody: event,
      });

      // Store the calendar event reference
      await db.insert(calendarEvents).values({
        showingId: showing.id,
        agentId: integration.agentId,
        integrationId: integration.id,
        externalEventId: response.data.id!,
        provider: 'google',
        eventTitle: event.summary,
        eventDescription: event.description,
        startTime: startTime,
        endTime: endTime,
        location: event.location,
      });

      console.log('Google Calendar event created:', response.data.id);
    } catch (error) {
      console.error('Google Calendar event creation failed:', error);
      throw error;
    }
  }

  private async createOutlookCalendarEvent(integration: any, showing: any) {
    try {
      const graphClient = Client.init({
        authProvider: (done) => {
          done(null, integration.accessToken);
        }
      });

      const startTime = new Date(showing.scheduledDate);
      const endTime = new Date(startTime.getTime() + (60 * 60 * 1000)); // 1 hour duration

      const event = {
        subject: `Property Showing - ${showing.propertyAddress || 'Property Visit'}`,
        body: {
          contentType: 'text',
          content: `Showing Type: ${showing.showingType}\nAgent Notes: ${showing.agentNotes || 'None'}\nCommission Protected: ${showing.commissionProtected ? 'Yes' : 'No'}`
        },
        start: {
          dateTime: startTime.toISOString(),
          timeZone: 'America/New_York'
        },
        end: {
          dateTime: endTime.toISOString(),
          timeZone: 'America/New_York'
        },
        location: {
          displayName: showing.propertyAddress || ''
        },
        isReminderOn: true,
        reminderMinutesBeforeStart: 60
      };

      const response = await graphClient.api('/me/events').post(event);

      // Store the calendar event reference
      await db.insert(calendarEvents).values({
        showingId: showing.id,
        agentId: integration.agentId,
        integrationId: integration.id,
        externalEventId: response.id,
        provider: 'outlook',
        eventTitle: event.subject,
        eventDescription: event.body.content,
        startTime: startTime,
        endTime: endTime,
        location: showing.propertyAddress || '',
      });

      console.log('Outlook Calendar event created:', response.id);
    } catch (error) {
      console.error('Outlook Calendar event creation failed:', error);
      throw error;
    }
  }

  async updateCalendarEvent(showingId: number) {
    // Get all calendar events for this showing
    const events = await db
      .select()
      .from(calendarEvents)
      .where(eq(calendarEvents.showingId, showingId));

    // Get updated showing details
    const showing = await db
      .select()
      .from(showings)
      .where(eq(showings.id, showingId))
      .limit(1);

    if (showing.length === 0) {
      throw new Error('Showing not found');
    }

    const showingData = showing[0];

    // Update each calendar event
    for (const event of events) {
      try {
        const integration = await db
          .select()
          .from(calendarIntegrations)
          .where(eq(calendarIntegrations.id, event.integrationId))
          .limit(1);

        if (integration.length === 0) continue;

        if (event.provider === 'google') {
          await this.updateGoogleCalendarEvent(integration[0], event, showingData);
        } else if (event.provider === 'outlook') {
          await this.updateOutlookCalendarEvent(integration[0], event, showingData);
        }
      } catch (error) {
        console.error(`Failed to update ${event.provider} calendar event:`, error);
      }
    }
  }

  private async updateGoogleCalendarEvent(integration: any, event: any, showing: any) {
    try {
      const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI
      );

      oauth2Client.setCredentials({
        access_token: integration.accessToken,
        refresh_token: integration.refreshToken,
      });

      const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
      
      const startTime = new Date(showing.scheduledDate);
      const endTime = new Date(startTime.getTime() + (60 * 60 * 1000));

      const updatedEvent = {
        summary: `Property Showing - ${showing.propertyAddress || 'Property Visit'}`,
        description: `Showing Type: ${showing.showingType}\nAgent Notes: ${showing.agentNotes || 'None'}\nCommission Protected: ${showing.commissionProtected ? 'Yes' : 'No'}`,
        start: {
          dateTime: startTime.toISOString(),
          timeZone: 'America/New_York',
        },
        end: {
          dateTime: endTime.toISOString(),
          timeZone: 'America/New_York',
        },
        location: showing.propertyAddress || '',
      };

      await calendar.events.update({
        calendarId: integration.calendarId || 'primary',
        eventId: event.externalEventId,
        requestBody: updatedEvent,
      });

      console.log('Google Calendar event updated:', event.externalEventId);
    } catch (error) {
      console.error('Google Calendar event update failed:', error);
    }
  }

  private async updateOutlookCalendarEvent(integration: any, event: any, showing: any) {
    try {
      const graphClient = Client.init({
        authProvider: (done) => {
          done(null, integration.accessToken);
        }
      });

      const startTime = new Date(showing.scheduledDate);
      const endTime = new Date(startTime.getTime() + (60 * 60 * 1000));

      const updatedEvent = {
        subject: `Property Showing - ${showing.propertyAddress || 'Property Visit'}`,
        body: {
          contentType: 'text',
          content: `Showing Type: ${showing.showingType}\nAgent Notes: ${showing.agentNotes || 'None'}\nCommission Protected: ${showing.commissionProtected ? 'Yes' : 'No'}`
        },
        start: {
          dateTime: startTime.toISOString(),
          timeZone: 'America/New_York'
        },
        end: {
          dateTime: endTime.toISOString(),
          timeZone: 'America/New_York'
        },
        location: {
          displayName: showing.propertyAddress || ''
        }
      };

      await graphClient.api(`/me/events/${event.externalEventId}`).patch(updatedEvent);

      console.log('Outlook Calendar event updated:', event.externalEventId);
    } catch (error) {
      console.error('Outlook Calendar event update failed:', error);
    }
  }

  async deleteCalendarEvent(showingId: number) {
    // Get all calendar events for this showing
    const events = await db
      .select()
      .from(calendarEvents)
      .where(eq(calendarEvents.showingId, showingId));

    // Delete each calendar event
    for (const event of events) {
      try {
        const integration = await db
          .select()
          .from(calendarIntegrations)
          .where(eq(calendarIntegrations.id, event.integrationId))
          .limit(1);

        if (integration.length === 0) continue;

        if (event.provider === 'google') {
          await this.deleteGoogleCalendarEvent(integration[0], event);
        } else if (event.provider === 'outlook') {
          await this.deleteOutlookCalendarEvent(integration[0], event);
        }

        // Remove from database
        await db
          .delete(calendarEvents)
          .where(eq(calendarEvents.id, event.id));

      } catch (error) {
        console.error(`Failed to delete ${event.provider} calendar event:`, error);
      }
    }
  }

  private async deleteGoogleCalendarEvent(integration: any, event: any) {
    try {
      const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI
      );

      oauth2Client.setCredentials({
        access_token: integration.accessToken,
        refresh_token: integration.refreshToken,
      });

      const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
      
      await calendar.events.delete({
        calendarId: integration.calendarId || 'primary',
        eventId: event.externalEventId,
      });

      console.log('Google Calendar event deleted:', event.externalEventId);
    } catch (error) {
      console.error('Google Calendar event deletion failed:', error);
    }
  }

  private async deleteOutlookCalendarEvent(integration: any, event: any) {
    try {
      const graphClient = Client.init({
        authProvider: (done) => {
          done(null, integration.accessToken);
        }
      });

      await graphClient.api(`/me/events/${event.externalEventId}`).delete();

      console.log('Outlook Calendar event deleted:', event.externalEventId);
    } catch (error) {
      console.error('Outlook Calendar event deletion failed:', error);
    }
  }

  async getCalendarIntegrations(agentId: string) {
    return await db
      .select()
      .from(calendarIntegrations)
      .where(eq(calendarIntegrations.agentId, agentId));
  }

  async toggleCalendarIntegration(integrationId: number, isActive: boolean) {
    return await db
      .update(calendarIntegrations)
      .set({ isActive, updatedAt: new Date() })
      .where(eq(calendarIntegrations.id, integrationId))
      .returning();
  }
}

export const calendarService = new CalendarService();