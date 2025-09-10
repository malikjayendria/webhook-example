import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1710000000000 implements MigrationInterface {
  name = "Init1710000000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE guests (
        id BIGINT PRIMARY KEY AUTO_INCREMENT,
        email VARCHAR(191) NOT NULL UNIQUE,
        name VARCHAR(191) NOT NULL,
        phone VARCHAR(50) NULL,
        date_of_birth DATE NULL,
        country VARCHAR(100) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    await queryRunner.query(`
      CREATE TABLE reservations (
        id BIGINT PRIMARY KEY AUTO_INCREMENT,
        guest_id BIGINT NOT NULL,
        room_number VARCHAR(50) NOT NULL,
        check_in DATE NOT NULL,
        check_out DATE NOT NULL,
        status ENUM('booked','checked_in','checked_out','canceled') DEFAULT 'booked',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP NULL,
        CONSTRAINT fk_res_guest FOREIGN KEY (guest_id) REFERENCES guests(id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    await queryRunner.query(`CREATE INDEX idx_res_guest_id ON reservations(guest_id);`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS reservations;`);
    await queryRunner.query(`DROP TABLE IF EXISTS guests;`);
  }
}
