import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn, CreateDateColumn, Index } from "typeorm";

@Entity({ name: "guest_profiles" })
export class GuestProfile {
  @PrimaryGeneratedColumn({ type: "bigint" })
  id!: string;

  // Identitas dasar (diusahakan konsisten dengan PMS)
  @Column({ unique: true })
  @Index()
  email!: string;

  @Column({ nullable: true })
  name?: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({ type: "date", nullable: true })
  date_of_birth?: string;

  @Column({ nullable: true })
  country?: string;

  // Data agregat awal untuk rich profile (nanti bisa ditambah)
  @Column({ type: "int", default: 0 })
  total_reservations!: number;

  @Column({ type: "int", default: 0 })
  nights_lifetime!: number;

  @Column({ type: "json", nullable: true })
  last_reservation?: {
    room_number?: string;
    check_in?: string;
    check_out?: string;
    status?: string;
  };

  @CreateDateColumn({ type: "timestamp" })
  created_at!: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updated_at!: Date;
}
