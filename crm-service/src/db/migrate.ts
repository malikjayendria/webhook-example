// src/db/migrate.ts
import { AppDataSource } from "../config/data-source";
import { logger } from "../config/logger";
(async () => {
  await AppDataSource.initialize();
  await AppDataSource.runMigrations();
  logger.info("Migrations applied");
  await AppDataSource.destroy();
})();
