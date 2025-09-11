import express from "express";
import helmet from "helmet";
import cors from "cors";
import { env } from "./config/env";
import { errorHandler } from "./shared/errors";
import routes from "./routes";

export function createApp() {
  const app = express();
  app.use(helmet());
  app.use(cors());
  app.use(express.json({ limit: "1mb" }));

  //health check
  app.get("/health", (_req, res) => res.json({ ok: true }));

  //base routes
  app.use(env.basePath, routes);

  app.use(errorHandler);
  return app;
}
