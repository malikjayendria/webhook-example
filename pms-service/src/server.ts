import { createApp } from "./app";
import { AppDataSource } from "./config/data-source";
import { env } from "./config/env";
import { logger } from "./config/logger";
import { startWebhookProcessor } from "./shared/webhook";

(async () => {
  await AppDataSource.initialize();
  const app = createApp();

  // Start webhook processor for failed webhook retry
  startWebhookProcessor();

  app.listen(env.port, () => logger.info(`PMS listening on http://localhost:${env.port}${env.basePath}`));
})();
