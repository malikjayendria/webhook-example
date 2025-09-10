import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1720000000000 implements MigrationInterface {
  name = "Init1720000000000";
  public async up(q: QueryRunner): Promise<void> {
    await q.query(`
      CREATE TABLE guest_profiles (
        id BIGINT PRIMARY KEY AUTO_INCREMENT,
        email VARCHAR(191) NOT NULL UNIQUE,
        name VARCHAR(191) NULL,
        phone VARCHAR(50) NULL,
        date_of_birth DATE NULL,
        country VARCHAR(100) NULL,
        total_reservations INT DEFAULT 0,
        nights_lifetime INT DEFAULT 0,
        last_reservation JSON NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    await q.query(`
      CREATE TABLE events (
        id BIGINT PRIMARY KEY AUTO_INCREMENT,
        type VARCHAR(191) NOT NULL,
        idempotency_key VARCHAR(191) NOT NULL UNIQUE,
        timestamp BIGINT NOT NULL,
        payload JSON NOT NULL,
        signature VARCHAR(128) NOT NULL,
        source_ip VARCHAR(45) NULL,
        received_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
  }
  public async down(q: QueryRunner): Promise<void> {
    await q.query(`DROP TABLE IF EXISTS guest_profiles;`);
    await q.query(`DROP TABLE IF EXISTS events;`);
  }
}
