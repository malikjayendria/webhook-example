// src/db/sync.ts (DEV ONLY)
import { AppDataSource } from "../config/data-source";
import { logger } from "../config/logger";
(async () => {
  await AppDataSource.initialize();
  await AppDataSource.synchronize(true);
  logger.warn("DB synchronized (DROP & CREATE)");
  await AppDataSource.destroy();
})();
