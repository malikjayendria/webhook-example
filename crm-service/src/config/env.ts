import { config } from "dotenv";

// Load .env file explicitly
config({ path: "./.env" });

export const env = {
  port: parseInt(process.env.APP_PORT ?? "5001", 10),
  basePath: process.env.APP_BASE_PATH ?? "/api/v1",
  db: {
    host: process.env.DB_HOST ?? "127.0.0.1",
    port: parseInt(process.env.DB_PORT ?? "3306", 10),
    user: process.env.DB_USER ?? "crm_user",
    pass: process.env.DB_PASS ?? "crm_password",
    name: process.env.DB_NAME ?? "crm_db",
  },
  webhook: {
    secret: process.env.WEBHOOK_SHARED_SECRET ?? "",
    maxSkewSec: parseInt(process.env.WEBHOOK_MAX_SKEW_SECONDS ?? "300", 10),
  },
};
