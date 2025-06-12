import {
  users,
  clients,
  contracts,
  contractSigners,
  alerts,
  auditLogs,
  properties,
  showings,
  locationTracking,
  propertyVisits,
  commissionProtection,
  type User,
  type UpsertUser,
  type InsertClient,
  type Client,
  type InsertContract,
  type Contract,
  type InsertContractSigner,
  type ContractSigner,
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
  type ClientWithContracts,
  type ContractWithDetails,
  type AlertWithDetails,
  type ShowingWithDetails,
  type PropertyVisitWithDetails,
  type LocationTrackingWithDetails,
  type CommissionProtectionWithDetails,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc, gte, lte, count, sql } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
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
  updateUserSubscription(userId: string, updates: any): Promise<void>;
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
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
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

    // Get alerts for each contract separately and ensure proper typing
    const result: ContractWithDetails[] = [];
    for (const contract of contractsWithDetails) {
      if (!contract.client || !contract.agent) continue;
      
      const contractAlerts = await db
        .select()
        .from(alerts)
        .where(eq(alerts.contractId, contract.id));
      
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
        alerts: contractAlerts,
        signers: []
      });
    }

    // Get signers for each contract
    for (const contract of result) {
      const signers = await db
        .select()
        .from(contractSigners)
        .where(eq(contractSigners.contractId, contract.id))
        .orderBy(contractSigners.createdAt);
      
      contract.signers = signers;
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

  async updateUserSubscription(userId: string, updates: any): Promise<void> {
    try {
      await db
        .update(users)
        .set({
          subscriptionStatus: updates.subscriptionStatus,
          subscriptionPlan: updates.subscriptionPlan,
          subscriptionEndDate: updates.subscriptionEndDate,
          updatedAt: new Date()
        })
        .where(eq(users.id, userId));
    } catch (error) {
      console.error("Error updating user subscription:", error);
      throw error;
    }
  }
}

export const storage = new DatabaseStorage();
