import express from "express";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { env } from "./config/env";
import { errorHandler } from "./shared/errors";
import routes from "./routes";

export function createApp() {
  const app = express();
  app.use(helmet());
  app.use(cors());

  // Rate limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
      success: false,
      error: {
        code: "RATE_LIMIT_EXCEEDED",
        message: "Too many requests from this IP, please try again later."
      }
    },
    standardHeaders: true,
    legacyHeaders: false,
  });

  // Apply rate limiting to API routes
  app.use(env.basePath, limiter);

  //health check
  app.get("/health", (_req, res) => res.json({ ok: true }));

  //base routes
  app.use(env.basePath, routes);

  app.use(errorHandler);
  return app;
}
