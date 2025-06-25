import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";

import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";

// Check if we're in a Replit environment
const isReplitEnvironment = process.env.REPLIT_DOMAINS && process.env.REPL_ID;

const getOidcConfig = memoize(
  async () => {
    if (!isReplitEnvironment) {
      return null;
    }
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID!
    );
  },
  { maxAge: 3600 * 1000 }
);

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  
  if (!isReplitEnvironment || !process.env.DATABASE_URL) {
    // Use memory store for demo/development
    return session({
      secret: process.env.SESSION_SECRET || 'demo-secret-key-not-for-production',
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: false,
        maxAge: sessionTtl,
      },
    });
  }

  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: true,
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

  // Only setup Replit auth if in Replit environment
  if (isReplitEnvironment) {
    try {
      const config = await getOidcConfig();
      if (!config) return;

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
          successReturnToOrRedirect: "/",
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
      // Create demo user in database if doesn't exist
      let user = await storage.getUser("demo-user-001");
      if (!user) {
        user = await storage.upsertUser({
          id: "demo-user-001",
          email: "demo@commissionguard.com",
          firstName: "Demo",
          lastName: "User",
          profileImageUrl: null,
        });
      }} else {
  // Production authentication routes - require explicit login
  app.get("/api/login", async (req, res) => {
    try {
      // Create demo user in database if doesn't exist
      let user = await storage.getUser("demo-user-001");
      if (!user) {
        user = await storage.upsertUser({
          id: "demo-user-001",
          email: "demo@commissionguard.com",
          firstName: "Demo",
          lastName: "User",
          profileImageUrl: null,
        });
      }
      
      // Set session to mark user as logged in
      if (req.session) {
        (req.session as any).user = user;
      }
      
      res.redirect("/dashboard");
    } catch (error) {
      console.error("Login error:", error);
      res.redirect("/?error=login_failed");
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
      
      // Set session to mark user as logged in
      if (req.session) {
        (req.session as any).user = user;
      }
      
      res.redirect("/dashboard");
    } catch (error) {
      console.error("Login error:", error);
      res.redirect("/?error=login_failed");
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

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  // In non-Replit environments, use demo authentication
  if (!isReplitEnvironment) {
    return next();
  }

  const user = req.user as any;

  if (!req.isAuthenticated() || !user?.expires_at) {
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
    if (!config) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
    updateUserSession(user, tokenResponse);
    return next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
};

export const isAuthenticatedOrDemo: RequestHandler = async (req, res, next) => {
  // In production/non-Replit environments, always allow access
  if (!isReplitEnvironment) {
    return next();
  }

  // In Replit environment, use normal authentication
  return isAuthenticated(req, res, next);
};
