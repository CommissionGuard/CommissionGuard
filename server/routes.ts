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
  insertCommissionProtectionSchema
} from "@shared/schema";
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
      const showingData = insertShowingSchema.parse({ ...req.body, agentId });
      const showing = await storage.createShowing(showingData);
      res.json(showing);
    } catch (error) {
      console.error("Error creating showing:", error);
      res.status(500).json({ message: "Failed to create showing" });
    }
  });

  app.get("/api/showings", isAuthenticatedOrDemo, async (req: any, res) => {
    try {
      const agentId = req.user.claims.sub;
      const showings = await storage.getShowingsByAgent(agentId);
      res.json(showings);
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
      const updates = req.body;
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
      const visitData = insertPropertyVisitSchema.parse({ ...req.body, agentId });
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
      const protectionData = insertCommissionProtectionSchema.parse({ ...req.body, agentId });
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

  const httpServer = createServer(app);
  return httpServer;
}
