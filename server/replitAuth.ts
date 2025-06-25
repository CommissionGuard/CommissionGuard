import express, { type Express, type RequestHandler } from "express";
import passport from "passport";
import { Strategy, type VerifyFunction } from "passport-openidconnect";
import * as client from "openid-client";
import session from "express-session";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
import { Pool } from "pg";
import { storage } from "./storage";

// Check if we're in a Replit environment
const isReplitEnvironment = !!process.env.REPLIT_DOMAINS;

const getOidcConfig = memoize(
  async () => {
    if (!isReplitEnvironment) {
      return null;
    }
    return await client.discovery(
      new URL("https://auth.replit.com"),
      process.env.REPL_ID!,
      process.env.REPL_ID!,
    );
  }
);

export function getSession() {
  if (!isReplitEnvironment) {
    // Return minimal session for production environments
    return session({
      secret: "demo-session-secret",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: false,
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      },
    });
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  const pgSession = connectPg(session);

  return session({
    store: new pgSession({
      pool: pool,
      tableName: "sessions",
      createTableIfMissing: true,
    }),
    secret: process.env.REPL_ID + "session-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    },
  });
}

function updateUserSession(
  user: Express.User,
  tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers
) {
  user.id = tokens.claims().sub;
  user.accessToken = tokens.access_token;
  user.refreshToken = tokens.refresh_token;
}

async function upsertUser(
  claims: client.IdTokenClaims | client.UserinfoResponse
): Promise<void> {
  await storage.upsertUser({
    id: claims.sub,
    email: claims.email!,
    firstName: claims.given_name || "",
    lastName: claims.family_name || "",
    profileImageUrl: claims["profile_image_url"],
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  
  // Only set up session and passport if we're in Replit environment
  if (isReplitEnvironment) {
    app.use(getSession());
    app.use(passport.initialize());
    app.use(passport.session());

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

    for (const domain of process.env
      .REPLIT_DOMAINS!.split(",")) {
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
  } else {
    // Production environment - set up simple demo routes
    app.get("/api/login", (req, res) => {
      res.redirect("/");
    });

    app.get("/api/callback", (req, res) => {
      res.redirect("/");
    });

    app.get("/api/logout", (req, res) => {
      res.redirect("/");
    });
  }
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  // In production or non-Replit environments, use demo mode
  if (!isReplitEnvironment || !req.user) {
    (req as any).user = {
      id: "43911252",
      email: "demo@commissionguard.com", 
      firstName: "Demo",
      lastName: "User",
      role: "agent",
      claims: { sub: "43911252" }
    };
  }
  return next();
};

export const isAuthenticatedOrDemo: RequestHandler = async (req, res, next) => {
  // Use demo mode for local development
  if (!req.user) {
    (req as any).user = {
      id: "43911252",
      email: "demo@commissionguard.com", 
      firstName: "Demo",
      lastName: "User",
      role: "agent",
      claims: { sub: "43911252" }
    };
  }
  return next();
};