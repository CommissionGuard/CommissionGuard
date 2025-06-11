import type { Express, RequestHandler } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { apiIntegrationService } from "./apiIntegrations";
import { insertClientSchema, insertContractSchema, insertContractSignerSchema, insertAlertSchema } from "@shared/schema";
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

  app.get("/api/contracts", isAuthenticated, async (req: any, res) => {
    try {
      const agentId = req.user.claims.sub;
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
  app.post("/api/rentcast/search", isAuthenticated, async (req: any, res) => {
    try {
      const filters = req.body;
      const result = await apiIntegrationService.searchRentalProperties(filters);
      res.json(result);
    } catch (error) {
      console.error("Error searching rental properties:", error);
      res.status(500).json({ message: "Failed to search rental properties" });
    }
  });

  app.post("/api/rentcast/property-details", isAuthenticated, async (req: any, res) => {
    try {
      const { address } = req.body;
      const result = await apiIntegrationService.getRentCastPropertyDetails(address);
      res.json(result);
    } catch (error) {
      console.error("Error fetching property details:", error);
      res.status(500).json({ message: "Failed to fetch property details" });
    }
  });

  app.post("/api/rentcast/rent-estimate", isAuthenticated, async (req: any, res) => {
    try {
      const { address } = req.body;
      const result = await apiIntegrationService.getRentEstimate(address);
      res.json(result);
    } catch (error) {
      console.error("Error fetching rent estimate:", error);
      res.status(500).json({ message: "Failed to fetch rent estimate" });
    }
  });

  app.post("/api/rentcast/market-data", isAuthenticated, async (req: any, res) => {
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

  // Admin routes (restricted to admin users)
  const isAdmin: RequestHandler = async (req: any, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      next();
    } catch (error) {
      res.status(500).json({ message: "Authentication error" });
    }
  };

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

  app.patch("/api/admin/users/:userId/subscription", isAdmin, async (req: any, res) => {
    try {
      const { userId } = req.params;
      const updates = req.body;
      await storage.updateUserSubscription(userId, updates);
      res.json({ message: "User subscription updated successfully" });
    } catch (error) {
      console.error("Error updating user subscription:", error);
      res.status(500).json({ message: "Failed to update user subscription" });
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

  const httpServer = createServer(app);
  return httpServer;
}
