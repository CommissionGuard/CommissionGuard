import express, { type Express, type RequestHandler } from "express";
import passport from "passport";
import { Strategy, type VerifyFunction } from "passport-openidconnect";
import * as client from "openid-client";
import session from "express-session";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
import pkg from "pg";
const { Pool } = pkg;
import { storage } from "./storage";
// Check if we're in a Replit environment
const isReplitEnvironment = !!process.env.REPLIT_DOMAINS;
const getOidcConfig = memoize(
  async () => {
    if (!isReplitEnvironment || !process.env.REPL_ID) {
      return null;
    }
    try {
      return await client.discovery(
        new URL("https://auth.replit.com"),
        process.env.REPL_ID!,
        process.env.REPL_ID!,
      );
    } catch (error) {
      console.warn("Failed to discover Replit OIDC config:", error.message);
      return null;
    }
  }
);
export function getSession() {
  if (!isReplitEnvironment) {
    return session({
      secret: "demo-session-secret",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: false,
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 7,
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
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
  });
}
function updateUserSession(
  user: any,
  updatedFields?: Partial<{
    fullName: string;
    displayName: string;
    profileImageUrl: string;
  }>
) {
  if (updatedFields) {
    Object.assign(user, updatedFields);
  }
  return user;
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
  
  if (isReplitEnvironment) {
    try {
      app.use(getSession());
      app.use(passport.initialize());
      app.use(passport.session());
      const config = await getOidcConfig();
      if (!config) return;
      const verify: VerifyFunction = async (
        issuer,
        profile,
        context,
        idToken,
        accessToken,
        refreshToken,
        verified
      ) => {
        const claims = context.userinfo || idToken.payload || {};
        try {
          await upsertUser(claims);
          verified(null, claims);
        } catch (error) {
          console.error("Authentication error:", error);
          verified(error as Error);
        }
      };
      passport.use(
        new Strategy(
          {
            issuer: config.issuer.href,
            authorizationURL: config.authorization_endpoint!,
            tokenURL: config.token_endpoint!,
            userInfoURL: config.userinfo_endpoint!,
            clientID: process.env.REPL_ID!,
            clientSecret: process.env.REPL_ID!,
            callbackURL: "/api/auth/callback",
            scope: "openid profile email",
          },
          verify
        )
      );
      passport.serializeUser((user: any, done) => {
        done(null, user.sub || user.id);
      });
      passport.deserializeUser(async (id: string, done) => {
        try {
          const user = await storage.getUser(id);
          done(null, user);
        } catch (error) {
          done(error);
        }
      });
      app.get("/api/auth/login", passport.authenticate("openidconnect"));
      app.get(
        "/api/auth/callback",
        passport.authenticate("openidconnect", {
          successRedirect: "/",
          failureRedirect: "/login",
        })
      );
      app.post("/api/auth/logout", (req, res) => {
        req.logout(() => {
          res.redirect(
            client.buildEndSessionUrl(config, {
              client_id: process.env.REPL_ID!,
              post_logout_redirect_uri: req.protocol + "://" + req.hostname,
            }).href
          );
        });
      });
    } catch (error) {
      console.warn("Replit auth setup failed, using demo mode:", error.message);
    }
  } else {
    app.use(getSession());
  }
}
export const isAuthenticated: RequestHandler = async (req, res, next) => {
  if (!isReplitEnvironment) {
    req.user = {
      id: "demo-user",
      email: "demo@example.com",
      fullName: "Demo User",
      displayName: "Demo User",
      profileImageUrl: ""
    };
    return next();
  }
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: "Authentication required" });
};
export const isAuthenticatedOrDemo: RequestHandler = async (req, res, next) => {
  if (!isReplitEnvironment) {
    req.user = {
      id: "demo-user", 
      email: "demo@example.com",
      fullName: "Demo User",
      displayName: "Demo User",
      profileImageUrl: ""
    };
    return next();
  }
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: "Authentication required" });
};
