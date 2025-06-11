import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  boolean,
  numeric,
  date,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").notNull().default("agent"), // agent, broker, admin
  brokerageId: varchar("brokerage_id"),
  subscriptionStatus: varchar("subscription_status").notNull().default("trial"), // trial, active, expired, cancelled
  subscriptionPlan: varchar("subscription_plan").default("basic"), // basic, premium, enterprise
  subscriptionStartDate: timestamp("subscription_start_date"),
  subscriptionEndDate: timestamp("subscription_end_date"),
  lastPaymentDate: timestamp("last_payment_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  agentId: varchar("agent_id").notNull(),
  fullName: varchar("full_name").notNull(),
  email: varchar("email").notNull(),
  phone: varchar("phone").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const contracts = pgTable("contracts", {
  id: serial("id").primaryKey(),
  clientId: serial("client_id").notNull(),
  agentId: varchar("agent_id").notNull(),
  representationType: varchar("representation_type").notNull(), // buyer, seller
  propertyAddress: text("property_address"),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  contractFileUrl: text("contract_file_url"),
  contractFileName: varchar("contract_file_name"),
  status: varchar("status").notNull().default("active"), // active, expired, breached, renewed
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const contractSigners = pgTable("contract_signers", {
  id: serial("id").primaryKey(),
  contractId: serial("contract_id").notNull(),
  signerName: varchar("signer_name").notNull(),
  signerEmail: varchar("signer_email"),
  signerPhone: varchar("signer_phone"),
  signerRole: varchar("signer_role").notNull(), // primary_buyer, co_buyer, spouse, business_partner, trustee, etc.
  signedDate: timestamp("signed_date"),
  signatureStatus: varchar("signature_status").notNull().default("pending"), // pending, signed, declined
  isRequired: boolean("is_required").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const alerts = pgTable("alerts", {
  id: serial("id").primaryKey(),
  agentId: varchar("agent_id").notNull(),
  contractId: serial("contract_id"),
  clientId: serial("client_id"),
  type: varchar("type").notNull(), // expiration, breach, renewal
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  severity: varchar("severity").notNull().default("medium"), // low, medium, high, critical
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  action: varchar("action").notNull(),
  entityType: varchar("entity_type").notNull(), // client, contract, alert
  entityId: varchar("entity_id").notNull(),
  details: jsonb("details"),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  plan: varchar("plan").notNull(), // basic, premium, enterprise
  status: varchar("status").notNull(), // active, expired, cancelled, pending
  amount: varchar("amount").notNull(),
  currency: varchar("currency").notNull().default("USD"),
  billingCycle: varchar("billing_cycle").notNull(), // monthly, yearly
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  paymentMethod: varchar("payment_method"),
  stripeSubscriptionId: varchar("stripe_subscription_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  subscriptionId: serial("subscription_id"),
  amount: varchar("amount").notNull(),
  currency: varchar("currency").notNull().default("USD"),
  status: varchar("status").notNull(), // succeeded, failed, pending, refunded
  paymentMethod: varchar("payment_method").notNull(),
  stripePaymentId: varchar("stripe_payment_id"),
  failureReason: text("failure_reason"),
  paidAt: timestamp("paid_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  clients: many(clients),
  contracts: many(contracts),
  alerts: many(alerts),
  auditLogs: many(auditLogs),
}));

export const clientsRelations = relations(clients, ({ one, many }) => ({
  agent: one(users, {
    fields: [clients.agentId],
    references: [users.id],
  }),
  contracts: many(contracts),
}));

export const contractsRelations = relations(contracts, ({ one, many }) => ({
  client: one(clients, {
    fields: [contracts.clientId],
    references: [clients.id],
  }),
  agent: one(users, {
    fields: [contracts.agentId],
    references: [users.id],
  }),
  alerts: many(alerts),
  signers: many(contractSigners),
}));

export const contractSignersRelations = relations(contractSigners, ({ one }) => ({
  contract: one(contracts, {
    fields: [contractSigners.contractId],
    references: [contracts.id],
  }),
}));

export const alertsRelations = relations(alerts, ({ one }) => ({
  agent: one(users, {
    fields: [alerts.agentId],
    references: [users.id],
  }),
  contract: one(contracts, {
    fields: [alerts.contractId],
    references: [contracts.id],
  }),
  client: one(clients, {
    fields: [alerts.clientId],
    references: [clients.id],
  }),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  user: one(users, {
    fields: [auditLogs.userId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertClientSchema = createInsertSchema(clients).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertContractSchema = createInsertSchema(contracts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertContractSignerSchema = createInsertSchema(contractSigners).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAlertSchema = createInsertSchema(alerts).omit({
  id: true,
  createdAt: true,
});

export const insertAuditLogSchema = createInsertSchema(auditLogs).omit({
  id: true,
  timestamp: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertClient = z.infer<typeof insertClientSchema>;
export type Client = typeof clients.$inferSelect;
export type InsertContract = z.infer<typeof insertContractSchema>;
export type Contract = typeof contracts.$inferSelect;
export type InsertContractSigner = z.infer<typeof insertContractSignerSchema>;
export type ContractSigner = typeof contractSigners.$inferSelect;
export type InsertAlert = z.infer<typeof insertAlertSchema>;
export type Alert = typeof alerts.$inferSelect;
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
export type AuditLog = typeof auditLogs.$inferSelect;

// Extended types with relations
export type ClientWithContracts = Client & {
  contracts: Contract[];
  agent: User;
};

export type ContractWithDetails = Contract & {
  client: Client;
  agent: User;
  alerts: Alert[];
  signers: ContractSigner[];
};

export type AlertWithDetails = Alert & {
  contract?: Contract;
  client?: Client;
  agent: User;
};
