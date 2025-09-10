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

  app.get("/health", (_req, res) => res.json({ ok: true }));
  app.use(env.basePath, routes);

  app.use(errorHandler);
  return app;
}
