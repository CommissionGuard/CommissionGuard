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
  phone: varchar("phone"),
  role: varchar("role").notNull().default("agent"), // agent, broker, admin
  licenseNumber: varchar("license_number"),
  brokerage: varchar("brokerage"),
  isActive: boolean("is_active").default(true),
  lastLoginAt: timestamp("last_login_at"),
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

// Property showing tracking tables
export const properties = pgTable("properties", {
  id: serial("id").primaryKey(),
  mlsNumber: varchar("mls_number"),
  address: text("address").notNull(),
  city: varchar("city").notNull(),
  state: varchar("state").notNull(),
  zipCode: varchar("zip_code").notNull(),
  latitude: numeric("latitude", { precision: 10, scale: 8 }),
  longitude: numeric("longitude", { precision: 11, scale: 8 }),
  price: numeric("price", { precision: 12, scale: 2 }),
  bedrooms: numeric("bedrooms"),
  bathrooms: numeric("bathrooms"),
  squareFeet: numeric("square_feet"),
  propertyType: varchar("property_type"), // single-family, condo, townhouse, etc.
  listingStatus: varchar("listing_status").default("active"), // active, pending, sold, expired
  listingAgent: varchar("listing_agent"),
  listingBrokerage: varchar("listing_brokerage"),
  neighborhood: varchar("neighborhood"),
  propertyDetails: jsonb("property_details"), // Additional property info
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const showings = pgTable("showings", {
  id: serial("id").primaryKey(),
  agentId: varchar("agent_id").notNull(),
  clientId: serial("client_id").notNull(),
  propertyId: serial("property_id").notNull(),
  scheduledDate: timestamp("scheduled_date").notNull(),
  actualStartTime: timestamp("actual_start_time"),
  actualEndTime: timestamp("actual_end_time"),
  showingType: varchar("showing_type").notNull(), // scheduled, walk-in, drive-by
  status: varchar("status").notNull().default("scheduled"), // scheduled, in-progress, completed, cancelled, no-show
  agentPresent: boolean("agent_present").default(true),
  clientFeedback: text("client_feedback"),
  agentNotes: text("agent_notes"),
  interestLevel: varchar("interest_level"), // high, medium, low, no-interest
  nextSteps: text("next_steps"),
  commissionProtected: boolean("commission_protected").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const locationTracking = pgTable("location_tracking", {
  id: serial("id").primaryKey(),
  showingId: serial("showing_id").notNull(),
  agentId: varchar("agent_id").notNull(),
  clientId: serial("client_id").notNull(),
  latitude: numeric("latitude", { precision: 10, scale: 8 }).notNull(),
  longitude: numeric("longitude", { precision: 11, scale: 8 }).notNull(),
  address: text("address"),
  locationAccuracy: numeric("location_accuracy"), // GPS accuracy in meters
  timestamp: timestamp("timestamp").defaultNow(),
  locationType: varchar("location_type").notNull(), // scheduled-property, nearby-property, off-route
  distanceFromScheduled: numeric("distance_from_scheduled"), // Distance in meters from scheduled property
  propertyId: serial("property_id"), // If location matches a known property
  notes: text("notes"),
});

export const propertyVisits = pgTable("property_visits", {
  id: serial("id").primaryKey(),
  agentId: varchar("agent_id").notNull(),
  clientId: serial("client_id").notNull(),
  propertyId: serial("property_id").notNull(),
  visitDate: timestamp("visit_date").notNull(),
  visitType: varchar("visit_type").notNull(), // showing, drive-by, walk-by, online-view
  duration: numeric("duration"), // Duration in minutes
  agentPresent: boolean("agent_present").default(false),
  wasScheduled: boolean("was_scheduled").default(false),
  showingId: serial("showing_id"), // Reference to scheduled showing if applicable
  discoveryMethod: varchar("discovery_method"), // how visit was discovered: gps, client-report, agent-observation
  riskLevel: varchar("risk_level").default("low"), // low, medium, high (commission risk)
  followUpRequired: boolean("follow_up_required").default(false),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const commissionProtection = pgTable("commission_protection", {
  id: serial("id").primaryKey(),
  agentId: varchar("agent_id").notNull(),
  clientId: serial("client_id").notNull(),
  propertyId: serial("property_id").notNull(),
  protectionType: varchar("protection_type").notNull(), // showing, inquiry, negotiation, contract
  protectionDate: timestamp("protection_date").notNull(),
  expirationDate: timestamp("expiration_date"),
  evidenceType: varchar("evidence_type").notNull(), // gps-tracking, signed-document, email-trail, witness
  evidenceData: jsonb("evidence_data"), // Supporting evidence
  status: varchar("status").default("active"), // active, expired, claimed, disputed
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const buyerPreApprovals = pgTable("buyer_pre_approvals", {
  id: serial("id").primaryKey(),
  agentId: varchar("agent_id").notNull(),
  clientId: serial("client_id").notNull(),
  lenderName: varchar("lender_name").notNull(),
  approvalAmount: numeric("approval_amount", { precision: 12, scale: 2 }).notNull(),
  interestRate: numeric("interest_rate", { precision: 5, scale: 3 }),
  approvalDate: timestamp("approval_date").notNull(),
  expirationDate: timestamp("expiration_date").notNull(),
  loanType: varchar("loan_type").notNull(), // conventional, fha, va, usda, jumbo
  downPaymentPercent: numeric("down_payment_percent", { precision: 5, scale: 2 }),
  monthlyIncome: numeric("monthly_income", { precision: 10, scale: 2 }),
  debtToIncomeRatio: numeric("debt_to_income_ratio", { precision: 5, scale: 2 }),
  creditScore: numeric("credit_score"),
  employmentStatus: varchar("employment_status"), // employed, self-employed, retired, other
  preApprovalLetter: text("pre_approval_letter"), // Base64 encoded document
  verificationStatus: varchar("verification_status").default("pending"), // pending, verified, expired, invalid
  commissionRate: numeric("commission_rate", { precision: 5, scale: 3 }).default("2.5"), // Expected commission percentage
  estimatedCommission: numeric("estimated_commission", { precision: 10, scale: 2 }), // Calculated commission value
  protectedStatus: boolean("protected_status").default(true),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// AI Communication & Campaign tables
export const dripCampaigns = pgTable("drip_campaigns", {
  id: serial("id").primaryKey(),
  agentId: varchar("agent_id").notNull(),
  name: varchar("name").notNull(),
  description: text("description"),
  targetAudience: varchar("target_audience").notNull(), // new_leads, warm_prospects, past_clients, etc.
  campaignType: varchar("campaign_type").notNull(), // welcome, nurture, market_updates, listing_alerts
  status: varchar("status").notNull().default("draft"), // draft, active, paused, completed
  totalSteps: numeric("total_steps").default("0"),
  enrolledCount: numeric("enrolled_count").default("0"),
  completedCount: numeric("completed_count").default("0"),
  openRate: numeric("open_rate", { precision: 5, scale: 2 }),
  clickRate: numeric("click_rate", { precision: 5, scale: 2 }),
  responseRate: numeric("response_rate", { precision: 5, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const campaignSteps = pgTable("campaign_steps", {
  id: serial("id").primaryKey(),
  campaignId: serial("campaign_id").notNull(),
  stepNumber: numeric("step_number").notNull(),
  title: varchar("title").notNull(),
  messageType: varchar("message_type").notNull(), // email, sms, call_reminder
  delayDays: numeric("delay_days").notNull(), // Days after previous step or enrollment
  subject: varchar("subject"), // For emails
  content: text("content").notNull(),
  aiGenerated: boolean("ai_generated").default(false),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const campaignEnrollments = pgTable("campaign_enrollments", {
  id: serial("id").primaryKey(),
  campaignId: serial("campaign_id").notNull(),
  clientId: serial("client_id").notNull(),
  enrolledDate: timestamp("enrolled_date").defaultNow(),
  currentStep: numeric("current_step").default("0"),
  status: varchar("status").notNull().default("active"), // active, completed, unsubscribed, paused
  lastMessageSent: timestamp("last_message_sent"),
  nextMessageDue: timestamp("next_message_due"),
  totalMessagesReceived: numeric("total_messages_received").default("0"),
  totalMessagesOpened: numeric("total_messages_opened").default("0"),
  totalLinksClicked: numeric("total_links_clicked").default("0"),
  hasResponded: boolean("has_responded").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const clientCommunications = pgTable("client_communications", {
  id: serial("id").primaryKey(),
  agentId: varchar("agent_id").notNull(),
  clientId: serial("client_id").notNull(),
  campaignId: serial("campaign_id"), // If part of a campaign
  stepId: serial("step_id"), // If part of a campaign step
  communicationType: varchar("communication_type").notNull(), // email, sms, call, meeting, manual
  direction: varchar("direction").notNull(), // outbound, inbound
  subject: varchar("subject"),
  content: text("content"),
  aiGenerated: boolean("ai_generated").default(false),
  aiPrompt: text("ai_prompt"), // The prompt used to generate AI content
  scheduledDate: timestamp("scheduled_date"),
  sentDate: timestamp("sent_date"),
  deliveredDate: timestamp("delivered_date"),
  openedDate: timestamp("opened_date"),
  clickedDate: timestamp("clicked_date"),
  respondedDate: timestamp("responded_date"),
  responseContent: text("response_content"),
  status: varchar("status").notNull().default("draft"), // draft, scheduled, sent, delivered, opened, clicked, responded, failed
  priority: varchar("priority").default("normal"), // low, normal, high, urgent
  tags: jsonb("tags"), // Array of tags for categorization
  metadata: jsonb("metadata"), // Additional data like email headers, sms delivery receipts
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const contractReminders = pgTable("contract_reminders", {
  id: serial("id").primaryKey(),
  agentId: varchar("agent_id").notNull(),
  contractId: serial("contract_id").notNull(),
  clientId: serial("client_id").notNull(),
  reminderType: varchar("reminder_type").notNull(), // weekly_checkin, expiration_warning, renewal_due
  scheduledDate: timestamp("scheduled_date").notNull(),
  sentDate: timestamp("sent_date"),
  status: varchar("status").notNull().default("pending"), // pending, sent, delivered, failed
  notificationMethod: varchar("notification_method").notNull().default("email"), // email, sms, both
  message: text("message"),
  isRecurring: boolean("is_recurring").default(false),
  recurringInterval: numeric("recurring_interval"), // Days between recurring reminders
  lastSentDate: timestamp("last_sent_date"),
  nextSendDate: timestamp("next_send_date"),
  priority: varchar("priority").default("normal"), // low, normal, high, urgent
  metadata: jsonb("metadata"), // Additional reminder data
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const aiConversations = pgTable("ai_conversations", {
  id: serial("id").primaryKey(),
  agentId: varchar("agent_id").notNull(),
  clientId: serial("client_id"), // Optional - for client-specific conversations
  conversationType: varchar("conversation_type").notNull(), // campaign_creation, message_drafting, inquiry_response, market_analysis
  title: varchar("title"),
  context: jsonb("context"), // Context data for the AI conversation
  messages: jsonb("messages").notNull(), // Array of conversation messages
  isActive: boolean("is_active").default(true),
  lastMessageAt: timestamp("last_message_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Insert schemas for new AI communication tables
export const insertDripCampaignSchema = createInsertSchema(dripCampaigns).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCampaignStepSchema = createInsertSchema(campaignSteps).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCampaignEnrollmentSchema = createInsertSchema(campaignEnrollments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertClientCommunicationSchema = createInsertSchema(clientCommunications).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAiConversationSchema = createInsertSchema(aiConversations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types for AI communication
export type InsertDripCampaign = z.infer<typeof insertDripCampaignSchema>;
export type InsertCampaignStep = z.infer<typeof insertCampaignStepSchema>;
export type InsertCampaignEnrollment = z.infer<typeof insertCampaignEnrollmentSchema>;
export type InsertClientCommunication = z.infer<typeof insertClientCommunicationSchema>;
export type InsertAiConversation = z.infer<typeof insertAiConversationSchema>;

export type DripCampaign = typeof dripCampaigns.$inferSelect;
export type CampaignStep = typeof campaignSteps.$inferSelect;
export type CampaignEnrollment = typeof campaignEnrollments.$inferSelect;
export type ClientCommunication = typeof clientCommunications.$inferSelect;
export type AiConversation = typeof aiConversations.$inferSelect;

// Notification reminders table
export const notificationReminders = pgTable("notification_reminders", {
  id: serial("id").primaryKey(),
  showingId: serial("showing_id").references(() => showings.id).notNull(),
  agentId: text("agent_id").references(() => users.id).notNull(),
  clientId: serial("client_id").references(() => clients.id).notNull(),
  reminderType: text("reminder_type").notNull(), // "24_hour", "1_hour"
  notificationMethod: text("notification_method").notNull(), // "email", "sms", "both"
  scheduledFor: timestamp("scheduled_for").notNull(),
  sentAt: timestamp("sent_at"),
  status: text("status").default("pending").notNull(), // "pending", "sent", "failed"
  emailContent: text("email_content"),
  smsContent: text("sms_content"),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// SMS message tracking for routing client responses back to agents
export const smsMessages = pgTable("sms_messages", {
  id: serial("id").primaryKey(),
  twilioMessageSid: varchar("twilio_message_sid").unique(), // Twilio's unique message ID
  agentId: varchar("agent_id").notNull().references(() => users.id),
  clientId: serial("client_id").references(() => clients.id),
  showingId: serial("showing_id").references(() => showings.id),
  fromPhone: varchar("from_phone").notNull(), // Phone number message was sent from
  toPhone: varchar("to_phone").notNull(), // Phone number message was sent to
  messageBody: text("message_body").notNull(),
  direction: varchar("direction").notNull(), // "outbound" or "inbound"
  status: varchar("status").notNull(), // "sent", "delivered", "failed", "received"
  messageType: varchar("message_type").default("reminder"), // "reminder", "response", "general"
  relatedReminderId: serial("related_reminder_id").references(() => notificationReminders.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Calendar integration settings
export const calendarIntegrations = pgTable("calendar_integrations", {
  id: serial("id").primaryKey(),
  agentId: text("agent_id").references(() => users.id).notNull(),
  provider: text("provider").notNull(), // "google", "outlook"
  accessToken: text("access_token").notNull(),
  refreshToken: text("refresh_token"),
  tokenExpiry: timestamp("token_expiry"),
  calendarId: text("calendar_id"),
  isActive: boolean("is_active").default(true),
  syncSettings: jsonb("sync_settings"), // JSON object for sync preferences
  lastSyncAt: timestamp("last_sync_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Calendar events tracking
export const calendarEvents = pgTable("calendar_events", {
  id: serial("id").primaryKey(),
  showingId: serial("showing_id").references(() => showings.id).notNull(),
  agentId: text("agent_id").references(() => users.id).notNull(),
  integrationId: serial("integration_id").references(() => calendarIntegrations.id).notNull(),
  externalEventId: text("external_event_id").notNull(),
  provider: text("provider").notNull(),
  eventTitle: text("event_title").notNull(),
  eventDescription: text("event_description"),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  location: text("location"),
  syncStatus: text("sync_status").default("synced").notNull(), // "synced", "pending", "failed"
  lastSyncAt: timestamp("last_sync_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type NotificationReminder = typeof notificationReminders.$inferSelect;
export type SmsMessage = typeof smsMessages.$inferSelect;
export type CalendarIntegration = typeof calendarIntegrations.$inferSelect;
export type CalendarEvent = typeof calendarEvents.$inferSelect;

export const insertNotificationReminderSchema = createInsertSchema(notificationReminders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSmsMessageSchema = createInsertSchema(smsMessages).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCalendarIntegrationSchema = createInsertSchema(calendarIntegrations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCalendarEventSchema = createInsertSchema(calendarEvents).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertNotificationReminder = z.infer<typeof insertNotificationReminderSchema>;
export type InsertSmsMessage = z.infer<typeof insertSmsMessageSchema>;
export type InsertCalendarIntegration = z.infer<typeof insertCalendarIntegrationSchema>;
export type InsertCalendarEvent = z.infer<typeof insertCalendarEventSchema>;

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  clients: many(clients),
  contracts: many(contracts),
  alerts: many(alerts),
  auditLogs: many(auditLogs),
  showings: many(showings),
  locationTracking: many(locationTracking),
  propertyVisits: many(propertyVisits),
  commissionProtection: many(commissionProtection),
  dripCampaigns: many(dripCampaigns),
  clientCommunications: many(clientCommunications),
  aiConversations: many(aiConversations),
}));

export const dripCampaignsRelations = relations(dripCampaigns, ({ one, many }) => ({
  agent: one(users, {
    fields: [dripCampaigns.agentId],
    references: [users.id],
  }),
  steps: many(campaignSteps),
  enrollments: many(campaignEnrollments),
}));

export const campaignStepsRelations = relations(campaignSteps, ({ one }) => ({
  campaign: one(dripCampaigns, {
    fields: [campaignSteps.campaignId],
    references: [dripCampaigns.id],
  }),
}));

export const campaignEnrollmentsRelations = relations(campaignEnrollments, ({ one }) => ({
  campaign: one(dripCampaigns, {
    fields: [campaignEnrollments.campaignId],
    references: [dripCampaigns.id],
  }),
  client: one(clients, {
    fields: [campaignEnrollments.clientId],
    references: [clients.id],
  }),
}));

export const clientCommunicationsRelations = relations(clientCommunications, ({ one }) => ({
  agent: one(users, {
    fields: [clientCommunications.agentId],
    references: [users.id],
  }),
  client: one(clients, {
    fields: [clientCommunications.clientId],
    references: [clients.id],
  }),
  campaign: one(dripCampaigns, {
    fields: [clientCommunications.campaignId],
    references: [dripCampaigns.id],
  }),
  step: one(campaignSteps, {
    fields: [clientCommunications.stepId],
    references: [campaignSteps.id],
  }),
}));

export const clientsRelations = relations(clients, ({ one, many }) => ({
  agent: one(users, {
    fields: [clients.agentId],
    references: [users.id],
  }),
  contracts: many(contracts),
  showings: many(showings),
  locationTracking: many(locationTracking),
  propertyVisits: many(propertyVisits),
  commissionProtection: many(commissionProtection),
}));

export const propertiesRelations = relations(properties, ({ many }) => ({
  showings: many(showings),
  propertyVisits: many(propertyVisits),
  commissionProtection: many(commissionProtection),
  locationTracking: many(locationTracking),
}));

export const showingsRelations = relations(showings, ({ one, many }) => ({
  agent: one(users, {
    fields: [showings.agentId],
    references: [users.id],
  }),
  client: one(clients, {
    fields: [showings.clientId],
    references: [clients.id],
  }),
  property: one(properties, {
    fields: [showings.propertyId],
    references: [properties.id],
  }),
  locationTracking: many(locationTracking),
}));

export const locationTrackingRelations = relations(locationTracking, ({ one }) => ({
  showing: one(showings, {
    fields: [locationTracking.showingId],
    references: [showings.id],
  }),
  agent: one(users, {
    fields: [locationTracking.agentId],
    references: [users.id],
  }),
  client: one(clients, {
    fields: [locationTracking.clientId],
    references: [clients.id],
  }),
  property: one(properties, {
    fields: [locationTracking.propertyId],
    references: [properties.id],
  }),
}));

export const propertyVisitsRelations = relations(propertyVisits, ({ one }) => ({
  agent: one(users, {
    fields: [propertyVisits.agentId],
    references: [users.id],
  }),
  client: one(clients, {
    fields: [propertyVisits.clientId],
    references: [clients.id],
  }),
  property: one(properties, {
    fields: [propertyVisits.propertyId],
    references: [properties.id],
  }),
  showing: one(showings, {
    fields: [propertyVisits.showingId],
    references: [showings.id],
  }),
}));

export const commissionProtectionRelations = relations(commissionProtection, ({ one }) => ({
  agent: one(users, {
    fields: [commissionProtection.agentId],
    references: [users.id],
  }),
  client: one(clients, {
    fields: [commissionProtection.clientId],
    references: [clients.id],
  }),
  property: one(properties, {
    fields: [commissionProtection.propertyId],
    references: [properties.id],
  }),
}));

export const buyerPreApprovalsRelations = relations(buyerPreApprovals, ({ one }) => ({
  agent: one(users, {
    fields: [buyerPreApprovals.agentId],
    references: [users.id],
  }),
  client: one(clients, {
    fields: [buyerPreApprovals.clientId],
    references: [clients.id],
  }),
}));

export const contractRemindersRelations = relations(contractReminders, ({ one }) => ({
  agent: one(users, {
    fields: [contractReminders.agentId],
    references: [users.id],
  }),
  contract: one(contracts, {
    fields: [contractReminders.contractId],
    references: [contracts.id],
  }),
  client: one(clients, {
    fields: [contractReminders.clientId],
    references: [clients.id],
  }),
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
  reminders: many(contractReminders),
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

export const insertPropertySchema = createInsertSchema(properties).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertShowingSchema = createInsertSchema(showings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertLocationTrackingSchema = createInsertSchema(locationTracking).omit({
  id: true,
  timestamp: true,
});

export const insertPropertyVisitSchema = createInsertSchema(propertyVisits).omit({
  id: true,
  createdAt: true,
});

export const insertCommissionProtectionSchema = createInsertSchema(commissionProtection).omit({
  id: true,
  createdAt: true,
});

export const insertBuyerPreApprovalSchema = createInsertSchema(buyerPreApprovals).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertContractReminderSchema = createInsertSchema(contractReminders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
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

// Property showing tracking types
export type InsertProperty = z.infer<typeof insertPropertySchema>;
export type Property = typeof properties.$inferSelect;
export type InsertShowing = z.infer<typeof insertShowingSchema>;
export type Showing = typeof showings.$inferSelect;
export type InsertLocationTracking = z.infer<typeof insertLocationTrackingSchema>;
export type LocationTracking = typeof locationTracking.$inferSelect;
export type InsertPropertyVisit = z.infer<typeof insertPropertyVisitSchema>;
export type PropertyVisit = typeof propertyVisits.$inferSelect;
export type InsertCommissionProtection = z.infer<typeof insertCommissionProtectionSchema>;
export type CommissionProtection = typeof commissionProtection.$inferSelect;
export type InsertBuyerPreApproval = z.infer<typeof insertBuyerPreApprovalSchema>;
export type BuyerPreApproval = typeof buyerPreApprovals.$inferSelect;
export type InsertContractReminder = z.infer<typeof insertContractReminderSchema>;
export type ContractReminder = typeof contractReminders.$inferSelect;

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

// Property tracking extended types
export type ShowingWithDetails = Showing & {
  agent: User;
  client: Client;
  property: Property;
  locationTracking: LocationTracking[];
};

export type PropertyVisitWithDetails = PropertyVisit & {
  agent: User;
  client: Client;
  property: Property;
  showing?: Showing;
};

export type LocationTrackingWithDetails = LocationTracking & {
  agent: User;
  client: Client;
  showing: Showing;
  property?: Property;
};

export type CommissionProtectionWithDetails = CommissionProtection & {
  agent: User;
  client: Client;
  property: Property;
};
