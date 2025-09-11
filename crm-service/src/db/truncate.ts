// src/db/truncate.ts
import { AppDataSource } from "../config/data-source";
import { logger } from "../config/logger";

(async () => {
  try {
    await AppDataSource.initialize();
    logger.info("Connected to database");

    // Disable foreign key checks
    await AppDataSource.query("SET FOREIGN_KEY_CHECKS = 0");

    // Truncate tables
    const tables = ["guest_profiles", "events"];

    for (const table of tables) {
      try {
        const result = await AppDataSource.query(`SELECT COUNT(*) as count FROM ${table}`);
        const count = result[0].count;
        logger.info(`Table ${table}: ${count} records`);

        await AppDataSource.query(`TRUNCATE TABLE ${table}`);
        logger.info(`✅ Truncated ${table}`);
      } catch (error) {
        logger.warn(`⚠️  Table ${table} not found or empty: ${(error as Error).message}`);
      }
    }

    // Re-enable foreign key checks
    await AppDataSource.query("SET FOREIGN_KEY_CHECKS = 1");

    logger.info("✅ Database truncate completed successfully");
  } catch (error) {
    logger.error(`❌ Database truncate failed: ${(error as Error).message}`);
    process.exit(1);
  } finally {
    await AppDataSource.destroy();
  }
})();
