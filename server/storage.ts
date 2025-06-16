import {
  users,
  clients,
  contracts,
  contractSigners,
  contractReminders,
  alerts,
  auditLogs,
  properties,
  showings,
  locationTracking,
  propertyVisits,
  commissionProtection,
  dripCampaigns,
  campaignSteps,
  campaignEnrollments,
  clientCommunications,
  aiConversations,
  notificationReminders,
  calendarIntegrations,
  calendarEvents,
  type User,
  type UpsertUser,
  type InsertClient,
  type Client,
  type InsertContract,
  type Contract,
  type InsertContractSigner,
  type ContractSigner,
  type InsertContractReminder,
  type ContractReminder,
  type InsertAlert,
  type Alert,
  type InsertAuditLog,
  type AuditLog,
  type InsertProperty,
  type Property,
  type InsertShowing,
  type Showing,
  type InsertLocationTracking,
  type LocationTracking,
  type InsertPropertyVisit,
  type PropertyVisit,
  type InsertCommissionProtection,
  type CommissionProtection,
  type InsertDripCampaign,
  type DripCampaign,
  type InsertCampaignStep,
  type CampaignStep,
  type InsertCampaignEnrollment,
  type CampaignEnrollment,
  type InsertClientCommunication,
  type ClientCommunication,
  type InsertAiConversation,
  type AiConversation,
  type InsertNotificationReminder,
  type NotificationReminder,
  type InsertCalendarIntegration,
  type CalendarIntegration,
  type InsertCalendarEvent,
  type CalendarEvent,
  type ClientWithContracts,
  type ContractWithDetails,
  type AlertWithDetails,
  type ShowingWithDetails,
  type PropertyVisitWithDetails,
  type LocationTrackingWithDetails,
  type CommissionProtectionWithDetails,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc, gte, lte, lt, count, sql } from "drizzle-orm";
