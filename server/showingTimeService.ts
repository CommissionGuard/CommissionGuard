import { format, parseISO } from 'date-fns';

export interface ShowingTimeAppointment {
  id: string;
  propertyAddress: string;
  scheduledDateTime: string;
  duration: number;
  status: 'confirmed' | 'pending' | 'cancelled';
  agentName: string;
  agentEmail: string;
  clientName?: string;
  clientPhone?: string;
  clientEmail?: string;
  instructions?: string;
  appointmentType: string;
  confirmationNumber: string;
}

export interface ShowingTimeProperty {
  id: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  listingId?: string;
  mlsNumber?: string;
  price?: number;
}

export class ShowingTimeService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.SHOWINGTIME_API_KEY || '';
    this.baseUrl = process.env.SHOWINGTIME_API_URL || 'https://api.showingtime.com/v2';
  }

  /**
   * Fetch appointments from ShowingTime API
   */
  async getAppointments(agentEmail: string, startDate?: Date, endDate?: Date): Promise<ShowingTimeAppointment[]> {
    if (!this.apiKey) {
      throw new Error('ShowingTime API key not configured');
    }

    try {
      const params = new URLSearchParams({
        agent_email: agentEmail,
        start_date: startDate ? format(startDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
        end_date: endDate ? format(endDate, 'yyyy-MM-dd') : format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd')
      });

      const response = await fetch(`${this.baseUrl}/appointments?${params}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`ShowingTime API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return this.transformShowingTimeData(data.appointments || []);
    } catch (error) {
      console.error('Error fetching ShowingTime appointments:', error);
      throw error;
    }
  }

  /**
   * Get property details from ShowingTime
   */
  async getProperty(propertyId: string): Promise<ShowingTimeProperty | null> {
    if (!this.apiKey) {
      throw new Error('ShowingTime API key not configured');
    }

    try {
      const response = await fetch(`${this.baseUrl}/properties/${propertyId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`ShowingTime API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return this.transformPropertyData(data);
    } catch (error) {
      console.error('Error fetching ShowingTime property:', error);
      throw error;
    }
  }

  /**
   * Create or update appointment status in ShowingTime
   */
  async updateAppointmentStatus(appointmentId: string, status: 'confirmed' | 'cancelled', notes?: string): Promise<boolean> {
    if (!this.apiKey) {
      throw new Error('ShowingTime API key not configured');
    }

    try {
      const response = await fetch(`${this.baseUrl}/appointments/${appointmentId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status,
          agent_notes: notes,
        }),
      });

      if (!response.ok) {
        throw new Error(`ShowingTime API error: ${response.status} ${response.statusText}`);
      }

      return true;
    } catch (error) {
      console.error('Error updating ShowingTime appointment:', error);
      return false;
    }
  }

  /**
   * Transform ShowingTime appointment data to our format
   */
  private transformShowingTimeData(appointments: any[]): ShowingTimeAppointment[] {
    return appointments.map(apt => ({
      id: apt.id?.toString() || apt.appointment_id?.toString(),
      propertyAddress: this.formatAddress(apt.property),
      scheduledDateTime: apt.start_time || apt.scheduled_time,
      duration: apt.duration_minutes || 30,
      status: this.mapStatus(apt.status),
      agentName: apt.agent?.name || apt.agent_name || '',
      agentEmail: apt.agent?.email || apt.agent_email || '',
      clientName: apt.requester?.name || apt.client_name,
      clientPhone: apt.requester?.phone || apt.client_phone,
      clientEmail: apt.requester?.email || apt.client_email,
      instructions: apt.instructions || apt.special_instructions,
      appointmentType: apt.appointment_type || 'showing',
      confirmationNumber: apt.confirmation_number || apt.id?.toString() || '',
    }));
  }

  /**
   * Transform ShowingTime property data to our format
   */
  private transformPropertyData(property: any): ShowingTimeProperty {
    return {
      id: property.id?.toString(),
      address: this.formatAddress(property),
      city: property.city || '',
      state: property.state || '',
      zipCode: property.zip_code || property.postal_code || '',
      listingId: property.listing_id,
      mlsNumber: property.mls_number,
      price: property.list_price,
    };
  }

  /**
   * Format property address from ShowingTime data
   */
  private formatAddress(property: any): string {
    if (!property) return '';
    
    const parts = [];
    if (property.street_number) parts.push(property.street_number);
    if (property.street_name) parts.push(property.street_name);
    if (property.address) return property.address;
    
    const streetAddress = parts.join(' ');
    const fullParts = [streetAddress, property.city, property.state, property.zip_code].filter(Boolean);
    
    return fullParts.join(', ');
  }

  /**
   * Map ShowingTime status to our status values
   */
  private mapStatus(status: string): 'confirmed' | 'pending' | 'cancelled' {
    const statusLower = status?.toLowerCase() || '';
    
    if (statusLower.includes('confirm')) return 'confirmed';
    if (statusLower.includes('cancel') || statusLower.includes('decline')) return 'cancelled';
    
    return 'pending';
  }

  /**
   * Sync appointments from ShowingTime to Commission Guard
   */
  async syncAppointments(agentEmail: string, agentId: string): Promise<{
    imported: number;
    updated: number;
    errors: string[];
  }> {
    const results = {
      imported: 0,
      updated: 0,
      errors: [] as string[]
    };

    try {
      // Get appointments from ShowingTime for the next 30 days
      const startDate = new Date();
      const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      
      const appointments = await this.getAppointments(agentEmail, startDate, endDate);
      
      for (const appointment of appointments) {
        try {
          // Here you would integrate with your storage service
          // This is a placeholder for the actual implementation
          console.log(`Processing appointment: ${appointment.id} - ${appointment.propertyAddress}`);
          
          // You would call your storage service to create/update the showing
          // const showing = await storage.createOrUpdateShowingFromShowingTime(appointment, agentId);
          
          results.imported++;
        } catch (error) {
          console.error(`Error processing appointment ${appointment.id}:`, error);
          results.errors.push(`Failed to process appointment ${appointment.id}: ${error}`);
        }
      }
    } catch (error) {
      console.error('Error syncing ShowingTime appointments:', error);
      results.errors.push(`Sync failed: ${error}`);
    }

    return results;
  }

  /**
   * Test ShowingTime API connection
   */
  async testConnection(agentEmail: string): Promise<boolean> {
    try {
      await this.getAppointments(agentEmail);
      return true;
    } catch (error) {
      console.error('ShowingTime connection test failed:', error);
      return false;
    }
  }
}

export const showingTimeService = new ShowingTimeService();