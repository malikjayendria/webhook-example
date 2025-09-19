// src/db/truncate.ts
import { AppDataSource } from "../config/data-source";
import { logger } from "../config/logger";

(async () => {
  try {
    // Check if we're in development mode
    const isDevelopment = process.env.NODE_ENV !== "production";

    if (!isDevelopment) {
      logger.error("❌ Database truncate is only allowed in development mode");
      logger.error("💡 This operation will delete ALL data in tables");
      process.exit(1);
    }

    await AppDataSource.initialize();
    logger.info("🔗 Connected to database");

    // Get all tables from the database
    const tablesResult = await AppDataSource.query(`
      SELECT TABLE_NAME
      FROM information_schema.TABLES
      WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME NOT LIKE 'migrations%'
    `);

    const tables = tablesResult.map((row: any) => row.TABLE_NAME);
    logger.info(`📋 Found ${tables.length} tables: ${tables.join(", ")}`);

    if (tables.length === 0) {
      logger.info("ℹ️  No tables found to truncate");
      return;
    }

    // Confirm destructive operation
    logger.warn("⚠️  This will DELETE ALL DATA in the following tables:");
    tables.forEach((table: string) => logger.warn(`   - ${table}`));

    // Disable foreign key checks to avoid constraint errors
    await AppDataSource.query("SET FOREIGN_KEY_CHECKS = 0");
    logger.info("🔓 Disabled foreign key checks");

    // Truncate tables in reverse dependency order (child first)
    const truncateOrder = ["reservations", "guests"]; // Add more tables as needed
    const otherTables = tables.filter((table: string) => !truncateOrder.includes(table));

    // Truncate in specific order first, then others
    const allTablesToTruncate = [...truncateOrder, ...otherTables];

    for (const table of allTablesToTruncate) {
      try {
        // Check if table exists and get record count
        const countResult = await AppDataSource.query(`SELECT COUNT(*) as count FROM \`${table}\``);
        const count = countResult[0].count;

        if (count > 0) {
          logger.info(`🗑️  Truncating ${table} (${count} records)...`);
          await AppDataSource.query(`TRUNCATE TABLE \`${table}\``);
          logger.info(`✅ Truncated ${table} - ${count} records deleted`);
        } else {
          logger.info(`ℹ️  Table ${table} is already empty`);
        }
      } catch (error) {
        logger.warn(`⚠️  Could not truncate ${table}: ${(error as Error).message}`);
      }
    }

    // Re-enable foreign key checks
    await AppDataSource.query("SET FOREIGN_KEY_CHECKS = 1");
    logger.info("🔒 Re-enabled foreign key checks");

    // Reset auto-increment counters
    for (const table of allTablesToTruncate) {
      try {
        await AppDataSource.query(`ALTER TABLE \`${table}\` AUTO_INCREMENT = 1`);
        logger.info(`🔄 Reset auto-increment for ${table}`);
      } catch (error) {
        // Ignore errors for tables without auto-increment
      }
    }

    logger.info("✅ Database truncate completed successfully");
    logger.info("💡 All data has been deleted, but table structures remain intact");
  } catch (error) {
    logger.error(`❌ Database truncate failed: ${(error as Error).message}`);
    process.exit(1);
  } finally {
    await AppDataSource.destroy();
  }
})();
