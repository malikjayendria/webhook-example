import { AppDataSource } from "../config/data-source";
import { logger } from "../config/logger";

(async () => {
  try {
    // Check if we're in development mode
    const isDevelopment = process.env.NODE_ENV !== "production";

    if (!isDevelopment) {
      logger.error("❌ Database sync is only allowed in development mode");
      logger.error("💡 Use migrations for production database changes");
      process.exit(1);
    }

    logger.warn("🔄 Starting database synchronization...");
    logger.warn("⚠️  This will ALTER tables to match entity definitions");
    logger.warn("⚠️  Data may be lost if schema changes are incompatible");

    await AppDataSource.initialize();

    // Use synchronize(false) for safer sync - only alters, doesn't drop
    await AppDataSource.synchronize(false);

    logger.info("✅ Database synchronized successfully");
    logger.info("📝 Schema updated to match current entity definitions");
  } catch (error) {
    logger.error(`❌ Database sync failed: ${(error as Error).message}`);
    process.exit(1);
  } finally {
    await AppDataSource.destroy();
  }
})();
