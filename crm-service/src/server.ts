import { createApp } from "./app";
import { AppDataSource } from "./config/data-source";
import { env } from "./config/env";
import { logger } from "./config/logger";

(async () => {
  await AppDataSource.initialize();
  const app = createApp();
  app.listen(env.port, () => logger.info(`CRM listening on http://localhost:${env.port}${env.basePath}`));
})();