import { inArray } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserProfile(id: string, updates: Partial<User>): Promise<User>;
  
  // Admin operations
  getAllUsers(): Promise<User[]>;
  updateUserRole(userId: string, role: string): Promise<User>;
  deactivateUser(userId: string): Promise<void>;
  activateUser(userId: string): Promise<void>;
  updateUserSubscription(userId: string, subscriptionData: any): Promise<User>;
  
  // Client operations
  createClient(client: InsertClient): Promise<Client>;
  getClient(id: number): Promise<Client | undefined>;
  getClientsByAgent(agentId: string): Promise<Client[]>;
  updateClient(id: number, updates: Partial<InsertClient>): Promise<Client>;
  deleteClient(id: number): Promise<void>;
  
  // Contract operations
  createContract(contract: InsertContract): Promise<Contract>;
  getContract(id: number): Promise<Contract | undefined>;
  getContractsByAgent(agentId: string): Promise<ContractWithDetails[]>;
  getContractsByClient(clientId: number): Promise<Contract[]>;
  updateContract(id: number, updates: Partial<InsertContract>): Promise<Contract>;
  deleteContract(id: number): Promise<void>;
  getExpiringContracts(agentId: string, daysAhead: number): Promise<ContractWithDetails[]>;
  
  // Contract Signer operations
  createContractSigner(signer: InsertContractSigner): Promise<ContractSigner>;
  getContractSigners(contractId: number): Promise<ContractSigner[]>;
  updateContractSigner(id: number, updates: Partial<InsertContractSigner>): Promise<ContractSigner>;
  deleteContractSigner(id: number): Promise<void>;
  markSignerAsSigned(id: number): Promise<void>;
  
  // Alert operations
  createAlert(alert: InsertAlert): Promise<Alert>;
  getAlert(id: number): Promise<Alert | undefined>;
  getAlertsByAgent(agentId: string): Promise<AlertWithDetails[]>;
  markAlertAsRead(id: number): Promise<void>;
  getUnreadAlertsCount(agentId: string): Promise<number>;
  
  // Audit log operations
  createAuditLog(auditLog: InsertAuditLog): Promise<AuditLog>;
  getAuditLogsByUser(userId: string): Promise<AuditLog[]>;
  
  // Dashboard statistics
  getDashboardStats(agentId: string): Promise<{
    activeContracts: number;
    expiringSoon: number;
    potentialBreaches: number;
    protectedCommission: number;
  }>;
  
  // Admin operations
  getAdminStats(): Promise<{
    totalUsers: number;
    activeSubscriptions: number;
    monthlyRevenue: number;
    churnRate: number;
    overduePayments: number;
  }>;
  getAllUsersWithSubscriptions(): Promise<any[]>;
  getAllPayments(): Promise<any[]>;
  getAllUsers(): Promise<User[]>;
  getAllContracts(): Promise<Contract[]>;
  getAllShowings(): Promise<Showing[]>;
  getAllCommissionProtection(): Promise<CommissionProtection[]>;
  
  // Property operations
  createProperty(property: InsertProperty): Promise<Property>;
  getProperty(id: number): Promise<Property | undefined>;
  getPropertiesByAgent(agentId: string): Promise<Property[]>;
  updateProperty(id: number, updates: Partial<InsertProperty>): Promise<Property>;
  searchProperties(criteria: { address?: string; city?: string; priceMin?: number; priceMax?: number; }): Promise<Property[]>;
  
  // Showing operations
  createShowing(showing: InsertShowing): Promise<Showing>;
  getShowing(id: number): Promise<Showing | undefined>;
  getShowingsByAgent(agentId: string): Promise<ShowingWithDetails[]>;
  getShowingsByClient(clientId: number): Promise<ShowingWithDetails[]>;
  updateShowing(id: number, updates: Partial<InsertShowing>): Promise<Showing>;
  deleteShowing(id: number): Promise<void>;
  getUpcomingShowings(agentId: string): Promise<ShowingWithDetails[]>;
  
  // Location tracking operations
  createLocationTracking(location: InsertLocationTracking): Promise<LocationTracking>;
  getLocationTrackingByShowing(showingId: number): Promise<LocationTrackingWithDetails[]>;
  getLocationTrackingByAgent(agentId: string, startDate: Date, endDate: Date): Promise<LocationTrackingWithDetails[]>;
  detectOffRouteVisits(showingId: number, radiusMeters: number): Promise<LocationTrackingWithDetails[]>;
  
  // Property visit operations
  createPropertyVisit(visit: InsertPropertyVisit): Promise<PropertyVisit>;
  getPropertyVisitsByAgent(agentId: string): Promise<PropertyVisitWithDetails[]>;
  getPropertyVisitsByClient(clientId: number): Promise<PropertyVisitWithDetails[]>;
  getUnauthorizedVisits(agentId: string): Promise<PropertyVisitWithDetails[]>;
  updatePropertyVisit(id: number, updates: Partial<InsertPropertyVisit>): Promise<PropertyVisit>;
  
  // Commission protection operations
  createCommissionProtection(protection: InsertCommissionProtection): Promise<CommissionProtection>;
  getCommissionProtectionByAgent(agentId: string): Promise<CommissionProtectionWithDetails[]>;
  getCommissionProtectionByProperty(propertyId: number): Promise<CommissionProtectionWithDetails[]>;
  updateCommissionProtection(id: number, updates: Partial<InsertCommissionProtection>): Promise<CommissionProtection>;
  getExpiringProtections(agentId: string, daysAhead: number): Promise<CommissionProtectionWithDetails[]>;
  
  // AI Communication & Campaign operations
  createDripCampaign(campaign: InsertDripCampaign): Promise<DripCampaign>;
  getDripCampaignsByAgent(agentId: string): Promise<DripCampaign[]>;
  getDripCampaign(id: number): Promise<DripCampaign | undefined>;
  updateDripCampaign(id: number, updates: Partial<InsertDripCampaign>): Promise<DripCampaign>;
  deleteDripCampaign(id: number): Promise<void>;
  
  createCampaignStep(step: InsertCampaignStep): Promise<CampaignStep>;
  getCampaignSteps(campaignId: number): Promise<CampaignStep[]>;
  updateCampaignStep(id: number, updates: Partial<InsertCampaignStep>): Promise<CampaignStep>;
  deleteCampaignStep(id: number): Promise<void>;
  
  createCampaignEnrollment(enrollment: InsertCampaignEnrollment): Promise<CampaignEnrollment>;
  getCampaignEnrollments(campaignId: number): Promise<CampaignEnrollment[]>;
  getClientEnrollments(clientId: number): Promise<CampaignEnrollment[]>;
  updateCampaignEnrollment(id: number, updates: Partial<InsertCampaignEnrollment>): Promise<CampaignEnrollment>;
  
  createClientCommunication(communication: InsertClientCommunication): Promise<ClientCommunication>;
  getClientCommunications(clientId: number): Promise<ClientCommunication[]>;
  getAgentCommunications(agentId: string): Promise<ClientCommunication[]>;
  updateClientCommunication(id: number, updates: Partial<InsertClientCommunication>): Promise<ClientCommunication>;
  
  createAiConversation(conversation: InsertAiConversation): Promise<AiConversation>;
  getAiConversation(id: number): Promise<AiConversation | undefined>;
  getAiConversationsByAgent(agentId: string): Promise<AiConversation[]>;
  updateAiConversation(id: number, updates: Partial<InsertAiConversation>): Promise<AiConversation>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        ...userData,
        lastLoginAt: new Date(),
      })
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          lastLoginAt: new Date(),
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Admin operations
  async getAllUsers(): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .orderBy(desc(users.createdAt));
  }

  async updateUserRole(userId: string, role: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ 
        role: role as any,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async deactivateUser(userId: string): Promise<void> {
    await db
      .update(users)
      .set({ 
        isActive: false,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));
  }

  async activateUser(userId: string): Promise<void> {
    await db
      .update(users)
      .set({ 
        isActive: true,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));
  }

  async updateUserSubscription(userId: string, subscriptionData: any): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        subscriptionStatus: subscriptionData.status,
        subscriptionPlan: subscriptionData.plan,
        subscriptionStartDate: subscriptionData.startDate ? new Date(subscriptionData.startDate) : undefined,
        subscriptionEndDate: subscriptionData.endDate ? new Date(subscriptionData.endDate) : undefined,
        lastPaymentDate: subscriptionData.lastPaymentDate ? new Date(subscriptionData.lastPaymentDate) : undefined,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async updateUserProfile(userId: string, updates: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  // Client operations
  async createClient(client: InsertClient): Promise<Client> {
    const [newClient] = await db.insert(clients).values(client).returning();
    
    // Create audit log
    await this.createAuditLog({
      userId: client.agentId,
      action: "CREATE",
      entityType: "client",
      entityId: newClient.id.toString(),
      details: { clientName: client.fullName },
    });
    
    return newClient;
  }

  async getClient(id: number): Promise<Client | undefined> {
    const [client] = await db.select().from(clients).where(eq(clients.id, id));
    return client;
  }

  async getClientsByAgent(agentId: string): Promise<Client[]> {
    return await db
      .select()
      .from(clients)
      .where(eq(clients.agentId, agentId))
      .orderBy(desc(clients.createdAt));
  }

  async updateClient(id: number, updates: Partial<InsertClient>): Promise<Client> {
    const [client] = await db
      .update(clients)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(clients.id, id))
      .returning();
    
    if (updates.agentId) {
      await this.createAuditLog({
        userId: updates.agentId,
        action: "UPDATE",
        entityType: "client",
        entityId: id.toString(),
        details: updates,
      });
    }
    
    return client;
  }

  async deleteClient(id: number): Promise<void> {
    await db.delete(clients).where(eq(clients.id, id));
  }

  // Contract operations
  async createContract(contract: InsertContract): Promise<Contract> {
    const [newContract] = await db.insert(contracts).values(contract).returning();
    
    // Create audit log
    await this.createAuditLog({
      userId: contract.agentId,
      action: "CREATE",
      entityType: "contract",
      entityId: newContract.id.toString(),
      details: { 
        type: contract.representationType,
        startDate: contract.startDate,
        endDate: contract.endDate,
      },
    });
    
    return newContract;
  }

  async getContract(id: number): Promise<Contract | undefined> {
    const [contract] = await db.select().from(contracts).where(eq(contracts.id, id));
    return contract;
  }

  async getContractsByAgent(agentId: string): Promise<ContractWithDetails[]> {
    // First, get all contracts with client and agent details
    const contractsWithDetails = await db
      .select({
        id: contracts.id,
        clientId: contracts.clientId,
        agentId: contracts.agentId,
        representationType: contracts.representationType,
        propertyAddress: contracts.propertyAddress,
        startDate: contracts.startDate,
        endDate: contracts.endDate,
        contractFileUrl: contracts.contractFileUrl,
        contractFileName: contracts.contractFileName,
        status: contracts.status,
        createdAt: contracts.createdAt,
        updatedAt: contracts.updatedAt,
        client: clients,
        agent: users,
      })
      .from(contracts)
      .leftJoin(clients, eq(contracts.clientId, clients.id))
      .leftJoin(users, eq(contracts.agentId, users.id))
      .where(eq(contracts.agentId, agentId))
      .orderBy(desc(contracts.createdAt));

    if (contractsWithDetails.length === 0) {
      return [];
    }

    const contractIds = contractsWithDetails.map(c => c.id);

    // Get all alerts for these contracts in one query
    const allAlerts = await db
      .select()
      .from(alerts)
      .where(inArray(alerts.contractId, contractIds));

    // Get all signers for these contracts in one query
    const allSigners = await db
      .select()
      .from(contractSigners)
      .where(inArray(contractSigners.contractId, contractIds))
      .orderBy(contractSigners.createdAt);

    // Group alerts and signers by contract ID
    const alertsByContract = new Map<number, typeof allAlerts>();
    const signersByContract = new Map<number, typeof allSigners>();

    allAlerts.forEach(alert => {
      if (!alertsByContract.has(alert.contractId!)) {
        alertsByContract.set(alert.contractId!, []);
      }
      alertsByContract.get(alert.contractId!)!.push(alert);
    });

    allSigners.forEach(signer => {
      if (!signersByContract.has(signer.contractId)) {
        signersByContract.set(signer.contractId, []);
      }
      signersByContract.get(signer.contractId)!.push(signer);
    });

    // Build the final result
    const result: ContractWithDetails[] = [];
    for (const contract of contractsWithDetails) {
      if (!contract.client || !contract.agent) continue;
      
      result.push({
        id: contract.id,
        clientId: contract.clientId,
        agentId: contract.agentId,
        representationType: contract.representationType,
        startDate: contract.startDate,
        endDate: contract.endDate,
        contractFileUrl: contract.contractFileUrl,
        contractFileName: contract.contractFileName,
        status: contract.status,
        createdAt: contract.createdAt,
        updatedAt: contract.updatedAt,
        propertyAddress: contract.propertyAddress,
        client: contract.client,
        agent: contract.agent,
        alerts: alertsByContract.get(contract.id) || [],
        signers: signersByContract.get(contract.id) || []
      });
    }

    return result;
  }

  async getContractsByClient(clientId: number): Promise<Contract[]> {
    return await db
      .select()
      .from(contracts)
      .where(eq(contracts.clientId, clientId))
      .orderBy(desc(contracts.createdAt));
  }

  async updateContract(id: number, updates: Partial<InsertContract>): Promise<Contract> {
    const [contract] = await db
      .update(contracts)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(contracts.id, id))
      .returning();
    
    if (updates.agentId) {
      await this.createAuditLog({
        userId: updates.agentId,
        action: "UPDATE",
        entityType: "contract",
        entityId: id.toString(),
        details: updates,
      });
    }
    
    return contract;
  }

  async deleteContract(id: number): Promise<void> {
    await db.delete(contracts).where(eq(contracts.id, id));
  }

  async getExpiringContracts(agentId: string, daysAhead: number): Promise<ContractWithDetails[]> {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + daysAhead);
    
    const contractsWithDetails = await db
      .select({
        id: contracts.id,
        clientId: contracts.clientId,
        agentId: contracts.agentId,
        representationType: contracts.representationType,
        startDate: contracts.startDate,
        endDate: contracts.endDate,
        contractFileUrl: contracts.contractFileUrl,
        contractFileName: contracts.contractFileName,
        status: contracts.status,
        createdAt: contracts.createdAt,
        updatedAt: contracts.updatedAt,
        client: clients,
        agent: users,
      })
      .from(contracts)
      .leftJoin(clients, eq(contracts.clientId, clients.id))
      .leftJoin(users, eq(contracts.agentId, users.id))
      .where(
        and(
          eq(contracts.agentId, agentId),
          eq(contracts.status, "active"),
          lte(contracts.endDate, targetDate.toISOString().split('T')[0])
        )
      )
      .orderBy(asc(contracts.endDate));

    // Get alerts for each contract separately
    const result: ContractWithDetails[] = [];
    for (const contract of contractsWithDetails) {
      const contractAlerts = await db
        .select()
        .from(alerts)
        .where(eq(alerts.contractId, contract.id));
      
      result.push({
        ...contract,
        alerts: contractAlerts,
      });
    }

    return result;
  }

  // Alert operations
  async createAlert(alert: InsertAlert): Promise<Alert> {
    const [newAlert] = await db.insert(alerts).values(alert).returning();
    return newAlert;
  }

  async getAlert(id: number): Promise<Alert | undefined> {
    const [alert] = await db.select().from(alerts).where(eq(alerts.id, id));
    return alert;
  }

  async getAlertsByAgent(agentId: string): Promise<AlertWithDetails[]> {
    return await db
      .select({
        id: alerts.id,
        agentId: alerts.agentId,
        contractId: alerts.contractId,
        clientId: alerts.clientId,
        type: alerts.type,
        title: alerts.title,
        description: alerts.description,
        severity: alerts.severity,
        isRead: alerts.isRead,
        createdAt: alerts.createdAt,
        contract: contracts,
        client: clients,
        agent: users,
      })
      .from(alerts)
      .leftJoin(contracts, eq(alerts.contractId, contracts.id))
      .leftJoin(clients, eq(alerts.clientId, clients.id))
      .leftJoin(users, eq(alerts.agentId, users.id))
      .where(eq(alerts.agentId, agentId))
      .orderBy(desc(alerts.createdAt)) as AlertWithDetails[];
  }

  async markAlertAsRead(id: number): Promise<void> {
    await db.update(alerts).set({ isRead: true }).where(eq(alerts.id, id));
  }

  async getUnreadAlertsCount(agentId: string): Promise<number> {
    const [result] = await db
      .select({ count: count() })
      .from(alerts)
      .where(and(eq(alerts.agentId, agentId), eq(alerts.isRead, false)));
    return result.count;
  }

  // Audit log operations
  async createAuditLog(auditLog: InsertAuditLog): Promise<AuditLog> {
    const [newLog] = await db.insert(auditLogs).values(auditLog).returning();
    return newLog;
  }

  async getAuditLogsByUser(userId: string): Promise<AuditLog[]> {
    return await db
      .select()
      .from(auditLogs)
      .where(eq(auditLogs.userId, userId))
      .orderBy(desc(auditLogs.timestamp));
  }

  // Dashboard statistics
  async getDashboardStats(agentId: string): Promise<{
    activeContracts: number;
    expiringSoon: number;
    potentialBreaches: number;
    protectedCommission: number;
  }> {
    // Active contracts
    const [activeResult] = await db
      .select({ count: count() })
      .from(contracts)
      .where(and(eq(contracts.agentId, agentId), eq(contracts.status, "active")));

    // Expiring soon (next 30 days)
    const expiringDate = new Date();
    expiringDate.setDate(expiringDate.getDate() + 30);
    const [expiring] = await db
      .select({ count: count() })
      .from(contracts)
      .where(
        and(
          eq(contracts.agentId, agentId),
          eq(contracts.status, "active"),
          lte(contracts.endDate, expiringDate.toISOString().split('T')[0])
        )
      );

    // Potential breaches (high severity alerts)
    const [breaches] = await db
      .select({ count: count() })
      .from(alerts)
      .where(
        and(
          eq(alerts.agentId, agentId),
          eq(alerts.type, "breach"),
          eq(alerts.isRead, false)
        )
      );

    return {
      activeContracts: activeResult.count,
      expiringSoon: expiring.count,
      potentialBreaches: breaches.count,
      protectedCommission: activeResult.count * 2000, // Estimated average commission
    };
  }

  // Contract Signer operations
  async createContractSigner(signer: InsertContractSigner): Promise<ContractSigner> {
    const [newSigner] = await db.insert(contractSigners).values(signer).returning();
    return newSigner;
  }

  async getContractSigners(contractId: number): Promise<ContractSigner[]> {
    return await db
      .select()
      .from(contractSigners)
      .where(eq(contractSigners.contractId, contractId))
      .orderBy(contractSigners.createdAt);
  }

  async updateContractSigner(id: number, updates: Partial<InsertContractSigner>): Promise<ContractSigner> {
    const [signer] = await db
      .update(contractSigners)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(contractSigners.id, id))
      .returning();
    return signer;
  }

  async deleteContractSigner(id: number): Promise<void> {
    await db.delete(contractSigners).where(eq(contractSigners.id, id));
  }

  async markSignerAsSigned(id: number): Promise<void> {
    await db
      .update(contractSigners)
      .set({ 
        signatureStatus: "signed", 
        signedDate: new Date(),
        updatedAt: new Date()
      })
      .where(eq(contractSigners.id, id));
  }

  // Admin operations
  async getAdminStats(): Promise<{
    totalUsers: number;
    activeSubscriptions: number;
    monthlyRevenue: number;
    churnRate: number;
    overduePayments: number;
  }> {
    try {
      const totalUsersResult = await db.select().from(users);
      const totalUsers = totalUsersResult.length;

      const activeSubscriptions = totalUsersResult.filter(u => u.subscriptionStatus === 'active').length;
      
      // Calculate monthly revenue from recent payments
      const monthlyRevenue = 29999; // Mock revenue for demo
      const churnRate = 2.5; // Mock churn rate for demo
      const overduePayments = totalUsersResult.filter(u => u.subscriptionStatus === 'expired').length;

      return {
        totalUsers,
        activeSubscriptions,
        monthlyRevenue,
        churnRate,
        overduePayments
      };
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      return {
        totalUsers: 0,
        activeSubscriptions: 0,
        monthlyRevenue: 0,
        churnRate: 0,
        overduePayments: 0
      };
    }
  }

  async getAllUsersWithSubscriptions(): Promise<any[]> {
    try {
      const result = await db.select().from(users);
      return result.map(user => ({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        subscriptionStatus: user.subscriptionStatus,
        subscriptionPlan: user.subscriptionPlan,
        subscriptionStartDate: user.subscriptionStartDate,
        subscriptionEndDate: user.subscriptionEndDate,
        lastPaymentDate: user.lastPaymentDate,
        createdAt: user.createdAt
      }));
    } catch (error) {
      console.error("Error fetching users with subscriptions:", error);
      return [];
    }
  }

  async getAllPayments(): Promise<any[]> {
    try {
      // Mock payment data for demo
      return [
        {
          id: 1,
          userEmail: "agent@example.com",
          amount: "99.00",
          status: "succeeded",
          paymentMethod: "card",
          createdAt: new Date()
        },
        {
          id: 2,
          userEmail: "broker@example.com",
          amount: "199.00",
          status: "succeeded",
          paymentMethod: "card",
          createdAt: new Date()
        }
      ];
    } catch (error) {
      console.error("Error fetching payments:", error);
      return [];
    }
  }



  // Property operations
  async createProperty(property: InsertProperty): Promise<Property> {
    const [newProperty] = await db.insert(properties).values(property).returning();
    return newProperty;
  }

  async getProperty(id: number): Promise<Property | undefined> {
    const [property] = await db.select().from(properties).where(eq(properties.id, id));
    return property;
  }

  async getPropertiesByAgent(agentId: string): Promise<Property[]> {
    return await db.select().from(properties);
  }

  async updateProperty(id: number, updates: Partial<InsertProperty>): Promise<Property> {
    const [property] = await db
      .update(properties)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(properties.id, id))
      .returning();
    return property;
  }

  async searchProperties(criteria: { address?: string; city?: string; priceMin?: number; priceMax?: number; }): Promise<Property[]> {
    let query = db.select().from(properties);
    
    if (criteria.city) {
      query = query.where(eq(properties.city, criteria.city));
    }
    
    return await query;
  }

  // Showing operations
  async createShowing(showing: InsertShowing): Promise<Showing> {
    const [newShowing] = await db.insert(showings).values(showing).returning();
    return newShowing;
  }

  async getShowing(id: number): Promise<Showing | undefined> {
    const [showing] = await db.select().from(showings).where(eq(showings.id, id));
    return showing;
  }

  async getShowingsByAgent(agentId: string): Promise<ShowingWithDetails[]> {
    const result = await db
      .select()
      .from(showings)
      .leftJoin(users, eq(showings.agentId, users.id))
      .leftJoin(clients, eq(showings.clientId, clients.id))
      .leftJoin(properties, eq(showings.propertyId, properties.id))
      .where(eq(showings.agentId, agentId))
      .orderBy(desc(showings.scheduledDate));

    return result.map(row => ({
      ...row.showings,
      agent: row.users!,
      client: row.clients!,
      property: row.properties!,
      locationTracking: []
    }));
  }

  async getShowingsByClient(clientId: number): Promise<ShowingWithDetails[]> {
    const result = await db
      .select()
      .from(showings)
      .leftJoin(users, eq(showings.agentId, users.id))
      .leftJoin(clients, eq(showings.clientId, clients.id))
      .leftJoin(properties, eq(showings.propertyId, properties.id))
      .where(eq(showings.clientId, clientId))
      .orderBy(desc(showings.scheduledDate));

    return result.map(row => ({
      ...row.showings,
      agent: row.users!,
      client: row.clients!,
      property: row.properties!,
      locationTracking: []
    }));
  }

  async updateShowing(id: number, updates: Partial<InsertShowing>): Promise<Showing> {
    const [showing] = await db
      .update(showings)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(showings.id, id))
      .returning();
    return showing;
  }

  async deleteShowing(id: number): Promise<void> {
    await db.delete(showings).where(eq(showings.id, id));
  }

  async getUpcomingShowings(agentId: string): Promise<ShowingWithDetails[]> {
    const today = new Date();
    const result = await db
      .select()
      .from(showings)
      .leftJoin(users, eq(showings.agentId, users.id))
      .leftJoin(clients, eq(showings.clientId, clients.id))
      .leftJoin(properties, eq(showings.propertyId, properties.id))
      .where(and(
        eq(showings.agentId, agentId),
        gte(showings.scheduledDate, today)
      ))
      .orderBy(asc(showings.scheduledDate));

    return result.map(row => ({
      ...row.showings,
      agent: row.users!,
      client: row.clients!,
      property: row.properties!,
      locationTracking: []
    }));
  }

  // Location tracking operations
  async createLocationTracking(location: InsertLocationTracking): Promise<LocationTracking> {
    const [newLocation] = await db.insert(locationTracking).values(location).returning();
    return newLocation;
  }

  async getLocationTrackingByShowing(showingId: number): Promise<LocationTrackingWithDetails[]> {
    const result = await db
      .select()
      .from(locationTracking)
      .leftJoin(users, eq(locationTracking.agentId, users.id))
      .leftJoin(clients, eq(locationTracking.clientId, clients.id))
      .leftJoin(showings, eq(locationTracking.showingId, showings.id))
      .leftJoin(properties, eq(locationTracking.propertyId, properties.id))
      .where(eq(locationTracking.showingId, showingId))
      .orderBy(asc(locationTracking.timestamp));

    return result.map(row => ({
      ...row.location_tracking,
      agent: row.users!,
      client: row.clients!,
      showing: row.showings!,
      property: row.properties || undefined
    }));
  }

  async getLocationTrackingByAgent(agentId: string, startDate: Date, endDate: Date): Promise<LocationTrackingWithDetails[]> {
    const result = await db
      .select()
      .from(locationTracking)
      .leftJoin(users, eq(locationTracking.agentId, users.id))
      .leftJoin(clients, eq(locationTracking.clientId, clients.id))
      .leftJoin(showings, eq(locationTracking.showingId, showings.id))
      .leftJoin(properties, eq(locationTracking.propertyId, properties.id))
      .where(and(
        eq(locationTracking.agentId, agentId),
        gte(locationTracking.timestamp, startDate),
        lte(locationTracking.timestamp, endDate)
      ))
      .orderBy(asc(locationTracking.timestamp));

    return result.map(row => ({
      ...row.location_tracking,
      agent: row.users!,
      client: row.clients!,
      showing: row.showings!,
      property: row.properties || undefined
    }));
  }

  async detectOffRouteVisits(showingId: number, radiusMeters: number): Promise<LocationTrackingWithDetails[]> {
    const result = await db
      .select()
      .from(locationTracking)
      .leftJoin(users, eq(locationTracking.agentId, users.id))
      .leftJoin(clients, eq(locationTracking.clientId, clients.id))
      .leftJoin(showings, eq(locationTracking.showingId, showings.id))
      .leftJoin(properties, eq(locationTracking.propertyId, properties.id))
      .where(and(
        eq(locationTracking.showingId, showingId),
        sql`${locationTracking.distanceFromScheduled} > ${radiusMeters}`
      ));

    return result.map(row => ({
      ...row.location_tracking,
      agent: row.users!,
      client: row.clients!,
      showing: row.showings!,
      property: row.properties || undefined
    }));
  }

  // Property visit operations
  async createPropertyVisit(visit: InsertPropertyVisit): Promise<PropertyVisit> {
    const [newVisit] = await db.insert(propertyVisits).values(visit).returning();
    return newVisit;
  }

  async getPropertyVisitsByAgent(agentId: string): Promise<PropertyVisitWithDetails[]> {
    const result = await db
      .select()
      .from(propertyVisits)
      .leftJoin(users, eq(propertyVisits.agentId, users.id))
      .leftJoin(clients, eq(propertyVisits.clientId, clients.id))
      .leftJoin(properties, eq(propertyVisits.propertyId, properties.id))
      .leftJoin(showings, eq(propertyVisits.showingId, showings.id))
      .where(eq(propertyVisits.agentId, agentId))
      .orderBy(desc(propertyVisits.visitDate));

    return result.map(row => ({
      ...row.property_visits,
      agent: row.users!,
      client: row.clients!,
      property: row.properties!,
      showing: row.showings || undefined
    }));
  }

  async getPropertyVisitsByClient(clientId: number): Promise<PropertyVisitWithDetails[]> {
    const result = await db
      .select()
      .from(propertyVisits)
      .leftJoin(users, eq(propertyVisits.agentId, users.id))
      .leftJoin(clients, eq(propertyVisits.clientId, clients.id))
      .leftJoin(properties, eq(propertyVisits.propertyId, properties.id))
      .leftJoin(showings, eq(propertyVisits.showingId, showings.id))
      .where(eq(propertyVisits.clientId, clientId))
      .orderBy(desc(propertyVisits.visitDate));

    return result.map(row => ({
      ...row.property_visits,
      agent: row.users!,
      client: row.clients!,
      property: row.properties!,
      showing: row.showings || undefined
    }));
  }

  async getUnauthorizedVisits(agentId: string): Promise<PropertyVisitWithDetails[]> {
    const result = await db
      .select()
      .from(propertyVisits)
      .leftJoin(users, eq(propertyVisits.agentId, users.id))
      .leftJoin(clients, eq(propertyVisits.clientId, clients.id))
      .leftJoin(properties, eq(propertyVisits.propertyId, properties.id))
      .leftJoin(showings, eq(propertyVisits.showingId, showings.id))
      .where(and(
        eq(propertyVisits.agentId, agentId),
        eq(propertyVisits.agentPresent, false),
        eq(propertyVisits.wasScheduled, false)
      ))
      .orderBy(desc(propertyVisits.visitDate));

    return result.map(row => ({
      ...row.property_visits,
      agent: row.users!,
      client: row.clients!,
      property: row.properties!,
      showing: row.showings || undefined
    }));
  }

  async updatePropertyVisit(id: number, updates: Partial<InsertPropertyVisit>): Promise<PropertyVisit> {
    const [visit] = await db
      .update(propertyVisits)
      .set(updates)
      .where(eq(propertyVisits.id, id))
      .returning();
    return visit;
  }

  // Commission protection operations
  async createCommissionProtection(protection: InsertCommissionProtection): Promise<CommissionProtection> {
    const [newProtection] = await db.insert(commissionProtection).values(protection).returning();
    return newProtection;
  }

  async getCommissionProtectionByAgent(agentId: string): Promise<CommissionProtectionWithDetails[]> {
    const result = await db
      .select()
      .from(commissionProtection)
      .leftJoin(users, eq(commissionProtection.agentId, users.id))
      .leftJoin(clients, eq(commissionProtection.clientId, clients.id))
      .leftJoin(properties, eq(commissionProtection.propertyId, properties.id))
      .where(eq(commissionProtection.agentId, agentId))
      .orderBy(desc(commissionProtection.protectionDate));

    return result.map(row => ({
      ...row.commission_protection,
      agent: row.users!,
      client: row.clients!,
      property: row.properties!
    }));
  }

  async getCommissionProtectionByProperty(propertyId: number): Promise<CommissionProtectionWithDetails[]> {
    const result = await db
      .select()
      .from(commissionProtection)
      .leftJoin(users, eq(commissionProtection.agentId, users.id))
      .leftJoin(clients, eq(commissionProtection.clientId, clients.id))
      .leftJoin(properties, eq(commissionProtection.propertyId, properties.id))
      .where(eq(commissionProtection.propertyId, propertyId))
      .orderBy(desc(commissionProtection.protectionDate));

    return result.map(row => ({
      ...row.commission_protection,
      agent: row.users!,
      client: row.clients!,
      property: row.properties!
    }));
  }

  async updateCommissionProtection(id: number, updates: Partial<InsertCommissionProtection>): Promise<CommissionProtection> {
    const [protection] = await db
      .update(commissionProtection)
      .set(updates)
      .where(eq(commissionProtection.id, id))
      .returning();
    return protection;
  }

  async getExpiringProtections(agentId: string, daysAhead: number): Promise<CommissionProtectionWithDetails[]> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);

    const result = await db
      .select()
      .from(commissionProtection)
      .leftJoin(users, eq(commissionProtection.agentId, users.id))
      .leftJoin(clients, eq(commissionProtection.clientId, clients.id))
      .leftJoin(properties, eq(commissionProtection.propertyId, properties.id))
      .where(and(
        eq(commissionProtection.agentId, agentId),
        eq(commissionProtection.status, "active"),
        lte(commissionProtection.expirationDate, futureDate)
      ))
      .orderBy(asc(commissionProtection.expirationDate));

    return result.map(row => ({
      ...row.commission_protection,
      agent: row.users!,
      client: row.clients!,
      property: row.properties!
    }));
  }

  // AI Communication & Campaign operations
  async createDripCampaign(campaign: InsertDripCampaign): Promise<DripCampaign> {
    const [newCampaign] = await db.insert(dripCampaigns).values(campaign).returning();
    return newCampaign;
  }

  async getDripCampaignsByAgent(agentId: string): Promise<DripCampaign[]> {
    return await db.select().from(dripCampaigns).where(eq(dripCampaigns.agentId, agentId)).orderBy(desc(dripCampaigns.createdAt));
  }

  async getDripCampaign(id: number): Promise<DripCampaign | undefined> {
    const [campaign] = await db.select().from(dripCampaigns).where(eq(dripCampaigns.id, id));
    return campaign;
  }

  async updateDripCampaign(id: number, updates: Partial<InsertDripCampaign>): Promise<DripCampaign> {
    const [campaign] = await db.update(dripCampaigns).set(updates).where(eq(dripCampaigns.id, id)).returning();
    return campaign;
  }

  async deleteDripCampaign(id: number): Promise<void> {
    await db.delete(dripCampaigns).where(eq(dripCampaigns.id, id));
  }

  async createCampaignStep(step: InsertCampaignStep): Promise<CampaignStep> {
    const [newStep] = await db.insert(campaignSteps).values(step).returning();
    return newStep;
  }

  async getCampaignSteps(campaignId: number): Promise<CampaignStep[]> {
    return await db.select().from(campaignSteps).where(eq(campaignSteps.campaignId, campaignId)).orderBy(asc(campaignSteps.stepNumber));
  }

  async updateCampaignStep(id: number, updates: Partial<InsertCampaignStep>): Promise<CampaignStep> {
    const [step] = await db.update(campaignSteps).set(updates).where(eq(campaignSteps.id, id)).returning();
    return step;
  }

  async deleteCampaignStep(id: number): Promise<void> {
    await db.delete(campaignSteps).where(eq(campaignSteps.id, id));
  }

  async createCampaignEnrollment(enrollment: InsertCampaignEnrollment): Promise<CampaignEnrollment> {
    const [newEnrollment] = await db.insert(campaignEnrollments).values(enrollment).returning();
    return newEnrollment;
  }

  async getCampaignEnrollments(campaignId: number): Promise<CampaignEnrollment[]> {
    return await db.select().from(campaignEnrollments).where(eq(campaignEnrollments.campaignId, campaignId)).orderBy(desc(campaignEnrollments.enrolledDate));
  }

  async getClientEnrollments(clientId: number): Promise<CampaignEnrollment[]> {
    return await db.select().from(campaignEnrollments).where(eq(campaignEnrollments.clientId, clientId)).orderBy(desc(campaignEnrollments.enrolledDate));
  }

  async updateCampaignEnrollment(id: number, updates: Partial<InsertCampaignEnrollment>): Promise<CampaignEnrollment> {
    const [enrollment] = await db.update(campaignEnrollments).set(updates).where(eq(campaignEnrollments.id, id)).returning();
    return enrollment;
  }

  async createClientCommunication(communication: InsertClientCommunication): Promise<ClientCommunication> {
    const [newCommunication] = await db.insert(clientCommunications).values(communication).returning();
    return newCommunication;
  }

  async getClientCommunications(clientId: number): Promise<ClientCommunication[]> {
    return await db.select().from(clientCommunications).where(eq(clientCommunications.clientId, clientId)).orderBy(desc(clientCommunications.createdAt));
  }

  async getAgentCommunications(agentId: string): Promise<ClientCommunication[]> {
    return await db.select().from(clientCommunications).where(eq(clientCommunications.agentId, agentId)).orderBy(desc(clientCommunications.createdAt));
  }

  async updateClientCommunication(id: number, updates: Partial<InsertClientCommunication>): Promise<ClientCommunication> {
    const [communication] = await db.update(clientCommunications).set(updates).where(eq(clientCommunications.id, id)).returning();
    return communication;
  }

  async createAiConversation(conversation: InsertAiConversation): Promise<AiConversation> {
    const [newConversation] = await db.insert(aiConversations).values(conversation).returning();
    return newConversation;
  }

  async getAiConversation(id: number): Promise<AiConversation | undefined> {
    const [conversation] = await db.select().from(aiConversations).where(eq(aiConversations.id, id));
    return conversation;
  }

  async getAiConversationsByAgent(agentId: string): Promise<AiConversation[]> {
    return await db.select().from(aiConversations).where(eq(aiConversations.agentId, agentId)).orderBy(desc(aiConversations.lastMessageAt));
  }

  async updateAiConversation(id: number, updates: Partial<InsertAiConversation>): Promise<AiConversation> {
    const [conversation] = await db.update(aiConversations).set(updates).where(eq(aiConversations.id, id)).returning();
    return conversation;
  }

  // Notification reminders storage methods
  async createNotificationReminder(data: InsertNotificationReminder): Promise<NotificationReminder> {
    const [reminder] = await db.insert(notificationReminders).values(data).returning();
    return reminder;
  }

  async getNotificationRemindersByShowing(showingId: number): Promise<NotificationReminder[]> {
    return await db.select().from(notificationReminders).where(eq(notificationReminders.showingId, showingId));
  }

  async getPendingNotificationReminders(): Promise<NotificationReminder[]> {
    const now = new Date();
    return await db.select().from(notificationReminders)
      .where(and(
        eq(notificationReminders.status, "pending"),
        lt(notificationReminders.scheduledFor, now)
      ));
  }

  async updateNotificationReminder(id: number, updates: Partial<InsertNotificationReminder>): Promise<NotificationReminder> {
    const [reminder] = await db.update(notificationReminders).set(updates).where(eq(notificationReminders.id, id)).returning();
    return reminder;
  }

  async cancelShowingReminders(showingId: number): Promise<void> {
    await db.update(notificationReminders)
      .set({ status: "cancelled" })
      .where(and(
        eq(notificationReminders.showingId, showingId),
        eq(notificationReminders.status, "pending")
      ));
  }

  // Calendar integration storage methods
  async createCalendarIntegration(data: InsertCalendarIntegration): Promise<CalendarIntegration> {
    const [integration] = await db.insert(calendarIntegrations).values(data).returning();
    return integration;
  }

  async getCalendarIntegrationsByAgent(agentId: string): Promise<CalendarIntegration[]> {
    return await db.select().from(calendarIntegrations).where(eq(calendarIntegrations.agentId, agentId));
  }

  async getActiveCalendarIntegrations(agentId: string): Promise<CalendarIntegration[]> {
    return await db.select().from(calendarIntegrations)
      .where(and(
        eq(calendarIntegrations.agentId, agentId),
        eq(calendarIntegrations.isActive, true)
      ));
  }

  async updateCalendarIntegration(id: number, updates: Partial<InsertCalendarIntegration>): Promise<CalendarIntegration> {
    const [integration] = await db.update(calendarIntegrations).set(updates).where(eq(calendarIntegrations.id, id)).returning();
    return integration;
  }

  async deleteCalendarIntegration(id: number): Promise<void> {
    await db.delete(calendarIntegrations).where(eq(calendarIntegrations.id, id));
  }

  // Calendar events storage methods
  async createCalendarEvent(data: InsertCalendarEvent): Promise<CalendarEvent> {
    const [event] = await db.insert(calendarEvents).values(data).returning();
    return event;
  }

  async getCalendarEventsByShowing(showingId: number): Promise<CalendarEvent[]> {
    return await db.select().from(calendarEvents).where(eq(calendarEvents.showingId, showingId));
  }

  async getCalendarEventsByAgent(agentId: string): Promise<CalendarEvent[]> {
    return await db.select().from(calendarEvents).where(eq(calendarEvents.agentId, agentId));
  }

  async updateCalendarEvent(id: number, updates: Partial<InsertCalendarEvent>): Promise<CalendarEvent> {
    const [event] = await db.update(calendarEvents).set(updates).where(eq(calendarEvents.id, id)).returning();
    return event;
  }

  async deleteCalendarEvent(id: number): Promise<void> {
    await db.delete(calendarEvents).where(eq(calendarEvents.id, id));
  }

  async deleteCalendarEventsByShowing(showingId: number): Promise<void> {
    await db.delete(calendarEvents).where(eq(calendarEvents.showingId, showingId));
  }

  // ShowingTime Integration Methods
  async createOrUpdateShowingFromShowingTime(showingTimeData: any, agentId: string): Promise<any> {
    try {
      // First, try to find or create the property
      let property = await this.findPropertyByAddress(showingTimeData.propertyAddress);
      if (!property) {
        property = await this.createProperty({
          agentId,
          address: showingTimeData.propertyAddress,
          propertyType: "residential",
          status: "active"
        });
      }

      // Try to find or create the client
      let client = null;
      if (showingTimeData.clientEmail || showingTimeData.clientPhone) {
        client = await this.findClientByEmailOrPhone(showingTimeData.clientEmail, showingTimeData.clientPhone, agentId);
        if (!client && showingTimeData.clientName) {
          client = await this.createClient({
            agentId,
            fullName: showingTimeData.clientName,
            email: showingTimeData.clientEmail || null,
            phone: showingTimeData.clientPhone || null,
            isConverted: false
          });
        }
      }

      // Check if showing already exists by ShowingTime ID
      const existingShowing = await this.findShowingByExternalId(showingTimeData.id);
      
      const showingData = {
        agentId,
        clientId: client?.id || null,
        propertyId: property.id,
        scheduledDate: new Date(showingTimeData.scheduledDateTime),
        showingType: showingTimeData.appointmentType || "showing",
        status: this.mapShowingTimeStatus(showingTimeData.status),
        agentNotes: showingTimeData.instructions || null,
        commissionProtected: true
      };

      if (existingShowing) {
        return await this.updateShowing(existingShowing.id, showingData);
      } else {
        return await this.createShowing(showingData);
      }
    } catch (error) {
      console.error("Error creating/updating showing from ShowingTime:", error);
      throw error;
    }
  }

  async findPropertyByAddress(address: string): Promise<any> {
    try {
      const [property] = await db
        .select()
        .from(properties)
        .where(eq(properties.address, address))
        .limit(1);

      return property || null;
    } catch (error) {
      console.error("Error finding property by address:", error);
      return null;
    }
  }

  async findClientByEmailOrPhone(email: string | null, phone: string | null, agentId: string): Promise<any> {
    try {
      if (!email && !phone) return null;

      let query = db.select().from(clients).where(eq(clients.agentId, agentId));
      
      if (email && phone) {
        query = query.where(or(eq(clients.email, email), eq(clients.phone, phone)));
      } else if (email) {
        query = query.where(eq(clients.email, email));
      } else if (phone) {
        query = query.where(eq(clients.phone, phone));
      }

      const [client] = await query.limit(1);
      return client || null;
    } catch (error) {
      console.error("Error finding client by email or phone:", error);
      return null;
    }
  }

  async findShowingByExternalId(externalId: string): Promise<any> {
    try {
      // For now, we'll check by a combination of factors since we don't have externalId field yet
      // This can be enhanced once we add the externalId field to the schema
      return null;
    } catch (error) {
      console.error("Error finding showing by external ID:", error);
      return null;
    }
  }

  private mapShowingTimeStatus(status: string): string {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return 'scheduled';
      case 'cancelled':
        return 'cancelled';
      case 'pending':
        return 'scheduled';
      default:
        return 'scheduled';
    }
  }

  async getShowingTimeIntegrationStats(agentId: string): Promise<{
    totalImported: number;
    lastSyncDate: Date | null;
    pendingSync: number;
  }> {
    try {
      // For now, return basic stats - this can be enhanced with actual tracking
      const allShowings = await this.getShowingsByAgent(agentId);
      
      return {
        totalImported: allShowings.length,
        lastSyncDate: allShowings.length > 0 ? new Date() : null,
        pendingSync: 0
      };
    } catch (error) {
      console.error("Error getting ShowingTime integration stats:", error);
      return {
        totalImported: 0,
        lastSyncDate: null,
        pendingSync: 0
      };
    }
  }

  // Admin methods for enhanced admin interface
  async getAllUsers(): Promise<User[]> {
    try {
      const usersData = await db.select().from(users);
      return usersData;
    } catch (error) {
      console.error("Error fetching all users:", error);
      return [];
    }
  }

  async getAllContracts(): Promise<Contract[]> {
    try {
      const contractsData = await db.select().from(contracts);
      return contractsData;
    } catch (error) {
      console.error("Error fetching all contracts:", error);
      return [];
    }
  }

  async getAllShowings(): Promise<Showing[]> {
    try {
      const showingsData = await db.select().from(showings);
      return showingsData;
    } catch (error) {
      console.error("Error fetching all showings:", error);
      return [];
    }
  }

  async getAllCommissionProtection(): Promise<CommissionProtection[]> {
    try {
      const protectionRecords = await db.select().from(commissionProtection);
      return protectionRecords;
    } catch (error) {
      console.error("Error fetching all commission protection records:", error);
      return [];
    }
  }

  // Contract reminder methods
  async createContractReminder(reminder: InsertContractReminder): Promise<ContractReminder> {
    try {
      const [newReminder] = await db.insert(contractReminders).values(reminder).returning();
      return newReminder;
    } catch (error) {
      console.error("Error creating contract reminder:", error);
      throw error;
    }
  }

  async getContractReminders(agentId: string): Promise<ContractReminder[]> {
    try {
      const reminders = await db
        .select()
        .from(contractReminders)
        .where(eq(contractReminders.agentId, agentId))
        .orderBy(desc(contractReminders.scheduledDate));
      return reminders;
    } catch (error) {
      console.error("Error fetching contract reminders:", error);
      return [];
    }
  }

  async getPendingReminders(): Promise<ContractReminder[]> {
    try {
      const now = new Date();
      const reminders = await db
        .select()
        .from(contractReminders)
        .where(
          and(
            eq(contractReminders.status, "pending"),
            lte(contractReminders.scheduledDate, now)
          )
        );
      return reminders;
    } catch (error) {
      console.error("Error fetching pending reminders:", error);
      return [];
    }
  }

  async updateReminderStatus(reminderId: number, status: string, sentDate?: Date): Promise<void> {
    try {
      const updateData: any = { status, updatedAt: new Date() };
      if (sentDate) {
        updateData.sentDate = sentDate;
      }
      
      await db
        .update(contractReminders)
        .set(updateData)
        .where(eq(contractReminders.id, reminderId));
    } catch (error) {
      console.error("Error updating reminder status:", error);
      throw error;
    }
  }

  async scheduleRecurringReminder(reminderId: number, nextSendDate: Date): Promise<void> {
    try {
      await db
        .update(contractReminders)
        .set({
          nextSendDate,
          lastSentDate: new Date(),
          status: "pending",
          updatedAt: new Date()
        })
        .where(eq(contractReminders.id, reminderId));
    } catch (error) {
      console.error("Error scheduling recurring reminder:", error);
      throw error;
    }
  }

  async getActiveContractsForReminders(): Promise<Contract[]> {
    try {
      const activeContracts = await db
        .select()
        .from(contracts)
        .where(eq(contracts.status, "active"));
      return activeContracts;
    } catch (error) {
      console.error("Error fetching active contracts for reminders:", error);
      return [];
    }
  }

  async getExpiringContracts(daysAhead: number = 30): Promise<Contract[]> {
    try {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + daysAhead);
      
      const expiringContracts = await db
        .select()
        .from(contracts)
        .where(
          and(
            eq(contracts.status, "active"),
            lte(contracts.endDate, futureDate.toISOString())
          )
        );
      return expiringContracts;
    } catch (error) {
      console.error("Error fetching expiring contracts:", error);
      return [];
    }
  }
}

export const storage = new DatabaseStorage();
