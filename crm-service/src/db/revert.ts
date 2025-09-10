// src/db/revert.ts
import { AppDataSource } from "../config/data-source";
import { logger } from "../config/logger";
(async () => {
  await AppDataSource.initialize();
  await AppDataSource.undoLastMigration();
  logger.info("Last migration reverted");
  await AppDataSource.destroy();
})();
