import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, OneToMany, Index } from "typeorm";
import { Reservation } from "./reservation.entity";

export type Gender = "male" | "female" | "other" | "prefer_not_to_say";
export type GuestType = "regular" | "vip" | "blacklisted" | "other";

@Entity({ name: "guests" })
export class Guest {
  @PrimaryGeneratedColumn({ type: "bigint" })
  id!: string;

  // === BASIC INFORMATION ===
  @Column({ nullable: true })
  first_name?: string;

  @Column({ nullable: true })
  last_name?: string;

  @Column({ nullable: true })
  middle_name?: string;

  @Column({ nullable: true })
  preferred_name?: string;

  @Column({ type: "enum", enum: ["male", "female", "other", "prefer_not_to_say"], nullable: true })
  gender?: Gender;

  @Column({ unique: true })
  @Index()
  email!: string;

  @Column({ nullable: true })
  phone_number?: string;

  @Column({ type: "date", nullable: true })
  birthdate?: string;

  // === ADDRESS INFORMATION ===
  @Column({ nullable: true })
  address_line_1?: string;

  @Column({ nullable: true })
  address_line_2?: string;

  @Column({ nullable: true })
  city?: string;

  @Column({ nullable: true })
  country_of_residence?: string;

  @Column({ nullable: true })
  nationality?: string;

  @Column({ nullable: true })
  zip_code?: string;

  // === SYSTEM & BUSINESS LOGIC ===
  @Column({ type: "enum", enum: ["regular", "vip", "blacklisted", "other"], default: "regular" })
  guest_type!: GuestType;

  // === AUDIT FIELDS ===
  @CreateDateColumn({ type: "timestamp" })
  created_at!: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updated_at!: Date;

  @DeleteDateColumn({ type: "timestamp", nullable: true })
  deleted_at?: Date | null;

  // === RELATIONSHIPS ===
  @OneToMany(() => Reservation, (r) => r.guest)
  reservations!: Reservation[];

  // === COMPUTED PROPERTIES ===
  get full_name(): string {
    if (this.first_name && this.last_name) {
      return `${this.first_name} ${this.last_name}`.trim();
    }
    return this.first_name || this.last_name || this.preferred_name || this.email || "Unknown Guest";
  }

  get display_name(): string {
    return this.preferred_name || this.full_name;
  }

  get age(): number | null {
    if (!this.birthdate) return null;
    const today = new Date();
    const birthDate = new Date(this.birthdate);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  }

  get is_adult(): boolean {
    const age = this.age;
    return age !== null && age >= 18;
  }

  get is_vip(): boolean {
    return this.guest_type === "vip";
  }

  get is_blacklisted(): boolean {
    return this.guest_type === "blacklisted";
  }
}
