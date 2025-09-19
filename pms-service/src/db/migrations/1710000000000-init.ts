import { MigrationInterface, QueryRunner } from "typeorm";

export class InitGuestSimple1730000000000 implements MigrationInterface {
  name = "Init1730000000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Tabel guests (dengan urutan kolom yang lebih logis)
    await queryRunner.query(`
      CREATE TABLE guests (
        -- Primary Key
        id BIGINT PRIMARY KEY AUTO_INCREMENT,

        -- Identitas Utama
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        middle_name VARCHAR(100) NULL,
        preferred_name VARCHAR(100) NULL,

        -- Informasi Kontak
        email VARCHAR(191) NOT NULL UNIQUE,
        phone_number VARCHAR(50) NULL,

        -- Informasi Personal
        gender ENUM('male', 'female', 'other', 'prefer_not_to_say') NULL,
        birthdate DATE NULL,

        -- Informasi Alamat
        address_line_1 VARCHAR(255) NULL,
        address_line_2 VARCHAR(255) NULL,
        city VARCHAR(100) NULL,
        country_of_residence VARCHAR(100) NULL,
        zip_code VARCHAR(20) NULL,

        -- Klasifikasi dan Kewarganegaraan
        guest_type ENUM('regular','vip','blacklisted','other') DEFAULT 'regular',
        nationality VARCHAR(100) NULL,

        -- Audit Fields (di akhir)
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Index sederhana (sering dipakai untuk pencarian)
    await queryRunner.query(`CREATE INDEX idx_guests_email ON guests(email);`);
    await queryRunner.query(`CREATE INDEX idx_guests_lastname ON guests(last_name);`);
    await queryRunner.query(`CREATE INDEX idx_guests_guest_type ON guests(guest_type);`);

    // Tabel reservations (dengan urutan kolom yang lebih logis)
    await queryRunner.query(`
      CREATE TABLE reservations (
        -- Primary Key
        id BIGINT PRIMARY KEY AUTO_INCREMENT,

        -- Booking Identifier
        booking_number VARCHAR(50) NOT NULL UNIQUE,

        -- Foreign Key
        guest_id BIGINT NOT NULL,

        -- Room Information
        room_type ENUM('standard','deluxe','suite','executive','presidential','villa','other') NULL,
        room_allocation VARCHAR(100) NULL,
        room_number VARCHAR(50) NOT NULL,

        -- Booking Dates
        check_in DATE NOT NULL,
        check_out DATE NOT NULL,

        -- Booking Details
        booking_source ENUM('website','phone','walk_in','ota','corporate','agency','other') DEFAULT 'website',
        status ENUM('booked','confirmed','checked_in','checked_out','canceled','no_show') DEFAULT 'booked',

        -- Guest Count
        number_of_guests INT NULL,
        number_of_adults INT NULL,
        number_of_children INT NULL,

        -- Financial Information
        total_amount DECIMAL(10,2) DEFAULT 0,
        paid_amount DECIMAL(10,2) DEFAULT 0,
        balance DECIMAL(10,2) DEFAULT 0,
        currency VARCHAR(10) NULL,

        -- Additional Information
        special_requests TEXT NULL,
        notes TEXT NULL,

        -- Status Timestamps
        confirmed_at DATETIME NULL,
        checked_in_at DATETIME NULL,
        checked_out_at DATETIME NULL,
        canceled_at DATETIME NULL,
        canceled_reason VARCHAR(255) NULL,

        -- Audit Fields (di akhir)
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP NULL,

        -- Foreign Key Constraint
        CONSTRAINT fk_res_guest FOREIGN KEY (guest_id) REFERENCES guests(id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Indexes untuk reservations
    await queryRunner.query(`CREATE INDEX idx_res_guest_id ON reservations(guest_id);`);
    await queryRunner.query(`CREATE INDEX idx_res_booking_number ON reservations(booking_number);`);
    await queryRunner.query(`CREATE INDEX idx_res_status ON reservations(status);`);
    await queryRunner.query(`CREATE INDEX idx_res_check_in ON reservations(check_in);`);
    await queryRunner.query(`CREATE INDEX idx_res_check_out ON reservations(check_out);`);
    await queryRunner.query(`CREATE INDEX idx_res_booking_source ON reservations(booking_source);`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS reservations;`);

    await queryRunner.query(`DROP INDEX IF EXISTS idx_guests_guest_type ON guests;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_guests_lastname ON guests;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_guests_email ON guests;`);

    await queryRunner.query(`DROP TABLE IF EXISTS guests;`);
  }
}
