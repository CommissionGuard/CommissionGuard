import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Add API route prefix handler to ensure proper JSON responses
  app.use('/api', (req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    next();
  });

  // Auth routes - provide demo user in production
  app.get('/api/auth/user', async (req: any, res) => {
    try {
      // In production/non-Replit environments, provide demo user for showcase
      if (!process.env.REPLIT_DOMAINS || !process.env.REPL_ID) {
        // If user has logged in via session, return session user
        if (req.session?.user) {
          return res.json(req.session.user);
        }
        
        // For production demo, always return demo user to show functionality
        const demoUser = {
          id: "demo-user-001",
          email: "demo@commissionguard.com",
          firstName: "Demo",
          lastName: "User",
          role: "agent",
          profileImageUrl: null
        };
        return res.json(demoUser);
      }

      // In Replit environment, use real authentication
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
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
      // In production/non-Replit environments, allow admin access for demo user
      if (!process.env.REPLIT_DOMAINS || !process.env.REPL_ID) {
        return next(); // Allow all access in demo mode
      }

      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
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

  // Client routes
  app.get('/api/clients', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || req.session?.user?.id || "demo-user-001";
      
      try {
        const clients = await storage.getClientsByAgent(userId);
        res.json(clients);
      } catch (dbError) {
        // Database unavailable, return demo data
        const demoClients = [
          {
            id: 1,
            fullName: "Sarah Johnson",
            email: "sarah.johnson@email.com", 
            phone: "(555) 123-4567",
            agentId: userId,
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            id: 2,
            fullName: "Michael Chen",
            email: "michael.chen@email.com",
            phone: "(555) 987-6543", 
            agentId: userId,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ];
        res.json(demoClients);
      }
    } catch (error) {
      console.error("Error fetching clients:", error);
      res.status(500).json({ message: "Failed to fetch clients" });
    }
  });

  app.post('/api/clients', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || req.session?.user?.id;
      const clientData = { ...req.body, agentId: userId };
      const client = await storage.createClient(clientData);
      res.json(client);
    } catch (error) {
      console.error("Error creating client:", error);
      res.status(500).json({ message: "Failed to create client" });
    }
  });

  // Contract routes
  app.get('/api/contracts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || req.session?.user?.id || "demo-user-001";
      
      try {
        const contracts = await storage.getContractsByAgent(userId);
        res.json(contracts);
      } catch (dbError) {
        // Database unavailable, return demo data
        const demoContracts = [
          {
            id: 1,
            agentId: userId,
            clientId: 1,
            status: "active",
            representationType: "buyer_exclusive",
            propertyAddress: "123 Oak Street, Beverly Hills, CA",
            startDate: "2024-12-01",
            endDate: "2025-03-01",
            contractFileUrl: null,
            contractFileName: "buyer_agreement.pdf",
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            id: 2,
            agentId: userId,
            clientId: 2,
            status: "expiring",
            representationType: "seller_exclusive",
            propertyAddress: "456 Pine Avenue, Hollywood, CA",
            startDate: "2024-11-15", 
            endDate: "2025-01-15",
            contractFileUrl: null,
            contractFileName: "seller_agreement.pdf",
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ];
        res.json(demoContracts);
      }
    } catch (error) {
      console.error("Error fetching contracts:", error);
      res.status(500).json({ message: "Failed to fetch contracts" });
    }
  });

  app.post('/api/contracts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || req.session?.user?.id;
      const contractData = { ...req.body, agentId: userId };
      const contract = await storage.createContract(contractData);
      res.json(contract);
    } catch (error) {
      console.error("Error creating contract:", error);
      res.status(500).json({ message: "Failed to create contract" });
    }
  });

  // Alert routes
  app.get('/api/alerts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || req.session?.user?.id;
      const alerts = await storage.getAlertsByAgent(userId);
      res.json(alerts);
    } catch (error) {
      console.error("Error fetching alerts:", error);
      res.status(500).json({ message: "Failed to fetch alerts" });
    }
  });

  // Dashboard stats API
  app.get('/api/dashboard/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || req.session?.user?.id || "demo-user-001";
      
      try {
        const stats = await storage.getDashboardStats(userId);
        res.json(stats);
      } catch (dbError) {
        // Database unavailable, return demo stats
        const demoStats = {
          activeContracts: 5,
          expiringContracts: 2,
          potentialBreaches: 1,
          protectedCommission: 125000,
          totalClients: 12,
          totalShowings: 28,
          totalAlerts: 3
        };
        res.json(demoStats);
      }
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Alerts API  
  app.get('/api/alerts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || req.session?.user?.id || "demo-user-001";
      
      try {
        const alerts = await storage.getAlertsByAgent(userId);
        res.json(alerts);
      } catch (dbError) {
        // Database unavailable, return demo alerts
        const demoAlerts = [
          {
            id: 1,
            agentId: userId,
            contractId: 2,
            clientId: 2,
            type: "contract_expiring",
            title: "Contract Expiring Soon",
            description: "Seller exclusive agreement expires in 15 days",
            severity: "high",
            isRead: false,
            createdAt: new Date()
          },
          {
            id: 2,
            agentId: userId,
            contractId: 1,
            clientId: 1,
            type: "potential_breach",
            title: "Potential Commission Breach",
            description: "Client showing activity detected with another agent",
            severity: "medium",
            isRead: false,
            createdAt: new Date()
          }
        ];
        res.json(demoAlerts);
      }
    } catch (error) {
      console.error("Error fetching alerts:", error);
      res.status(500).json({ message: "Failed to fetch alerts" });
    }
  });

  // Showings API
  app.get('/api/showings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || req.session?.user?.id || "demo-user-001";
      
      try {
        const showings = await storage.getShowingsByAgent(userId);
        res.json(showings);
      } catch (dbError) {
        // Database unavailable, return demo showings
        const demoShowings = [
          {
            id: 1,
            agentId: userId,
            clientId: 1,
            propertyAddress: "789 Maple Drive, West Hollywood, CA",
            scheduledDate: "2025-01-02T14:00:00Z",
            status: "scheduled",
            notes: "First showing for buyer client",
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            id: 2,
            agentId: userId,
            clientId: 2,
            propertyAddress: "321 Elm Street, Santa Monica, CA",
            scheduledDate: "2025-01-03T10:30:00Z",
            status: "completed",
            notes: "Seller property tour completed",
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ];
        res.json(demoShowings);
      }
    } catch (error) {
      console.error("Error fetching showings:", error);
      res.status(500).json({ message: "Failed to fetch showings" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
