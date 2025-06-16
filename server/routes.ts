import type { Express, RequestHandler } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, isAuthenticatedOrDemo } from "./replitAuth";
import { apiIntegrationService } from "./apiIntegrations";
import { aiService } from "./aiService";
import { enhancedPropertyService } from "./enhancedPropertyService";
import { 
  insertClientSchema, 
  insertContractSchema, 
  insertContractSignerSchema, 
  insertAlertSchema,
  insertPropertySchema,
  insertShowingSchema,
  insertLocationTrackingSchema,
  insertPropertyVisitSchema,
  insertCommissionProtectionSchema,
  insertContractReminderSchema,
  insertDripCampaignSchema,
  insertCampaignStepSchema,
  insertCampaignEnrollmentSchema,
  insertClientCommunicationSchema,
  insertAiConversationSchema,
  insertNotificationReminderSchema,
  insertCalendarIntegrationSchema,
  insertCalendarEventSchema
} from "@shared/schema";
import { aiCommunicationService } from "./aiCommunicationService";
import { notificationService } from "./notificationService";
import { calendarService } from "./calendarService";
import { aiSupportService } from "./aiSupportService";
import { z } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";

// Configure multer for file uploads
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  dest: uploadDir,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"));
    }
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Admin middleware for role checking
  const isAdmin = async (req: any, res: any, next: any) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      next();
    } catch (error) {
      res.status(500).json({ message: "Authorization check failed" });
    }
  };

  // Admin routes
  app.get('/api/admin/users', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.patch('/api/admin/users/:id/role', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { role } = req.body;
      
      if (!['agent', 'broker', 'admin'].includes(role)) {
        return res.status(400).json({ message: "Invalid role" });
      }
      
      const user = await storage.updateUserRole(id, role);
      res.json(user);
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(500).json({ message: "Failed to update user role" });
    }
  });

  app.patch('/api/admin/users/:id/status', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { active } = req.body;
      
      if (active) {
        await storage.activateUser(id);
      } else {
        await storage.deactivateUser(id);
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating user status:", error);
      res.status(500).json({ message: "Failed to update user status" });
    }
  });

  app.patch('/api/admin/users/:id/subscription', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;
      const subscriptionData = req.body;
      
      const user = await storage.updateUserSubscription(id, subscriptionData);
      res.json(user);
    } catch (error) {
      console.error("Error updating subscription:", error);
      res.status(500).json({ message: "Failed to update subscription" });
    }
  });

  // Dashboard routes
  app.get("/api/dashboard/stats", isAuthenticated, async (req: any, res) => {
    try {
      const agentId = req.user.claims.sub;
      const stats = await storage.getDashboardStats(agentId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Admin system statistics
  app.get("/api/admin/stats", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      // Get all system statistics
      const allUsers = await storage.getAllUsers();
      const allContracts = await storage.getAllContracts();
      const allShowings = await storage.getAllShowings();
      const allProtectionRecords = await storage.getAllCommissionProtection();

      const stats = {
        totalUsers: allUsers.length,
        activeUsers: allUsers.filter(u => u.isActive).length,
        totalContracts: allContracts.length,
        totalProtectionRecords: allProtectionRecords.length,
        totalShowings: allShowings.length,
        monthlyRevenue: allUsers.filter(u => u.subscriptionStatus === 'active').length * 59, // Estimate based on active subscriptions
        systemHealth: "operational"
      };

      res.json(stats);
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ message: "Failed to fetch admin stats" });
    }
  });

  // Profile routes
  app.patch("/api/profile", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const updateData = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        phone: req.body.phone,
        licenseNumber: req.body.licenseNumber,
        brokerage: req.body.brokerage,
        updatedAt: new Date(),
      };

      const user = await storage.updateUserProfile(userId, updateData);
      res.json(user);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Subscription routes
  app.get("/api/subscription/status", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const subscriptionData = {
        plan: user.subscriptionPlan || "trial",
        status: user.subscriptionStatus || "trial",
        startDate: user.subscriptionStartDate,
        endDate: user.subscriptionEndDate,
        lastPaymentDate: user.lastPaymentDate,
        paymentHistory: [
          // Mock payment history for demo - in production this would come from Stripe
          {
            id: "pay_123",
            amount: user.subscriptionPlan === "professional" ? 59 : user.subscriptionPlan === "enterprise" ? 149 : 29,
            status: "succeeded",
            date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
          },
          {
            id: "pay_124",
            amount: user.subscriptionPlan === "professional" ? 59 : user.subscriptionPlan === "enterprise" ? 149 : 29,
            status: "succeeded",
            date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
          }
        ]
      };

      res.json(subscriptionData);
    } catch (error) {
      console.error("Error fetching subscription status:", error);
      res.status(500).json({ message: "Failed to fetch subscription status" });
    }
  });

  app.post("/api/subscription/upgrade", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { planId } = req.body;
      
      // Validate plan ID
      const validPlans = ["basic", "professional", "enterprise"];
      if (!validPlans.includes(planId)) {
        return res.status(400).json({ message: "Invalid plan ID" });
      }

      // In a real implementation, this would integrate with Stripe
      // For now, we'll simulate the upgrade process
      const planPrices = {
        basic: 29,
        professional: 59,
        enterprise: 149
      };

      // Update user subscription
      const subscriptionData = {
        status: "active",
        plan: planId,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        lastPaymentDate: new Date(),
      };

      await storage.updateUserSubscription(userId, subscriptionData);

      // In production, return Stripe checkout URL
      res.json({ 
        success: true,
        message: "Subscription upgraded successfully",
        // paymentUrl: "https://checkout.stripe.com/..." // Would be returned from Stripe
      });
    } catch (error) {
      console.error("Error upgrading subscription:", error);
      res.status(500).json({ message: "Failed to upgrade subscription" });
    }
  });

  app.post("/api/subscription/cancel", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // In a real implementation, this would cancel the Stripe subscription
      const subscriptionData = {
        status: "cancelled",
        endDate: new Date(), // Immediate cancellation for demo
      };

      await storage.updateUserSubscription(userId, subscriptionData);

      res.json({ 
        success: true,
        message: "Subscription cancelled successfully"
      });
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      res.status(500).json({ message: "Failed to cancel subscription" });
    }
  });

  // Client routes
  app.post("/api/clients", isAuthenticated, async (req: any, res) => {
    try {
      const agentId = req.user.claims.sub;
      const clientData = insertClientSchema.parse({ ...req.body, agentId });
      const client = await storage.createClient(clientData);
      res.status(201).json(client);
    } catch (error) {
      console.error("Error creating client:", error);
      res.status(400).json({ message: "Failed to create client" });
    }
  });

  app.get("/api/clients", isAuthenticated, async (req: any, res) => {
    try {
      const agentId = req.user.claims.sub;
      const clients = await storage.getClientsByAgent(agentId);
      res.json(clients);
    } catch (error) {
      console.error("Error fetching clients:", error);
      res.status(500).json({ message: "Failed to fetch clients" });
    }
  });

  app.get("/api/clients/:id", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const client = await storage.getClient(parseInt(id));
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }
      
      // Check if client belongs to agent
      if (client.agentId !== req.user.claims.sub) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      res.json(client);
    } catch (error) {
      console.error("Error fetching client:", error);
      res.status(500).json({ message: "Failed to fetch client" });
    }
  });

  // Client-specific showings
  app.get("/api/showings/client/:clientId", isAuthenticated, async (req: any, res) => {
    try {
      const { clientId } = req.params;
      const agentId = req.user.claims.sub;
      
      // Verify client belongs to agent
      const client = await storage.getClient(parseInt(clientId));
      if (!client || client.agentId !== agentId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const showings = await storage.getShowingsByClient(parseInt(clientId));
      res.json(showings);
    } catch (error) {
      console.error("Error fetching client showings:", error);
      res.status(500).json({ message: "Failed to fetch showings" });
    }
  });

  // Client-specific property visits
  app.get("/api/property-visits/client/:clientId", isAuthenticated, async (req: any, res) => {
    try {
      const { clientId } = req.params;
      const agentId = req.user.claims.sub;
      
      // Verify client belongs to agent
      const client = await storage.getClient(parseInt(clientId));
      if (!client || client.agentId !== agentId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const visits = await storage.getPropertyVisitsByClient(parseInt(clientId));
      res.json(visits);
    } catch (error) {
      console.error("Error fetching client property visits:", error);
      res.status(500).json({ message: "Failed to fetch property visits" });
    }
  });

  // Client-specific SMS history
  app.get("/api/sms/history/:clientId", isAuthenticated, async (req: any, res) => {
    try {
      const { clientId } = req.params;
      const agentId = req.user.claims.sub;
      
      // Verify client belongs to agent
      const client = await storage.getClient(parseInt(clientId));
      if (!client || client.agentId !== agentId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const smsHistory = await notificationService.getSMSHistory(parseInt(clientId), agentId);
      res.json(smsHistory);
    } catch (error) {
      console.error("Error fetching SMS history:", error);
      res.status(500).json({ message: "Failed to fetch SMS history" });
    }
  });

  // Contract routes
  app.post("/api/contracts", isAuthenticated, upload.single("contractFile"), async (req: any, res) => {
    try {
      const agentId = req.user.claims.sub;
      let contractFileUrl = null;
      let contractFileName = null;

      if (req.file) {
        // Move file to permanent location with proper name
        const fileName = `${Date.now()}_${req.file.originalname}`;
        const permanentPath = path.join(uploadDir, fileName);
        fs.renameSync(req.file.path, permanentPath);
        
        contractFileUrl = `/uploads/${fileName}`;
        contractFileName = req.file.originalname;
      }

      const contractData = insertContractSchema.parse({
        ...req.body,
        agentId,
        contractFileUrl,
        contractFileName,
        clientId: parseInt(req.body.clientId),
      });

      const contract = await storage.createContract(contractData);
      res.status(201).json(contract);
    } catch (error) {
      console.error("Error creating contract:", error);
      res.status(400).json({ message: "Failed to create contract" });
    }
  });

  app.get("/api/contracts", async (req: any, res) => {
    try {
      // For demo purposes, using a default agent ID when auth is not configured
      const agentId = req.user?.claims?.sub || "41091568";
      const contracts = await storage.getContractsByAgent(agentId);
      res.json(contracts);
    } catch (error) {
      console.error("Error fetching contracts:", error);
      res.status(500).json({ message: "Failed to fetch contracts" });
    }
  });

  app.get("/api/contracts/:id", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const contract = await storage.getContract(parseInt(id));
      if (!contract) {
        return res.status(404).json({ message: "Contract not found" });
      }
      
      // Check if contract belongs to agent
      if (contract.agentId !== req.user.claims.sub) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      res.json(contract);
    } catch (error) {
      console.error("Error fetching contract:", error);
      res.status(500).json({ message: "Failed to fetch contract" });
    }
  });

  app.get("/api/contracts/expiring/:days", isAuthenticated, async (req: any, res) => {
    try {
      const agentId = req.user.claims.sub;
      const days = parseInt(req.params.days) || 30;
      const contracts = await storage.getExpiringContracts(agentId, days);
      res.json(contracts);
    } catch (error) {
      console.error("Error fetching expiring contracts:", error);
      res.status(500).json({ message: "Failed to fetch expiring contracts" });
    }
  });

  app.get("/api/contracts/client/:clientId", isAuthenticated, async (req: any, res) => {
    try {
      const agentId = req.user.claims.sub;
      const clientId = parseInt(req.params.clientId);
      
      // Validate clientId
      if (isNaN(clientId)) {
        return res.status(400).json({ message: "Invalid client ID" });
      }
      
      const contracts = await storage.getContractsByClient(clientId);
      
      // Filter contracts to only show those belonging to the authenticated agent
      const agentContracts = contracts.filter(contract => contract.agentId === agentId);
      res.json(agentContracts);
    } catch (error) {
      console.error("Error fetching client contracts:", error);
      res.status(500).json({ message: "Failed to fetch client contracts" });
    }
  });

  // Contract Signer routes
  app.post("/api/contracts/:contractId/signers", isAuthenticated, async (req: any, res) => {
    try {
      const contractId = parseInt(req.params.contractId);
      const signerData = insertContractSignerSchema.parse({
        ...req.body,
        contractId,
      });
      
      const signer = await storage.createContractSigner(signerData);
      res.json(signer);
    } catch (error) {
      console.error("Error creating contract signer:", error);
      res.status(500).json({ message: "Failed to create contract signer" });
    }
  });

  app.get("/api/contracts/:contractId/signers", isAuthenticated, async (req: any, res) => {
    try {
      const contractId = parseInt(req.params.contractId);
      const signers = await storage.getContractSigners(contractId);
      res.json(signers);
    } catch (error) {
      console.error("Error fetching contract signers:", error);
      res.status(500).json({ message: "Failed to fetch contract signers" });
    }
  });

  app.patch("/api/contract-signers/:id/sign", isAuthenticated, async (req: any, res) => {
    try {
      const signerId = parseInt(req.params.id);
      await storage.markSignerAsSigned(signerId);
      res.json({ message: "Signer marked as signed" });
    } catch (error) {
      console.error("Error marking signer as signed:", error);
      res.status(500).json({ message: "Failed to mark signer as signed" });
    }
  });

  app.delete("/api/contract-signers/:id", isAuthenticated, async (req: any, res) => {
    try {
      const signerId = parseInt(req.params.id);
      await storage.deleteContractSigner(signerId);
      res.json({ message: "Contract signer deleted" });
    } catch (error) {
      console.error("Error deleting contract signer:", error);
      res.status(500).json({ message: "Failed to delete contract signer" });
    }
  });

  // Alert routes
  app.get("/api/alerts", isAuthenticated, async (req: any, res) => {
    try {
      const agentId = req.user.claims.sub;
      const alerts = await storage.getAlertsByAgent(agentId);
      res.json(alerts);
    } catch (error) {
      console.error("Error fetching alerts:", error);
      res.status(500).json({ message: "Failed to fetch alerts" });
    }
  });

  app.post("/api/alerts", isAuthenticated, async (req: any, res) => {
    try {
      const agentId = req.user.claims.sub;
      const alertData = insertAlertSchema.parse({ ...req.body, agentId });
      const alert = await storage.createAlert(alertData);
      res.status(201).json(alert);
    } catch (error) {
      console.error("Error creating alert:", error);
      res.status(400).json({ message: "Failed to create alert" });
    }
  });

  app.patch("/api/alerts/:id/read", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.markAlertAsRead(parseInt(id));
      res.json({ message: "Alert marked as read" });
    } catch (error) {
      console.error("Error marking alert as read:", error);
      res.status(500).json({ message: "Failed to mark alert as read" });
    }
  });

  app.get("/api/alerts/unread/count", isAuthenticated, async (req: any, res) => {
    try {
      const agentId = req.user.claims.sub;
      const count = await storage.getUnreadAlertsCount(agentId);
      res.json({ count });
    } catch (error) {
      console.error("Error fetching unread alerts count:", error);
      res.status(500).json({ message: "Failed to fetch unread alerts count" });
    }
  });

  // Basic properties endpoint for map functionality
  app.get("/api/properties", isAuthenticated, async (req, res) => {
    try {
      const { location } = req.query;
      
      if (!location) {
        return res.json([]);
      }

      const results = await apiIntegrationService.searchProperties({
        location: location as string,
      });

      res.json(results);
    } catch (error) {
      console.error("Property search error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Property Search API Integration
  app.get("/api/properties/search", isAuthenticated, async (req, res) => {
    try {
      const { location, minPrice, maxPrice, propertyType, bedrooms, bathrooms } = req.query;
      
      const results = await apiIntegrationService.searchProperties({
        location: location as string,
        minPrice: minPrice ? parseInt(minPrice as string) : undefined,
        maxPrice: maxPrice ? parseInt(maxPrice as string) : undefined,
        propertyType: propertyType as string,
        bedrooms: bedrooms ? parseInt(bedrooms as string) : undefined,
        bathrooms: bathrooms ? parseInt(bathrooms as string) : undefined,
      });

      res.json(results);
    } catch (error) {
      console.error("Property search error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Property Location/Geocoding API
  app.post("/api/properties/geocode", isAuthenticated, async (req, res) => {
    try {
      const { address } = req.body;
      if (!address) {
        return res.status(400).json({ error: "Address is required" });
      }

      const location = await apiIntegrationService.getPropertyLocation(address);
      res.json(location);
    } catch (error) {
      console.error("Geocoding error:", error);
      res.status(500).json({ error: (error as Error).message });
    }
  });

  // Property Research specific endpoints
  app.post("/api/property/geocode", isAuthenticated, async (req, res) => {
    try {
      const { address } = req.body;
      if (!address) {
        return res.status(400).json({ error: "Address is required" });
      }

      const location = await apiIntegrationService.getPropertyLocation(address);
      res.json(location);
    } catch (error) {
      console.error("Geocoding error:", error);
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.post("/api/property/parcel", isAuthenticated, async (req, res) => {
    try {
      const { latitude, longitude } = req.body;
      if (!latitude || !longitude) {
        return res.status(400).json({ error: "Latitude and longitude are required" });
      }

      const parcelData = await apiIntegrationService.getParcelData(latitude, longitude);
      res.json(parcelData);
    } catch (error) {
      console.error("Parcel data error:", error);
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.post("/api/property/ownership-history", isAuthenticated, async (req, res) => {
    try {
      const { parcelId } = req.body;
      if (!parcelId) {
        return res.status(400).json({ error: "Parcel ID is required" });
      }

      const history = await apiIntegrationService.getOwnershipHistory(parcelId);
      res.json(history);
    } catch (error) {
      console.error("Ownership history error:", error);
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.post("/api/property/nearby", async (req, res) => {
    try {
      const { latitude, longitude, radius = 1000 } = req.body;
      if (!latitude || !longitude) {
        return res.status(400).json({ error: "Latitude and longitude are required" });
      }

      const nearby = await apiIntegrationService.getNearbyProperties(latitude, longitude, radius);
      res.json(nearby);
    } catch (error) {
      console.error("Nearby properties error:", error);
      res.status(500).json({ error: (error as Error).message });
    }
  });

  // Public Records Monitoring for Commission Breach Detection
  app.post("/api/monitor-public-records", isAuthenticated, async (req: any, res) => {
    try {
      const agentId = req.user.claims.sub;
      const { clientName, contractStartDate, contractEndDate } = req.body;

      if (!clientName || !contractStartDate || !contractEndDate) {
        return res.status(400).json({ error: "Client name and contract dates are required" });
      }

      const results = await apiIntegrationService.monitorPublicRecords(
        clientName, 
        contractStartDate, 
        contractEndDate, 
        agentId
      );

      // Auto-create breach alerts if found
      if (results.scanResults?.breachRecords?.length > 0) {
        for (const breach of results.scanResults.breachRecords) {
          await storage.createAlert({
            agentId,
            contractId: null, // Will need to match with actual contract
            clientId: null,
            type: "breach",
            title: "Commission Breach Detected - Unauthorized Purchase",
            description: `${clientName} purchased ${breach.propertyAddress} for $${breach.salePrice.toLocaleString()} on ${breach.saleDate} using ${breach.buyerAgent} instead of contracted agent. Estimated lost commission: $${breach.estimatedLostCommission.toLocaleString()}.`,
            severity: "high",
            isRead: false
          });
        }
      }

      res.json(results);
    } catch (error) {
      console.error("Public records monitoring error:", error);
      res.status(500).json({ error: "Failed to monitor public records" });
    }
  });

  // Property pins endpoints
  app.get("/api/property-pins", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      // For now, return empty array - this would connect to database
      res.json([]);
    } catch (error) {
      console.error("Get property pins error:", error);
      res.status(500).json({ error: "Failed to fetch property pins" });
    }
  });

  app.post("/api/property-pins", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const pinData = req.body;
      
      // Here you would save to database
      // For demo, we'll just return success
      res.json({ 
        success: true, 
        message: "Property pin saved successfully",
        pin: { ...pinData, id: Date.now(), userId }
      });
    } catch (error) {
      console.error("Save property pin error:", error);
      res.status(500).json({ error: "Failed to save property pin" });
    }
  });

  // Nearby Properties API
  app.get("/api/properties/nearby", isAuthenticated, async (req, res) => {
    try {
      const { lat, lng, radius } = req.query;
      if (!lat || !lng) {
        return res.status(400).json({ error: "Latitude and longitude are required" });
      }

      const result = await apiIntegrationService.getNearbyProperties(
        parseFloat(lat as string),
        parseFloat(lng as string),
        radius ? parseInt(radius as string) : 1000
      );
      res.json(result);
    } catch (error) {
      console.error("Nearby properties error:", error);
      res.status(500).json({ error: (error as Error).message });
    }
  });

  // Property Valuation API
  app.post("/api/properties/valuation", isAuthenticated, async (req, res) => {
    try {
      const { address } = req.body;
      if (!address) {
        return res.status(400).json({ error: "Address is required" });
      }

      const valuation = await apiIntegrationService.getPropertyValuation(address);
      res.json(valuation);
    } catch (error) {
      console.error("Valuation error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Market Data API
  app.get("/api/market-data/:location", isAuthenticated, async (req, res) => {
    try {
      const { location } = req.params;
      const marketData = await apiIntegrationService.getMarketData(location);
      res.json(marketData);
    } catch (error) {
      console.error("Market data error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Lead Generation API
  app.post("/api/leads/generate", isAuthenticated, async (req, res) => {
    try {
      const { location, priceRange, propertyType } = req.body;
      
      const leads = await apiIntegrationService.generateLeads({
        location,
        priceRange,
        propertyType
      });

      res.json(leads);
    } catch (error) {
      console.error("Lead generation error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Nassau County Public Records API
  app.post("/api/public-records/nassau", isAuthenticated, async (req, res) => {
    try {
      const { clientName, startDate, endDate } = req.body;
      
      if (!clientName || !startDate || !endDate) {
        return res.status(400).json({ 
          error: "Client name, start date, and end date are required" 
        });
      }

      const nassauApiKey = process.env.NASSAU_COUNTY_API_KEY;
      const records = await apiIntegrationService.searchNassauCountyRecords(
        clientName, 
        new Date(startDate), 
        new Date(endDate), 
        nassauApiKey
      );

      res.json({
        success: true,
        county: "Nassau County",
        clientName,
        searchPeriod: { startDate, endDate },
        recordsFound: records.length,
        records,
        apiKeyConfigured: !!nassauApiKey,
        sources: records.map(r => r.source).filter((v, i, a) => a.indexOf(v) === i)
      });
    } catch (error) {
      console.error("Nassau County records error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Suffolk County Public Records API
  app.post("/api/public-records/suffolk", isAuthenticated, async (req, res) => {
    try {
      const { clientName, startDate, endDate } = req.body;
      
      if (!clientName || !startDate || !endDate) {
        return res.status(400).json({ 
          error: "Client name, start date, and end date are required" 
        });
      }

      const suffolkApiKey = process.env.SUFFOLK_COUNTY_API_KEY;
      const records = await apiIntegrationService.searchSuffolkCountyRecords(
        clientName, 
        new Date(startDate), 
        new Date(endDate), 
        suffolkApiKey
      );

      res.json({
        success: true,
        county: "Suffolk County",
        clientName,
        searchPeriod: { startDate, endDate },
        recordsFound: records.length,
        records,
        apiKeyConfigured: !!suffolkApiKey,
        sources: records.map(r => r.source).filter((v, i, a) => a.indexOf(v) === i)
      });
    } catch (error) {
      console.error("Suffolk County records error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Combined Nassau & Suffolk County Public Records Search
  app.post("/api/public-records/search", isAuthenticated, async (req, res) => {
    try {
      const { clientName, startDate, endDate, agentId } = req.body;
      
      if (!clientName || !startDate || !endDate) {
        return res.status(400).json({ 
          error: "Client name, start date, and end date are required" 
        });
      }

      const userAgentId = agentId || req.user.claims.sub;
      
      // Use the existing comprehensive monitoring function
      const monitoring = await apiIntegrationService.monitorPublicRecords(
        clientName, 
        startDate, 
        endDate, 
        userAgentId
      );

      res.json({
        success: true,
        clientName,
        searchPeriod: { startDate, endDate },
        monitoring,
        apiKeysConfigured: {
          nassau: !!process.env.NASSAU_COUNTY_API_KEY,
          suffolk: !!process.env.SUFFOLK_COUNTY_API_KEY
        }
      });
    } catch (error) {
      console.error("Combined public records search error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Nearby Properties API
  app.get("/api/properties/nearby", isAuthenticated, async (req, res) => {
    try {
      const { lat, lng, radius } = req.query;
      
      if (!lat || !lng) {
        return res.status(400).json({ error: "Latitude and longitude are required" });
      }

      const nearby = await apiIntegrationService.getNearbyProperties(
        parseFloat(lat as string),
        parseFloat(lng as string),
        radius ? parseInt(radius as string) : 1000
      );
      
      res.json(nearby);
    } catch (error) {
      console.error("Nearby properties error:", error);
      res.status(500).json({ error: (error as Error).message });
    }
  });

  // Distance Matrix API
  app.post("/api/properties/distance", isAuthenticated, async (req, res) => {
    try {
      const { origins, destinations } = req.body;
      
      if (!origins || !destinations) {
        return res.status(400).json({ error: "Origins and destinations are required" });
      }

      const distances = await apiIntegrationService.getDistanceMatrix(origins, destinations);
      res.json(distances);
    } catch (error) {
      console.error("Distance calculation error:", error);
      res.status(500).json({ error: (error as Error).message });
    }
  });

  // Regrid Parcel Data API by coordinates
  app.get("/api/parcels/coordinates", isAuthenticated, async (req, res) => {
    try {
      const { lat, lng } = req.query;
      
      if (!lat || !lng) {
        return res.status(400).json({ error: "Latitude and longitude are required" });
      }

      const parcelData = await apiIntegrationService.getParcelData(
        parseFloat(lat as string),
        parseFloat(lng as string)
      );
      
      // Provide honest feedback about data limitations
      if (!parcelData.success && parcelData.error?.includes("No parcel data found")) {
        res.json({
          success: false,
          error: "No property records found in database",
          explanation: "Property databases have limited geographic coverage. This location may not have comprehensive records available.",
          apiStatus: "Connected successfully to Regrid API",
          dataAvailability: "Limited coverage for this specific location",
          recommendation: "Property data coverage varies significantly by region and property type"
        });
      } else {
        res.json(parcelData);
      }
    } catch (error) {
      console.error("Parcel data error:", error);
      res.status(500).json({ error: (error as Error).message });
    }
  });

  // Regrid Parcel Data API by address
  app.post("/api/parcels/address", isAuthenticated, async (req, res) => {
    try {
      const { address } = req.body;
      
      if (!address) {
        return res.status(400).json({ error: "Address is required" });
      }

      const parcelData = await apiIntegrationService.getParcelByAddress(address);
      res.json(parcelData);
    } catch (error) {
      console.error("Parcel address lookup error:", error);
      res.status(500).json({ error: (error as Error).message });
    }
  });

  // Regrid Ownership History API
  app.get("/api/parcels/:parcelId/ownership", isAuthenticated, async (req, res) => {
    try {
      const { parcelId } = req.params;
      
      const ownershipHistory = await apiIntegrationService.getOwnershipHistory(parcelId);
      res.json(ownershipHistory);
    } catch (error) {
      console.error("Ownership history error:", error);
      res.status(500).json({ error: (error as Error).message });
    }
  });

  // Public Records Monitoring API
  app.post("/api/monitoring/start", isAuthenticated, async (req, res) => {
    try {
      const { propertyAddress, clientId } = req.body;
      
      const monitoring = await apiIntegrationService.monitorPublicRecords(propertyAddress, clientId);
      res.json(monitoring);
    } catch (error) {
      console.error("Monitoring error:", error);
      res.status(500).json({ error: (error as Error).message });
    }
  });

  // RentCast API endpoints
  app.post("/api/rentcast/search", isAuthenticatedOrDemo, async (req: any, res) => {
    try {
      const filters = req.body;
      const result = await apiIntegrationService.searchRentalProperties(filters);
      res.json(result);
    } catch (error) {
      console.error("Error searching rental properties:", error);
      res.status(500).json({ message: "Failed to search rental properties" });
    }
  });

  app.post("/api/rentcast/property-details", isAuthenticatedOrDemo, async (req: any, res) => {
    try {
      const { address } = req.body;
      const result = await apiIntegrationService.getRentCastPropertyDetails(address);
      res.json(result);
    } catch (error) {
      console.error("Error fetching property details:", error);
      res.status(500).json({ message: "Failed to fetch property details" });
    }
  });

  app.post("/api/rentcast/rent-estimate", isAuthenticatedOrDemo, async (req: any, res) => {
    try {
      const { address } = req.body;
      const result = await apiIntegrationService.getRentEstimate(address);
      res.json(result);
    } catch (error) {
      console.error("Error fetching rent estimate:", error);
      res.status(500).json({ message: "Failed to fetch rent estimate" });
    }
  });

  app.post("/api/rentcast/market-data", isAuthenticatedOrDemo, async (req: any, res) => {
    try {
      const { city, state } = req.body;
      const result = await apiIntegrationService.getRentCastMarketData(city, state);
      res.json(result);
    } catch (error) {
      console.error("Error fetching market data:", error);
      res.status(500).json({ message: "Failed to fetch market data" });
    }
  });

  // File serving route
  app.get("/uploads/:filename", (req, res) => {
    const { filename } = req.params;
    const filePath = path.join(uploadDir, filename);
    
    if (fs.existsSync(filePath)) {
      res.sendFile(filePath);
    } else {
      res.status(404).json({ message: "File not found" });
    }
  });

  // Demo data route for testing
  app.post("/api/demo-data", isAuthenticated, async (req: any, res) => {
    try {
      const agentId = req.user.claims.sub;
      
      // Create sample client
      const sampleClient = await storage.createClient({
        agentId,
        fullName: "John & Sarah Smith",
        email: "smiths@email.com",
        phone: "(555) 123-4567",
      });

      // Create sample contract
      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 6); // 6 months from now

      const sampleContract = await storage.createContract({
        clientId: sampleClient.id,
        agentId,
        representationType: "buyer",
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        contractFileUrl: null,
        contractFileName: null,
      });

      // Create sample alert
      await storage.createAlert({
        agentId,
        contractId: sampleContract.id,
        clientId: sampleClient.id,
        type: "expiration",
        title: "Contract Expiring Soon",
        description: `Your representation agreement with ${sampleClient.fullName} expires in 30 days. Consider reaching out to discuss renewal.`,
        severity: "medium",
      });

      res.json({ message: "Demo data created successfully" });
    } catch (error) {
      console.error("Error creating demo data:", error);
      res.status(500).json({ message: "Failed to create demo data" });
    }
  });

  // Property pins routes
  app.post("/api/property-pins", isAuthenticated, async (req, res) => {
    try {
      const agentId = req.user.claims.sub;
      const pinData = { ...req.body, agentId };
      
      // For now, just return success - in a real app you'd save to database
      res.json({ message: "Property pin saved successfully", data: pinData });
    } catch (error) {
      console.error("Error saving property pin:", error);
      res.status(500).json({ message: "Failed to save property pin" });
    }
  });

  app.get("/api/property-pins", isAuthenticated, async (req, res) => {
    try {
      const agentId = req.user.claims.sub;
      
      // For now, return empty array - in a real app you'd fetch from database
      res.json([]);
    } catch (error) {
      console.error("Error fetching property pins:", error);
      res.status(500).json({ message: "Failed to fetch property pins" });
    }
  });

  // AI-powered contract analysis
  app.post("/api/ai/analyze-contract", isAuthenticated, async (req: any, res) => {
    try {
      const { contractText, contractId } = req.body;
      
      if (!contractText) {
        return res.status(400).json({ message: "Contract text is required" });
      }

      const analysis = await aiService.analyzeContract(contractText);
      
      // Create an alert if high risk is detected
      if (analysis.riskLevel === "high" && contractId) {
        const agentId = req.user.claims.sub;
        const contract = await storage.getContract(contractId);
        
        if (contract) {
          await storage.createAlert({
            agentId,
            contractId,
            clientId: contract.clientId,
            type: "ai_analysis",
            title: "High Risk Contract Detected",
            description: `AI analysis detected high-risk factors: ${analysis.riskFactors.join(", ")}`,
            severity: "high",
          });
        }
      }

      res.json(analysis);
    } catch (error) {
      console.error("Contract analysis error:", error);
      res.status(500).json({ message: "Failed to analyze contract" });
    }
  });

  // AI commission protection recommendations
  app.post("/api/ai/commission-recommendations", isAuthenticated, async (req: any, res) => {
    try {
      const contractData = req.body;
      const recommendations = await aiService.generateCommissionRecommendations(contractData);
      
      res.json(recommendations);
    } catch (error) {
      console.error("Recommendation generation error:", error);
      res.status(500).json({ message: "Failed to generate recommendations" });
    }
  });

  // AI alert prioritization
  app.post("/api/ai/prioritize-alerts", isAuthenticated, async (req: any, res) => {
    try {
      const agentId = req.user.claims.sub;
      const alerts = await storage.getAlertsByAgent(agentId);
      
      const prioritizedAlerts = await aiService.prioritizeAlerts(alerts);
      
      res.json(prioritizedAlerts);
    } catch (error) {
      console.error("Alert prioritization error:", error);
      res.status(500).json({ message: "Failed to prioritize alerts" });
    }
  });

  // AI market trend analysis
  app.post("/api/ai/market-analysis", isAuthenticated, async (req: any, res) => {
    try {
      const propertyData = req.body;
      const analysis = await aiService.analyzeMarketTrends(propertyData);
      
      res.json(analysis);
    } catch (error) {
      console.error("Market analysis error:", error);
      res.status(500).json({ message: "Failed to analyze market trends" });
    }
  });

  // AI legal document analysis
  app.post("/api/ai/legal-analysis", isAuthenticated, async (req: any, res) => {
    try {
      const { documentText, documentType } = req.body;
      
      if (!documentText || !documentType) {
        return res.status(400).json({ message: "Document text and type are required" });
      }

      const analysis = await aiService.analyzeLegalDocument(documentText, documentType);
      
      res.json(analysis);
    } catch (error) {
      console.error("Legal document analysis error:", error);
      res.status(500).json({ message: "Failed to analyze legal document" });
    }
  });

  // Enhanced property valuation and analytics
  app.post("/api/properties/valuation-trends", isAuthenticated, async (req: any, res) => {
    try {
      const { address } = req.body;
      
      if (!address) {
        return res.status(400).json({ message: "Property address is required" });
      }

      const trends = await enhancedPropertyService.getPropertyValuationTrends(address);
      res.json(trends);
    } catch (error) {
      console.error("Property valuation trends error:", error);
      res.status(500).json({ message: "Failed to get property valuation trends" });
    }
  });

  app.post("/api/properties/compare", isAuthenticated, async (req: any, res) => {
    try {
      const { addresses } = req.body;
      
      if (!addresses || addresses.length < 2) {
        return res.status(400).json({ message: "At least 2 property addresses are required" });
      }

      const comparison = await enhancedPropertyService.compareProperties(addresses);
      res.json(comparison);
    } catch (error) {
      console.error("Property comparison error:", error);
      res.status(500).json({ message: "Failed to compare properties" });
    }
  });

  app.post("/api/rental-market/analyze", isAuthenticated, async (req: any, res) => {
    try {
      const { location } = req.body;
      
      if (!location) {
        return res.status(400).json({ message: "Location is required" });
      }

      const analysis = await enhancedPropertyService.analyzeRentalMarket(location);
      res.json(analysis);
    } catch (error) {
      console.error("Rental market analysis error:", error);
      res.status(500).json({ message: "Failed to analyze rental market" });
    }
  });

  app.post("/api/portfolio/analyze", isAuthenticated, async (req: any, res) => {
    try {
      const { properties } = req.body;
      
      if (!properties || properties.length === 0) {
        return res.status(400).json({ message: "Properties data is required" });
      }

      const analysis = await enhancedPropertyService.analyzePortfolioPerformance(properties);
      res.json(analysis);
    } catch (error) {
      console.error("Portfolio analysis error:", error);
      res.status(500).json({ message: "Failed to analyze portfolio" });
    }
  });

  // Audit log routes
  app.get("/api/audit-logs", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const logs = await storage.getAuditLogsByUser(userId);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching audit logs:", error);
      res.status(500).json({ message: "Failed to fetch audit logs" });
    }
  });

  // Admin routes use the isAdmin middleware defined above

  app.get("/api/admin/stats", isAdmin, async (req: any, res) => {
    try {
      const stats = await storage.getAdminStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ message: "Failed to fetch admin stats" });
    }
  });

  app.get("/api/admin/users", isAdmin, async (req: any, res) => {
    try {
      const users = await storage.getAllUsersWithSubscriptions();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.get("/api/admin/payments", isAdmin, async (req: any, res) => {
    try {
      const payments = await storage.getAllPayments();
      res.json(payments);
    } catch (error) {
      console.error("Error fetching payments:", error);
      res.status(500).json({ message: "Failed to fetch payments" });
    }
  });

  // Additional admin routes for stats and payments
  app.get("/api/admin/stats", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const stats = await storage.getAdminStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ message: "Failed to fetch admin stats" });
    }
  });

  app.get("/api/admin/payments", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const payments = await storage.getAllPayments();
      res.json(payments);
    } catch (error) {
      console.error("Error fetching payments:", error);
      res.status(500).json({ message: "Failed to fetch payments" });
    }
  });

  // Emergency admin promotion endpoint (remove after setup)
  app.post("/api/promote-admin", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Promote current user to admin
      const user = await storage.updateUserRole(userId, "admin");
      
      res.json({ 
        message: "User promoted to admin successfully",
        user: {
          id: user.id,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      console.error("Error promoting user to admin:", error);
      res.status(500).json({ message: "Failed to promote user to admin" });
    }
  });

  // ShowingTime Integration Routes
  app.post("/api/integrations/showingtime/sync", isAuthenticated, async (req: any, res) => {
    try {
      const agentId = req.user.claims.sub;
      const user = await storage.getUser(agentId);
      
      if (!user?.email) {
        return res.status(400).json({ 
          message: "Agent email not found. Please update your profile." 
        });
      }

      const { showingTimeService } = await import('./showingTimeService');
      const results = await showingTimeService.syncAppointments(user.email, agentId);
      
      res.json({
        success: true,
        message: `Sync completed. Imported: ${results.imported}, Updated: ${results.updated}`,
        results
      });
    } catch (error: any) {
      console.error("ShowingTime sync error:", error);
      res.status(500).json({ 
        message: "Failed to sync with ShowingTime", 
        error: error.message 
      });
    }
  });

  app.get("/api/integrations/showingtime/status", isAuthenticated, async (req: any, res) => {
    try {
      const agentId = req.user.claims.sub;
      const user = await storage.getUser(agentId);
      
      if (!user?.email) {
        return res.status(400).json({ 
          message: "Agent email not found" 
        });
      }

      const { showingTimeService } = await import('./showingTimeService');
      const isConnected = await showingTimeService.testConnection(user.email);
      const stats = await storage.getShowingTimeIntegrationStats(agentId);
      
      res.json({
        connected: isConnected,
        agentEmail: user.email,
        ...stats
      });
    } catch (error: any) {
      console.error("ShowingTime status check error:", error);
      res.status(500).json({ 
        message: "Failed to check ShowingTime status",
        error: error.message
      });
    }
  });

  app.get("/api/integrations/showingtime/appointments", isAuthenticated, async (req: any, res) => {
    try {
      const agentId = req.user.claims.sub;
      const user = await storage.getUser(agentId);
      
      if (!user?.email) {
        return res.status(400).json({ 
          message: "Agent email not found" 
        });
      }

      const { startDate, endDate } = req.query;
      const { showingTimeService } = await import('./showingTimeService');
      
      const appointments = await showingTimeService.getAppointments(
        user.email,
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined
      );
      
      res.json(appointments);
    } catch (error: any) {
      console.error("ShowingTime appointments fetch error:", error);
      res.status(500).json({ 
        message: "Failed to fetch ShowingTime appointments",
        error: error.message 
      });
    }
  });

  app.post("/api/integrations/showingtime/import/:appointmentId", isAuthenticated, async (req: any, res) => {
    try {
      const agentId = req.user.claims.sub;
      const { appointmentId } = req.params;
      
      const user = await storage.getUser(agentId);
      if (!user?.email) {
        return res.status(400).json({ 
          message: "Agent email not found" 
        });
      }

      const { showingTimeService } = await import('./showingTimeService');
      const appointments = await showingTimeService.getAppointments(user.email);
      const appointment = appointments.find(apt => apt.id === appointmentId);
      
      if (!appointment) {
        return res.status(404).json({ 
          message: "Appointment not found in ShowingTime" 
        });
      }

      const showing = await storage.createOrUpdateShowingFromShowingTime(appointment, agentId);
      
      res.json({
        success: true,
        message: "Appointment imported successfully",
        showing
      });
    } catch (error: any) {
      console.error("ShowingTime import error:", error);
      res.status(500).json({ 
        message: "Failed to import appointment",
        error: error.message 
      });
    }
  });

  // Functionality testing endpoint
  app.get("/api/test/functionality", isAuthenticated, async (req: any, res) => {
    try {
      const testResults = {
        auth: true,
        database: true,
        contracts: false,
        clients: false,
        alerts: false,
        apiIntegrations: false
      };

      // Test contract functionality
      try {
        const userId = req.user.claims.sub;
        await storage.getContractsByAgent(userId);
        testResults.contracts = true;
      } catch (error) {
        console.error("Contract test failed:", error);
      }

      // Test client functionality
      try {
        const userId = req.user.claims.sub;
        await storage.getClientsByAgent(userId);
        testResults.clients = true;
      } catch (error) {
        console.error("Client test failed:", error);
      }

      // Test alerts functionality
      try {
        const userId = req.user.claims.sub;
        await storage.getAlertsByAgent(userId);
        testResults.alerts = true;
      } catch (error) {
        console.error("Alerts test failed:", error);
      }

      // Test API integrations
      try {
        const testAddress = "123 Main St, New York, NY";
        await apiIntegrationService.getPropertyLocation(testAddress);
        testResults.apiIntegrations = true;
      } catch (error) {
        console.error("API integration test failed:", error);
      }

      res.json(testResults);
    } catch (error) {
      console.error("Functionality test error:", error);
      res.status(500).json({ message: "Failed to run functionality tests" });
    }
  });

  // Property tracking and commission protection routes
  
  // Property routes
  app.post("/api/properties", isAuthenticatedOrDemo, async (req: any, res) => {
    try {
      const propertyData = insertPropertySchema.parse(req.body);
      const property = await storage.createProperty(propertyData);
      res.json(property);
    } catch (error) {
      console.error("Error creating property:", error);
      res.status(500).json({ message: "Failed to create property" });
    }
  });

  app.get("/api/properties", isAuthenticatedOrDemo, async (req: any, res) => {
    try {
      const agentId = req.user.claims.sub;
      const properties = await storage.getPropertiesByAgent(agentId);
      res.json(properties);
    } catch (error) {
      console.error("Error fetching properties:", error);
      res.status(500).json({ message: "Failed to fetch properties" });
    }
  });

  app.get("/api/properties/search", isAuthenticatedOrDemo, async (req: any, res) => {
    try {
      const { address, city, priceMin, priceMax } = req.query;
      const criteria = {
        address: address ? String(address) : undefined,
        city: city ? String(city) : undefined,
        priceMin: priceMin ? Number(priceMin) : undefined,
        priceMax: priceMax ? Number(priceMax) : undefined,
      };
      const properties = await storage.searchProperties(criteria);
      res.json(properties);
    } catch (error) {
      console.error("Error searching properties:", error);
      res.status(500).json({ message: "Failed to search properties" });
    }
  });

  // Showing routes
  app.post("/api/showings", isAuthenticatedOrDemo, async (req: any, res) => {
    try {
      const agentId = req.user.claims.sub;
      
      // Debug: Log the incoming request data
      console.log("Raw request body:", JSON.stringify(req.body, null, 2));
      
      // Convert date strings to Date objects
      const requestData = { ...req.body, agentId };
      
      // More thorough date conversion
      if (requestData.scheduledDate) {
        console.log("Converting scheduledDate:", requestData.scheduledDate, typeof requestData.scheduledDate);
        if (typeof requestData.scheduledDate === 'string') {
          // Handle both ISO strings and datetime-local format
          let dateToConvert = requestData.scheduledDate;
          
          // If it's a datetime-local format (YYYY-MM-DDTHH:mm), append seconds and timezone
          if (dateToConvert.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/)) {
            dateToConvert = dateToConvert + ':00.000Z';
          }
          
          const parsedDate = new Date(dateToConvert);
          // Validate the date is valid
          if (isNaN(parsedDate.getTime())) {
            throw new Error(`Invalid scheduledDate: ${requestData.scheduledDate}`);
          }
          requestData.scheduledDate = parsedDate;
        }
        console.log("Converted scheduledDate:", requestData.scheduledDate);
      }
      
      if (requestData.actualStartTime && typeof requestData.actualStartTime === 'string') {
        requestData.actualStartTime = new Date(requestData.actualStartTime);
      }
      if (requestData.actualEndTime && typeof requestData.actualEndTime === 'string') {
        requestData.actualEndTime = new Date(requestData.actualEndTime);
      }
      
      console.log("Final request data before schema validation:", JSON.stringify(requestData, null, 2));
      
      const showingData = insertShowingSchema.parse(requestData);
      const showing = await storage.createShowing(showingData);
      
      // Schedule automated reminders (24 hours and 1 hour before showing)
      try {
        await notificationService.scheduleShowingReminders(
          showing.id, 
          agentId, 
          showing.clientId, 
          showing.scheduledDate
        );
      } catch (error) {
        console.error("Error scheduling reminders:", error);
        // Don't fail the showing creation if reminder scheduling fails
      }
      
      // Create calendar event in external calendars
      try {
        await calendarService.createCalendarEvent(showing.id, agentId);
      } catch (error) {
        console.error("Error creating calendar event:", error);
        // Don't fail the showing creation if calendar sync fails
      }
      
      res.json(showing);
    } catch (error) {
      console.error("Error creating showing:", error);
      if (error instanceof Error) {
        console.error("Error details:", error.message);
        console.error("Error stack:", error.stack);
      }
      res.status(500).json({ message: "Failed to create showing" });
    }
  });

  app.get("/api/showings", isAuthenticatedOrDemo, async (req: any, res) => {
    try {
      const agentId = req.user.claims.sub;
      const showings = await storage.getShowingsByAgent(agentId);
      
      // Auto-update showing statuses based on scheduled dates
      const now = new Date();
      const updatedShowings = [];
      
      for (const showing of showings) {
        let updatedShowing = showing;
        const scheduledDate = new Date(showing.scheduledDate);
        
        // If showing is past scheduled time and still "scheduled", mark as missed
        if (showing.status === "scheduled" && scheduledDate < now) {
          const timePassed = now.getTime() - scheduledDate.getTime();
          const hoursPassedMillis = 2 * 60 * 60 * 1000; // 2 hours in milliseconds
          
          if (timePassed > hoursPassedMillis) {
            // Auto-mark as no-show if more than 2 hours past scheduled time
            updatedShowing = await storage.updateShowing(showing.id, { 
              status: "no-show" 
            });
            
            // Create property visit record for missed showing
            await storage.createPropertyVisit({
              agentId,
              clientId: showing.clientId,
              propertyId: showing.propertyId,
              visitDate: scheduledDate,
              visitType: "missed-showing",
              duration: "0",
              agentPresent: true, // Agent was present, client missed
              wasScheduled: true,
              showingId: showing.id,
              discoveryMethod: "auto-detected",
              riskLevel: "high",
              followUpRequired: true,
              notes: "Automatically detected missed showing - agent was present but client did not attend scheduled appointment"
            });
          }
        }
        
        updatedShowings.push(updatedShowing);
      }
      
      res.json(updatedShowings);
    } catch (error) {
      console.error("Error fetching showings:", error);
      res.status(500).json({ message: "Failed to fetch showings" });
    }
  });

  app.get("/api/showings/upcoming", isAuthenticatedOrDemo, async (req: any, res) => {
    try {
      const agentId = req.user.claims.sub;
      const showings = await storage.getUpcomingShowings(agentId);
      res.json(showings);
    } catch (error) {
      console.error("Error fetching upcoming showings:", error);
      res.status(500).json({ message: "Failed to fetch upcoming showings" });
    }
  });

  app.put("/api/showings/:id", isAuthenticatedOrDemo, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = { ...req.body };
      
      // Convert date strings to Date objects if present
      if (updates.actualStartTime && typeof updates.actualStartTime === 'string') {
        updates.actualStartTime = new Date(updates.actualStartTime);
      }
      if (updates.actualEndTime && typeof updates.actualEndTime === 'string') {
        updates.actualEndTime = new Date(updates.actualEndTime);
      }
      if (updates.scheduledDate && typeof updates.scheduledDate === 'string') {
        updates.scheduledDate = new Date(updates.scheduledDate);
      }
      
      const showing = await storage.updateShowing(id, updates);
      res.json(showing);
    } catch (error) {
      console.error("Error updating showing:", error);
      res.status(500).json({ message: "Failed to update showing" });
    }
  });

  app.patch("/api/showings/:id", isAuthenticatedOrDemo, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = { ...req.body };
      
      // Convert date strings to Date objects if present
      if (updates.actualStartTime && typeof updates.actualStartTime === 'string') {
        updates.actualStartTime = new Date(updates.actualStartTime);
      }
      if (updates.actualEndTime && typeof updates.actualEndTime === 'string') {
        updates.actualEndTime = new Date(updates.actualEndTime);
      }
      if (updates.scheduledDate && typeof updates.scheduledDate === 'string') {
        updates.scheduledDate = new Date(updates.scheduledDate);
      }
      
      const showing = await storage.updateShowing(id, updates);
      res.json(showing);
    } catch (error) {
      console.error("Error updating showing:", error);
      res.status(500).json({ message: "Failed to update showing" });
    }
  });

  // Location tracking routes
  app.post("/api/location-tracking", isAuthenticatedOrDemo, async (req: any, res) => {
    try {
      const agentId = req.user.claims.sub;
      const locationData = insertLocationTrackingSchema.parse({ ...req.body, agentId });
      const location = await storage.createLocationTracking(locationData);
      res.json(location);
    } catch (error) {
      console.error("Error creating location tracking:", error);
      res.status(500).json({ message: "Failed to create location tracking" });
    }
  });

  app.get("/api/location-tracking/showing/:showingId", isAuthenticatedOrDemo, async (req: any, res) => {
    try {
      const showingId = parseInt(req.params.showingId);
      const locations = await storage.getLocationTrackingByShowing(showingId);
      res.json(locations);
    } catch (error) {
      console.error("Error fetching location tracking:", error);
      res.status(500).json({ message: "Failed to fetch location tracking" });
    }
  });

  app.get("/api/location-tracking/off-route/:showingId", isAuthenticatedOrDemo, async (req: any, res) => {
    try {
      const showingId = parseInt(req.params.showingId);
      const radiusMeters = parseInt(req.query.radius as string) || 500;
      const offRouteVisits = await storage.detectOffRouteVisits(showingId, radiusMeters);
      res.json(offRouteVisits);
    } catch (error) {
      console.error("Error detecting off-route visits:", error);
      res.status(500).json({ message: "Failed to detect off-route visits" });
    }
  });

  // Property visit routes
  app.post("/api/property-visits", isAuthenticatedOrDemo, async (req: any, res) => {
    try {
      const agentId = req.user.claims.sub;
      
      // Convert date strings to Date objects
      const requestData = { ...req.body, agentId };
      if (requestData.visitDate && typeof requestData.visitDate === 'string') {
        requestData.visitDate = new Date(requestData.visitDate);
      }
      
      const visitData = insertPropertyVisitSchema.parse(requestData);
      const visit = await storage.createPropertyVisit(visitData);
      res.json(visit);
    } catch (error) {
      console.error("Error creating property visit:", error);
      res.status(500).json({ message: "Failed to create property visit" });
    }
  });

  app.get("/api/property-visits", isAuthenticatedOrDemo, async (req: any, res) => {
    try {
      const agentId = req.user.claims.sub;
      const visits = await storage.getPropertyVisitsByAgent(agentId);
      res.json(visits);
    } catch (error) {
      console.error("Error fetching property visits:", error);
      res.status(500).json({ message: "Failed to fetch property visits" });
    }
  });

  app.get("/api/property-visits/unauthorized", isAuthenticatedOrDemo, async (req: any, res) => {
    try {
      const agentId = req.user.claims.sub;
      const unauthorizedVisits = await storage.getUnauthorizedVisits(agentId);
      res.json(unauthorizedVisits);
    } catch (error) {
      console.error("Error fetching unauthorized visits:", error);
      res.status(500).json({ message: "Failed to fetch unauthorized visits" });
    }
  });

  app.get("/api/property-visits/client/:clientId", isAuthenticatedOrDemo, async (req: any, res) => {
    try {
      const clientId = parseInt(req.params.clientId);
      const visits = await storage.getPropertyVisitsByClient(clientId);
      res.json(visits);
    } catch (error) {
      console.error("Error fetching client property visits:", error);
      res.status(500).json({ message: "Failed to fetch client property visits" });
    }
  });

  // Commission protection routes
  app.post("/api/commission-protection", isAuthenticatedOrDemo, async (req: any, res) => {
    try {
      const agentId = req.user.claims.sub;
      
      // Convert date strings to Date objects
      const requestData = { ...req.body, agentId };
      if (requestData.protectionDate && typeof requestData.protectionDate === 'string') {
        requestData.protectionDate = new Date(requestData.protectionDate);
      }
      if (requestData.expirationDate && typeof requestData.expirationDate === 'string') {
        requestData.expirationDate = new Date(requestData.expirationDate);
      }
      
      const protectionData = insertCommissionProtectionSchema.parse(requestData);
      const protection = await storage.createCommissionProtection(protectionData);
      res.json(protection);
    } catch (error) {
      console.error("Error creating commission protection:", error);
      res.status(500).json({ message: "Failed to create commission protection" });
    }
  });

  app.get("/api/commission-protection", isAuthenticatedOrDemo, async (req: any, res) => {
    try {
      const agentId = req.user.claims.sub;
      const protections = await storage.getCommissionProtectionByAgent(agentId);
      res.json(protections);
    } catch (error) {
      console.error("Error fetching commission protections:", error);
      res.status(500).json({ message: "Failed to fetch commission protections" });
    }
  });

  app.get("/api/commission-protection/expiring", isAuthenticatedOrDemo, async (req: any, res) => {
    try {
      const agentId = req.user.claims.sub;
      const daysAhead = parseInt(req.query.days as string) || 30;
      const expiringProtections = await storage.getExpiringProtections(agentId, daysAhead);
      res.json(expiringProtections);
    } catch (error) {
      console.error("Error fetching expiring protections:", error);
      res.status(500).json({ message: "Failed to fetch expiring protections" });
    }
  });

  app.get("/api/commission-protection/property/:propertyId", isAuthenticatedOrDemo, async (req: any, res) => {
    try {
      const propertyId = parseInt(req.params.propertyId);
      const protections = await storage.getCommissionProtectionByProperty(propertyId);
      res.json(protections);
    } catch (error) {
      console.error("Error fetching property commission protections:", error);
      res.status(500).json({ message: "Failed to fetch property commission protections" });
    }
  });

  // Sample data generation for showing tracker
  app.post("/api/demo-showing-data", isAuthenticatedOrDemo, async (req: any, res) => {
    try {
      const agentId = req.user.claims.sub;
      
      // Create sample properties
      const properties = [
        {
          address: "1234 Maple Street",
          city: "Dallas",
          state: "TX",
          zipCode: "75201",
          latitude: "32.7767",
          longitude: "-96.7970",
          price: "450000",
          bedrooms: "3",
          bathrooms: "2",
          squareFeet: "2100",
          propertyType: "single-family",
          listingStatus: "active",
          neighborhood: "Downtown Dallas"
        },
        {
          address: "5678 Oak Avenue",
          city: "Dallas", 
          state: "TX",
          zipCode: "75202",
          latitude: "32.7831",
          longitude: "-96.8067",
          price: "525000",
          bedrooms: "4",
          bathrooms: "3",
          squareFeet: "2450",
          propertyType: "single-family",
          listingStatus: "active",
          neighborhood: "Uptown Dallas"
        },
        {
          address: "9012 Pine Drive",
          city: "Dallas",
          state: "TX", 
          zipCode: "75203",
          latitude: "32.7580",
          longitude: "-96.7856",
          price: "385000",
          bedrooms: "3",
          bathrooms: "2",
          squareFeet: "1850",
          propertyType: "townhouse",
          listingStatus: "active",
          neighborhood: "Bishop Arts District"
        }
      ];

      const createdProperties = [];
      for (const property of properties) {
        const created = await storage.createProperty(property);
        createdProperties.push(created);
      }

      // Get existing client (assuming client ID 1 exists from demo data)
      const client = await storage.getClient(1);
      if (!client) {
        return res.status(400).json({ message: "Please create demo client data first" });
      }

      // Create sample showings
      const now = new Date();
      const showings = [
        {
          agentId,
          clientId: client.id,
          propertyId: createdProperties[0].id,
          scheduledDate: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
          showingType: "scheduled",
          status: "scheduled",
          agentPresent: true,
          commissionProtected: true,
          agentNotes: "Client very interested in this property. Schedule follow-up."
        },
        {
          agentId,
          clientId: client.id,
          propertyId: createdProperties[1].id,
          scheduledDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
          actualStartTime: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          actualEndTime: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000).toISOString(),
          showingType: "scheduled",
          status: "completed",
          agentPresent: true,
          commissionProtected: true,
          clientFeedback: "Loved the open floor plan and neighborhood",
          agentNotes: "Strong interest. Client wants to see similar properties.",
          interestLevel: "high",
          nextSteps: "Schedule second showing and prepare offer strategy"
        }
      ];

      const createdShowings = [];
      for (const showing of showings) {
        const created = await storage.createShowing(showing);
        createdShowings.push(created);
      }

      // Create sample property visits (including unauthorized ones)
      const propertyVisits = [
        {
          agentId,
          clientId: client.id,
          propertyId: createdProperties[2].id,
          visitDate: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
          visitType: "drive-by",
          duration: "15",
          agentPresent: false,
          wasScheduled: false,
          discoveryMethod: "client-report",
          riskLevel: "medium",
          followUpRequired: true,
          notes: "Client mentioned driving by this property after our scheduled showing"
        },
        {
          agentId,
          clientId: client.id,
          propertyId: createdProperties[0].id,
          visitDate: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
          visitType: "walk-by",
          duration: "30",
          agentPresent: false,
          wasScheduled: false,
          discoveryMethod: "gps-tracking",
          riskLevel: "high",
          followUpRequired: true,
          notes: "GPS tracking detected unauthorized visit. Need to establish commission protection immediately."
        }
      ];

      const createdVisits = [];
      for (const visit of propertyVisits) {
        const created = await storage.createPropertyVisit(visit);
        createdVisits.push(created);
      }

      // Create commission protection records
      const protections = [
        {
          agentId,
          clientId: client.id,
          propertyId: createdProperties[0].id,
          protectionType: "showing",
          protectionDate: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(),
          expirationDate: new Date(now.getTime() + 89 * 24 * 60 * 60 * 1000).toISOString(), // 90 days from yesterday
          evidenceType: "gps-tracking",
          evidenceData: { showingId: createdShowings[0].id, locationData: "verified" },
          status: "active",
          notes: "Commission protection established through scheduled showing and GPS verification"
        },
        {
          agentId,
          clientId: client.id,
          propertyId: createdProperties[1].id,
          protectionType: "showing",
          protectionDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          expirationDate: new Date(now.getTime() + 88 * 24 * 60 * 60 * 1000).toISOString(),
          evidenceType: "signed-document",
          evidenceData: { showingId: createdShowings[1].id, signedAgreement: true },
          status: "active",
          notes: "Strong protection with signed buyer agreement and completed showing"
        },
        {
          agentId,
          clientId: client.id,
          propertyId: createdProperties[2].id,
          protectionType: "inquiry",
          protectionDate: new Date().toISOString(),
          expirationDate: new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000).toISOString(),
          evidenceType: "gps-tracking",
          evidenceData: { unauthorizedVisit: true, followUpAction: "immediate protection" },
          status: "active",
          notes: "Emergency commission protection due to unauthorized client visit detected via GPS"
        }
      ];

      const createdProtections = [];
      for (const protection of protections) {
        const created = await storage.createCommissionProtection(protection);
        createdProtections.push(created);
      }

      res.json({
        message: "Sample showing tracker data created successfully",
        data: {
          properties: createdProperties.length,
          showings: createdShowings.length,
          propertyVisits: createdVisits.length,
          commissionProtections: createdProtections.length
        }
      });

    } catch (error) {
      console.error("Error creating demo showing data:", error);
      res.status(500).json({ message: "Failed to create demo showing data" });
    }
  });

  // AI Communication & Drip Campaign routes
  app.post("/api/drip-campaigns", isAuthenticated, async (req: any, res) => {
    try {
      const campaignData = {
        agentId: req.user.id,
        campaignType: req.body.campaignType,
        targetAudience: req.body.targetAudience,
        description: req.body.description
      };
      
      const result = await aiCommunicationService.createDripCampaign(campaignData);
      res.json(result);
    } catch (error: any) {
      console.error("Error creating drip campaign:", error);
      res.status(500).json({ message: error.message || "Failed to create drip campaign" });
    }
  });

  app.get("/api/drip-campaigns", isAuthenticated, async (req: any, res) => {
    try {
      const campaigns = await storage.getDripCampaignsByAgent(req.user.id);
      res.json(campaigns);
    } catch (error: any) {
      console.error("Error fetching drip campaigns:", error);
      res.status(500).json({ message: "Failed to fetch drip campaigns" });
    }
  });

  app.get("/api/drip-campaigns/:id/steps", isAuthenticated, async (req: any, res) => {
    try {
      const steps = await storage.getCampaignSteps(parseInt(req.params.id));
      res.json(steps);
    } catch (error: any) {
      console.error("Error fetching campaign steps:", error);
      res.status(500).json({ message: "Failed to fetch campaign steps" });
    }
  });

  app.post("/api/ai/generate-message", isAuthenticated, async (req: any, res) => {
    try {
      const { messageType, clientId, context } = req.body;
      
      const client = await storage.getClient(clientId);
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }

      const agent = await storage.getUser(req.user.id);
      if (!agent) {
        return res.status(404).json({ message: "Agent not found" });
      }

      const message = await aiCommunicationService.generatePersonalizedMessage(
        messageType,
        client,
        agent,
        context
      );

      res.json(message);
    } catch (error: any) {
      console.error("Error generating AI message:", error);
      res.status(500).json({ message: error.message || "Failed to generate message" });
    }
  });

  app.post("/api/ai/analyze-inquiry", isAuthenticated, async (req: any, res) => {
    try {
      const { inquiryText, clientId } = req.body;
      
      let clientData = null;
      if (clientId) {
        clientData = await storage.getClient(clientId);
      }

      const analysis = await aiCommunicationService.analyzeInquiry(inquiryText, clientData);
      res.json(analysis);
    } catch (error: any) {
      console.error("Error analyzing inquiry:", error);
      res.status(500).json({ message: error.message || "Failed to analyze inquiry" });
    }
  });

  app.post("/api/ai/follow-up-suggestions", isAuthenticated, async (req: any, res) => {
    try {
      const { clientId, context } = req.body;
      
      const client = await storage.getClient(clientId);
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }

      const communications = await storage.getClientCommunications(clientId);
      const suggestions = await aiCommunicationService.generateFollowUpSuggestions(
        client,
        communications,
        context
      );

      res.json(suggestions);
    } catch (error: any) {
      console.error("Error generating follow-up suggestions:", error);
      res.status(500).json({ message: error.message || "Failed to generate suggestions" });
    }
  });

  app.post("/api/ai/conversations", isAuthenticated, async (req: any, res) => {
    try {
      const { conversationType, title, context, initialMessage } = req.body;
      
      const conversation = await aiCommunicationService.createAiConversation(
        req.user.id,
        conversationType,
        title,
        context,
        initialMessage
      );

      res.json(conversation);
    } catch (error: any) {
      console.error("Error creating AI conversation:", error);
      res.status(500).json({ message: error.message || "Failed to create conversation" });
    }
  });

  app.post("/api/ai/conversations/:id/continue", isAuthenticated, async (req: any, res) => {
    try {
      const { message } = req.body;
      const conversationId = parseInt(req.params.id);
      
      const result = await aiCommunicationService.continueAiConversation(conversationId, message);
      res.json(result);
    } catch (error: any) {
      console.error("Error continuing AI conversation:", error);
      res.status(500).json({ message: error.message || "Failed to continue conversation" });
    }
  });

  app.get("/api/ai/conversations", isAuthenticated, async (req: any, res) => {
    try {
      const conversations = await storage.getAiConversationsByAgent(req.user.id);
      res.json(conversations);
    } catch (error: any) {
      console.error("Error fetching AI conversations:", error);
      res.status(500).json({ message: "Failed to fetch conversations" });
    }
  });

  app.post("/api/client-communications", isAuthenticated, async (req: any, res) => {
    try {
      const communicationData = insertClientCommunicationSchema.parse({
        ...req.body,
        agentId: req.user.id
      });
      
      const communication = await storage.createClientCommunication(communicationData);
      res.json(communication);
    } catch (error: any) {
      console.error("Error creating client communication:", error);
      res.status(500).json({ message: "Failed to create communication record" });
    }
  });

  app.get("/api/client-communications/:clientId", isAuthenticated, async (req: any, res) => {
    try {
      const communications = await storage.getClientCommunications(parseInt(req.params.clientId));
      res.json(communications);
    } catch (error: any) {
      console.error("Error fetching client communications:", error);
      res.status(500).json({ message: "Failed to fetch communications" });
    }
  });

  // Contract reminder routes
  app.post("/api/contract-reminders", isAuthenticated, async (req: any, res) => {
    try {
      const reminderData = insertContractReminderSchema.parse({
        ...req.body,
        agentId: req.user.id
      });
      
      const reminder = await storage.createContractReminder(reminderData);
      res.json(reminder);
    } catch (error: any) {
      console.error("Error creating contract reminder:", error);
      res.status(500).json({ message: "Failed to create reminder" });
    }
  });

  app.get("/api/contract-reminders", isAuthenticated, async (req: any, res) => {
    try {
      const reminders = await storage.getContractReminders(req.user.id);
      res.json(reminders);
    } catch (error: any) {
      console.error("Error fetching contract reminders:", error);
      res.status(500).json({ message: "Failed to fetch reminders" });
    }
  });

  app.post("/api/contract-reminders/setup-automated", isAuthenticated, async (req: any, res) => {
    try {
      const agentId = req.user.id;
      
      // Get all active contracts for the agent
      const activeContracts = await storage.getContractsByAgent(agentId);
      const remindersCreated = [];

      for (const contract of activeContracts) {
        if (contract.status === 'active') {
          // Create weekly check-in reminder
          const weeklyReminder = await storage.createContractReminder({
            agentId,
            contractId: contract.id,
            clientId: contract.clientId,
            reminderType: 'weekly_checkin',
            scheduledDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Next week
            isRecurring: true,
            recurringInterval: 7, // Every 7 days
            notificationMethod: 'email',
            priority: 'normal',
            message: `Weekly check-in reminder for client contract expiring on ${contract.endDate}`,
            metadata: {
              contractId: contract.id,
              clientName: 'Client',
              contractEndDate: contract.endDate
            }
          });
          remindersCreated.push(weeklyReminder);

          // Create expiration warning (30 days before)
          const contractEndDate = new Date(contract.endDate);
          const warningDate = new Date(contractEndDate);
          warningDate.setDate(warningDate.getDate() - 30);

          if (warningDate > new Date()) {
            const expirationReminder = await storage.createContractReminder({
              agentId,
              contractId: contract.id,
              clientId: contract.clientId,
              reminderType: 'expiration_warning',
              scheduledDate: warningDate,
              isRecurring: false,
              notificationMethod: 'email',
              priority: 'high',
              message: `Contract expiring in 30 days - renewal action required`,
              metadata: {
                contractId: contract.id,
                clientName: 'Client',
                contractEndDate: contract.endDate,
                daysUntilExpiration: 30
              }
            });
            remindersCreated.push(expirationReminder);
          }

          // Create final expiration warning (7 days before)
          const finalWarningDate = new Date(contractEndDate);
          finalWarningDate.setDate(finalWarningDate.getDate() - 7);

          if (finalWarningDate > new Date()) {
            const finalReminder = await storage.createContractReminder({
              agentId,
              contractId: contract.id,
              clientId: contract.clientId,
              reminderType: 'expiration_warning',
              scheduledDate: finalWarningDate,
              isRecurring: false,
              notificationMethod: 'both',
              priority: 'urgent',
              message: `URGENT: Contract expiring in 7 days - immediate action required`,
              metadata: {
                contractId: contract.id,
                clientName: 'Client',
                contractEndDate: contract.endDate,
                daysUntilExpiration: 7
              }
            });
            remindersCreated.push(finalReminder);
          }
        }
      }

      res.json({
        message: `Successfully set up automated reminders for ${activeContracts.length} active contracts`,
        remindersCreated: remindersCreated.length,
        activeContracts: activeContracts.length
      });
    } catch (error: any) {
      console.error("Error setting up automated reminders:", error);
      res.status(500).json({ message: "Failed to setup automated reminders" });
    }
  });

  app.get("/api/contract-reminders/pending", isAuthenticated, async (req: any, res) => {
    try {
      const pendingReminders = await storage.getPendingReminders();
      res.json(pendingReminders);
    } catch (error: any) {
      console.error("Error fetching pending reminders:", error);
      res.status(500).json({ message: "Failed to fetch pending reminders" });
    }
  });

  app.post("/api/contract-reminders/process", isAuthenticated, async (req: any, res) => {
    try {
      const pendingReminders = await storage.getPendingReminders();
      const processedReminders = [];

      for (const reminder of pendingReminders) {
        try {
          // Send notification based on method
          if (reminder.notificationMethod === 'email' || reminder.notificationMethod === 'both') {
            // Email notification logic would go here
            console.log(`Sending email reminder: ${reminder.message}`);
          }
          
          if (reminder.notificationMethod === 'sms' || reminder.notificationMethod === 'both') {
            // SMS notification logic would go here
            console.log(`Sending SMS reminder: ${reminder.message}`);
          }

          // Update reminder status
          await storage.updateReminderStatus(reminder.id, 'sent', new Date());

          // Schedule next occurrence if recurring
          if (reminder.isRecurring && reminder.recurringInterval) {
            const nextSendDate = new Date();
            nextSendDate.setDate(nextSendDate.getDate() + Number(reminder.recurringInterval));
            await storage.scheduleRecurringReminder(reminder.id, nextSendDate);
          }

          processedReminders.push(reminder);
        } catch (reminderError) {
          console.error(`Failed to process reminder ${reminder.id}:`, reminderError);
          await storage.updateReminderStatus(reminder.id, 'failed');
        }
      }

      res.json({
        message: `Processed ${processedReminders.length} reminders`,
        processedCount: processedReminders.length,
        totalPending: pendingReminders.length
      });
    } catch (error: any) {
      console.error("Error processing reminders:", error);
      res.status(500).json({ message: "Failed to process reminders" });
    }
  });

  // Notification reminder routes
  app.get("/api/notifications/reminders", isAuthenticatedOrDemo, async (req: any, res) => {
    try {
      const agentId = req.user.claims.sub;
      const reminders = await storage.getNotificationRemindersByShowing(agentId);
      res.json(reminders);
    } catch (error: any) {
      console.error("Error fetching reminders:", error);
      res.status(500).json({ message: "Failed to fetch reminders" });
    }
  });

  app.get("/api/notifications/reminders/showing/:showingId", isAuthenticatedOrDemo, async (req: any, res) => {
    try {
      const showingId = parseInt(req.params.showingId);
      const reminders = await storage.getNotificationRemindersByShowing(showingId);
      res.json(reminders);
    } catch (error: any) {
      console.error("Error fetching showing reminders:", error);
      res.status(500).json({ message: "Failed to fetch showing reminders" });
    }
  });

  app.delete("/api/notifications/reminders/showing/:showingId", isAuthenticatedOrDemo, async (req: any, res) => {
    try {
      const showingId = parseInt(req.params.showingId);
      await notificationService.cancelShowingReminders(showingId);
      res.json({ message: "Reminders cancelled successfully" });
    } catch (error: any) {
      console.error("Error cancelling reminders:", error);
      res.status(500).json({ message: "Failed to cancel reminders" });
    }
  });

  // Calendar integration routes
  app.post("/api/calendar/integrations", isAuthenticatedOrDemo, async (req: any, res) => {
    try {
      const agentId = req.user.claims.sub;
      const integrationData = insertCalendarIntegrationSchema.parse({ ...req.body, agentId });
      const integration = await storage.createCalendarIntegration(integrationData);
      res.json(integration);
    } catch (error: any) {
      console.error("Error creating calendar integration:", error);
      res.status(500).json({ message: "Failed to create calendar integration" });
    }
  });

  app.get("/api/calendar/integrations", isAuthenticatedOrDemo, async (req: any, res) => {
    try {
      const agentId = req.user.claims.sub;
      const integrations = await storage.getCalendarIntegrationsByAgent(agentId);
      res.json(integrations);
    } catch (error: any) {
      console.error("Error fetching calendar integrations:", error);
      res.status(500).json({ message: "Failed to fetch calendar integrations" });
    }
  });

  app.put("/api/calendar/integrations/:id", isAuthenticatedOrDemo, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const integration = await storage.updateCalendarIntegration(id, updates);
      res.json(integration);
    } catch (error: any) {
      console.error("Error updating calendar integration:", error);
      res.status(500).json({ message: "Failed to update calendar integration" });
    }
  });

  app.post("/api/calendar/google/setup", isAuthenticatedOrDemo, async (req: any, res) => {
    try {
      const agentId = req.user.claims.sub;
      const { authCode } = req.body;
      const integration = await calendarService.setupGoogleCalendar(agentId, authCode);
      res.json(integration);
    } catch (error: any) {
      console.error("Error setting up Google Calendar:", error);
      res.status(500).json({ message: "Failed to setup Google Calendar integration" });
    }
  });

  app.post("/api/calendar/outlook/setup", isAuthenticatedOrDemo, async (req: any, res) => {
    try {
      const agentId = req.user.claims.sub;
      const { accessToken, refreshToken } = req.body;
      const integration = await calendarService.setupOutlookCalendar(agentId, accessToken, refreshToken);
      res.json(integration);
    } catch (error: any) {
      console.error("Error setting up Outlook Calendar:", error);
      res.status(500).json({ message: "Failed to setup Outlook Calendar integration" });
    }
  });

  app.get("/api/calendar/events/showing/:showingId", isAuthenticatedOrDemo, async (req: any, res) => {
    try {
      const showingId = parseInt(req.params.showingId);
      const events = await storage.getCalendarEventsByShowing(showingId);
      res.json(events);
    } catch (error: any) {
      console.error("Error fetching calendar events:", error);
      res.status(500).json({ message: "Failed to fetch calendar events" });
    }
  });

  // Notification processing endpoint (for scheduled tasks)
  app.post("/api/notifications/process", async (req: any, res) => {
    try {
      await notificationService.processPendingReminders();
      res.json({ message: "Processed pending reminders" });
    } catch (error: any) {
      console.error("Error processing reminders:", error);
      res.status(500).json({ message: "Failed to process reminders" });
    }
  });

  // Test SMS endpoint
  app.post("/api/notifications/test-sms", isAuthenticatedOrDemo, async (req: any, res) => {
    try {
      const { phoneNumber, message } = req.body;
      
      if (!phoneNumber || !message) {
        return res.status(400).json({ message: "Phone number and message are required" });
      }

      // Test the SMS sending functionality
      const result = await notificationService.testSMS(phoneNumber, message);
      res.json({ 
        message: "SMS sent successfully",
        sid: result.sid,
        status: result.status
      });
    } catch (error: any) {
      console.error("Error sending test SMS:", error);
      res.status(500).json({ 
        message: "Failed to send SMS",
        error: error.message,
        details: error.code || "Unknown error"
      });
    }
  });

  // Twilio webhook for incoming SMS responses
  app.post("/api/webhooks/twilio/sms", async (req: any, res) => {
    try {
      const { From, Body, MessageSid } = req.body;
      
      if (!From || !Body || !MessageSid) {
        console.log("Invalid Twilio webhook payload:", req.body);
        return res.status(400).send("Invalid payload");
      }

      console.log(`Received SMS from ${From}: "${Body}" (SID: ${MessageSid})`);

      // Process the incoming SMS response
      const result = await notificationService.handleIncomingSMS(From, Body, MessageSid);
      
      // Send auto-reply if appropriate
      if (result.shouldReply && result.autoReply) {
        const clientAgent = await notificationService.findClientByPhone(From);
        if (clientAgent) {
          await notificationService.sendAutoReply(
            From, 
            result.autoReply, 
            clientAgent.agentId, 
            clientAgent.clientId
          );
        }
      }

      // Respond to Twilio with TwiML (empty response means no action)
      res.set('Content-Type', 'text/xml');
      res.send(`<?xml version="1.0" encoding="UTF-8"?><Response></Response>`);
      
    } catch (error: any) {
      console.error("Error processing Twilio webhook:", error);
      res.status(500).send("Internal server error");
    }
  });

  // Get SMS conversation history for a client
  app.get("/api/notifications/sms-history/:clientId", isAuthenticatedOrDemo, async (req: any, res) => {
    try {
      const clientId = parseInt(req.params.clientId);
      const agentId = req.user?.id;
      
      if (!agentId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const history = await notificationService.getSMSHistory(clientId, agentId);
      res.json(history);
    } catch (error: any) {
      console.error("Error fetching SMS history:", error);
      res.status(500).json({ message: "Failed to fetch SMS history" });
    }
  });

  // AI Support Chat routes
  app.post("/api/ai/support-chat", isAuthenticated, async (req: any, res) => {
    try {
      const { message, conversationHistory } = req.body;
      
      if (!message || typeof message !== 'string') {
        return res.status(400).json({ message: "Invalid message format" });
      }

      const response = await aiSupportService.generateSupportResponse(
        message.trim(),
        conversationHistory || []
      );

      res.json({ response });
    } catch (error: any) {
      console.error("Error generating AI support response:", error);
      res.status(500).json({ 
        message: "I'm having trouble responding right now. Please try again or contact our support team.",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined 
      });
    }
  });

  app.post("/api/ai/support-suggestions", isAuthenticated, async (req: any, res) => {
    try {
      const { userQuery } = req.body;
      
      if (!userQuery || typeof userQuery !== 'string') {
        return res.status(400).json({ message: "Invalid query format" });
      }

      const suggestions = await aiSupportService.generateQuickSuggestions(userQuery.trim());
      res.json({ suggestions });
    } catch (error: any) {
      console.error("Error generating suggestions:", error);
      res.status(500).json({ 
        suggestions: [
          "How do I set up contract alerts?",
          "What evidence should I collect for protection?",
          "How does public records monitoring work?"
        ]
      });
    }
  });

  app.post("/api/ai/analyze-intent", isAuthenticated, async (req: any, res) => {
    try {
      const { message } = req.body;
      
      if (!message || typeof message !== 'string') {
        return res.status(400).json({ message: "Invalid message format" });
      }

      const analysis = await aiSupportService.analyzeUserIntent(message.trim());
      res.json(analysis);
    } catch (error: any) {
      console.error("Error analyzing user intent:", error);
      res.status(500).json({
        category: "general",
        urgency: "medium",
        suggestedActions: ["Review your contracts", "Check platform alerts", "Contact support if needed"]
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
