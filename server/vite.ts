import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { createServer as createViteServer, createLogger } from "vite";
import { type Server } from "http";
import viteConfig from "../vite.config";
import { nanoid } from "nanoid";
import { fileURLToPath } from "url";

const viteLogger = createLogger();

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

export async function setupVite(app: Express, server: Server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      },
    },
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const __dirname = path.dirname(fileURLToPath(import.meta.url));
      const clientTemplate = path.resolve(__dirname, "..", "client", "index.html");

      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`,
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  
  // In production on Render, the build process creates:
  // - dist/index.js (server bundle) 
  // - dist/index.html, dist/assets/* (frontend assets)
  // The server bundle runs from /opt/render/project/src/dist/index.js
  // So we need to serve static files from the same dist directory
  const distPath = path.resolve(__dirname);

  console.log(`[express] Looking for static files in: ${distPath}`);
  console.log(`[express] Files in dist:`, fs.readdirSync(distPath));

  if (!fs.existsSync(path.join(distPath, "index.html"))) {
    throw new Error(
      `Could not find index.html in ${distPath}. Available files: ${fs.readdirSync(distPath).join(", ")}`
    );
  }

  // Serve static files from the current directory (where the server bundle is)
  app.use(express.static(distPath));

  // SPA fallback for all non-API routes
  app.use("*", (req, res) => {
    if (req.path.startsWith("/api/")) {
      return res.status(404).json({ error: "API endpoint not found" });
    }
    
    res.sendFile(path.join(distPath, "index.html"));
  });
}
