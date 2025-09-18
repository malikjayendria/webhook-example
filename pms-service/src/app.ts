import express from "express";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { env } from "./config/env";
import { errorHandler } from "./shared/errors";
import { sanitizeInput } from "./shared/sanitization";
import routes from "./routes";

export function createApp() {
  const app = express();

  // Configure Helmet with CSP that allows inline event handlers
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
          scriptSrcAttr: ["'unsafe-inline'"], // Allow inline event handlers
          styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com"],
          fontSrc: ["'self'", "https://cdnjs.cloudflare.com"],
          imgSrc: ["'self'", "data:", "https:"],
          connectSrc: ["'self'"],
        },
      },
    })
  );

  app.use(cors());

  // Serve static files
  app.use(express.static("public"));

  // Input sanitization middleware
  app.use(sanitizeInput);

  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ limit: "1mb", extended: true }));

  // Rate limiting - apply to all API routes (disabled in development)
  if (process.env.NODE_ENV !== "development") {
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
      message: {
        success: false,
        error: {
          code: "RATE_LIMIT_EXCEEDED",
          message: "Too many requests from this IP, please try again later.",
        },
      },
      standardHeaders: true,
      legacyHeaders: false,
    });

    // Apply rate limiting to API routes
    app.use(env.basePath, limiter);
  }

  //health check
  app.get("/health", (_req, res) => res.json({ ok: true }));

  //base routes
  app.use(env.basePath, routes);

  app.use(errorHandler);
  return app;
}
