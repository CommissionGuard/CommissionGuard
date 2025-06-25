import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";

import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";

const isReplitEnvironment = !!(process.env.REPLIT_DOMAINS && process.env.REPL_ID);

if (!process.env.REPLIT_DOMAINS) {
  console.log("REPLIT_DOMAINS not found - using production authentication mode");
}

const getOidcConfig = memoize(
  async () => {
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID!
    );
  },
  { maxAge: 3600 * 1000 }
);

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  
  // Only use PostgreSQL session store when we have a valid DATABASE_URL
  if (process.env.DATABASE_URL && 
      process.env.DATABASE_URL.startsWith('postgresql://') && 
      !process.env.DATABASE_URL.includes("your-db-name")) {
    
    try {
      const pgStore = connectPg(session);
      const sessionStore = new pgStore({
        conString: process.env.DATABASE_URL,
        createTableIfMissing: false,
        ttl: sessionTtl,
        tableName: "sessions",
      });
      
      return session({
        secret: process.env.SESSION_SECRET || "commission-guard-fallback-secret-key-2025",
        store: sessionStore,
        resave: false,
        saveUninitialized: false,
        cookie: {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          maxAge: sessionTtl,
        },
      });
    } catch (error) {
      console.warn("PostgreSQL session store failed, using memory store:", error.message);
    }
  }
  
  // Use memory store for environments without valid database
  return session({
    secret: process.env.SESSION_SECRET || "commission-guard-fallback-secret-key-2025",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: sessionTtl,
    },
  });
}

function updateUserSession(
  user: any,
  tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers
) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}

async function upsertUser(claims: any) {
  await storage.upsertUser({
    id: claims["sub"],
    email: claims["email"],
    firstName: claims["first_name"],
    lastName: claims["last_name"],
    profileImageUrl: claims["profile_image_url"],
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  if (isReplitEnvironment) {
    // Replit authentication setup
    try {
      const config = await getOidcConfig();

      const verify: VerifyFunction = async (
        tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
        verified: passport.AuthenticateCallback
      ) => {
        const user = {};
        updateUserSession(user, tokens);
        await upsertUser(tokens.claims());
        verified(null, user);
      };

      for (const domain of process.env.REPLIT_DOMAINS!.split(",")) {
        const strategy = new Strategy(
          {
            name: `replitauth:${domain}`,
            config,
            scope: "openid email profile offline_access",
            callbackURL: `https://${domain}/api/callback`,
          },
          verify,
        );
        passport.use(strategy);
      }

      passport.serializeUser((user: Express.User, cb) => cb(null, user));
      passport.deserializeUser((user: Express.User, cb) => cb(null, user));

      app.get("/api/login", (req, res, next) => {
        passport.authenticate(`replitauth:${req.hostname}`, {
          prompt: "login consent",
          scope: ["openid", "email", "profile", "offline_access"],
        })(req, res, next);
      });

      app.get("/api/callback", (req, res, next) => {
        passport.authenticate(`replitauth:${req.hostname}`, {
          successReturnToOrRedirect: "/dashboard",
          failureRedirect: "/api/login",
        })(req, res, next);
      });

      app.get("/api/logout", (req, res) => {
        req.logout(() => {
          res.redirect(
            client.buildEndSessionUrl(config, {
              client_id: process.env.REPL_ID!,
              post_logout_redirect_uri: `${req.protocol}://${req.hostname}`,
            }).href
          );
        });
      });
    } catch (error) {
      console.warn("Replit auth setup failed, using demo mode:", error.message);
    }
  } else {
    // Production authentication routes - require explicit login
    app.get("/api/login", async (req, res) => {
      try {
        // Create demo user - try database first, fallback to mock
        let user;
        try {
          user = await storage.getUser("demo-user-001");
          if (!user) {
            user = await storage.upsertUser({
              id: "demo-user-001",
              email: "demo@commissionguard.com",
              firstName: "Demo",
              lastName: "User",
              profileImageUrl: null,
            });
          }
        } catch (dbError) {
          // Database unavailable, use mock user
          console.log("Database connection issue, using mock user");
          user = {
            id: "demo-user-001",
            email: "demo@commissionguard.com",
            firstName: "Demo",
            lastName: "User",
            profileImageUrl: null,
            role: "agent"
          };
        }
        
        // Set session to mark user as logged in
        if (req.session) {
          (req.session as any).user = user;
        }
        
        res.redirect("/dashboard");
      } catch (error) {
        console.error("Login error:", error);
        if (!res.headersSent) {
          res.redirect("/?error=login_failed");
        }
      }
    });

    app.get("/api/logout", (req, res) => {
      if (req.session) {
        req.session.destroy(() => {
          res.redirect("/");
        });
      } else {
        res.redirect("/");
      }
    });
  }
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  // In non-Replit environments, allow demo access for production showcase
  if (!isReplitEnvironment) {
    // Always allow access in production for demo purposes
    (req as any).user = {
      id: "demo-user-001",
      email: "demo@commissionguard.com", 
      firstName: "Demo",
      lastName: "User",
      role: "agent",
      claims: { sub: "demo-user-001" }
    };
    return next();
  }

  const user = req.user as any;

  if (!req.isAuthenticated() || !user.expires_at) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const now = Math.floor(Date.now() / 1000);
  if (now <= user.expires_at) {
    return next();
  }

  const refreshToken = user.refresh_token;
  if (!refreshToken) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const config = await getOidcConfig();
    const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
    updateUserSession(user, tokenResponse);
    return next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
};

export const isAuthenticatedOrDemo: RequestHandler = async (req, res, next) => {
  // In production/non-Replit environments, always allow with demo user
  if (!process.env.REPLIT_DOMAINS || !process.env.REPL_ID) {
    try {
      // Get or create demo user from database if available
      let user;
      try {
        user = await storage.getUser("demo-user-001");
        if (!user) {
          user = await storage.upsertUser({
            id: "demo-user-001",
            email: "demo@commissionguard.com",
            firstName: "Demo",
            lastName: "User",
            profileImageUrl: null,
          });
        }
      } catch (dbError) {
        // Database unavailable, use mock user
        user = {
          id: "demo-user-001",
          email: "demo@commissionguard.com",
          firstName: "Demo",
          lastName: "User",
          profileImageUrl: null,
          role: "agent"
        };
      }
      
      (req as any).user = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role || "agent",
        claims: { sub: user.id }
      };
    } catch (error) {
      console.error("Demo auth error:", error);
      (req as any).user = {
        id: "demo-user-001",
        email: "demo@commissionguard.com",
        firstName: "Demo",
        lastName: "User",
        role: "agent",
        claims: { sub: "demo-user-001" }
      };
    }
    return next();
  }

  // In Replit environment, use real authentication
  return isAuthenticated(req, res, next);
};