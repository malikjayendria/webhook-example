import { AppDataSource } from "../config/data-source";
import { logger } from "../config/logger";

(async () => {
  await AppDataSource.initialize();
  await AppDataSource.synchronize(true); // drop & recreate
  logger.warn("Database synchronized (DROP & CREATE) - DEV ONLY");
  await AppDataSource.destroy();
})();
