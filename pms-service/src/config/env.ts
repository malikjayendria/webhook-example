import "dotenv/config";

export const env = {
  port: parseInt(process.env.APP_PORT ?? "4001", 10),
  basePath: process.env.APP_BASE_PATH ?? "/api/v1",

  db: {
    host: process.env.DB_HOST ?? "127.0.0.1",
    port: parseInt(process.env.DB_PORT ?? "3306", 10),
    user: process.env.DB_USER ?? "pms_user",
    pass: process.env.DB_PASS ?? "pms_password",
    name: process.env.DB_NAME ?? "pms_db",
  },

  webhook: {
    url: process.env.CRM_WEBHOOK_URL ?? "",
    secret: process.env.CRM_WEBHOOK_SECRET ?? "",
  },
};
