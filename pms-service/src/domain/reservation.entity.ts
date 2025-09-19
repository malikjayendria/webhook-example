import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, Index } from "typeorm";
import { Guest } from "./guest.entity";

export type ReservationStatus = "booked" | "confirmed" | "checked_in" | "checked_out" | "canceled" | "no_show";
export type BookingSource = "website" | "phone" | "walk_in" | "ota" | "corporate" | "agency" | "other";
export type RoomType = "standard" | "deluxe" | "suite" | "executive" | "presidential" | "villa" | "other";

@Entity({ name: "reservations" })
export class Reservation {
  @PrimaryGeneratedColumn({ type: "bigint" })
  id!: string;

  // === BOOKING IDENTIFICATION ===
  @Column({ unique: true })
  @Index()
  booking_number!: string; // Unique booking reference

  @Column({ type: "bigint" })
  guest_id!: string;

  @ManyToOne(() => Guest, (g) => g.reservations)
  @JoinColumn({ name: "guest_id" })
  guest!: Guest;

  // === ROOM INFORMATION ===
  @Column({ nullable: true })
  room_type?: RoomType;

  @Column({ nullable: true })
  room_allocation?: string; // Specific room assignment

  @Column()
  room_number!: string;

  // === DATES ===
  @Column({ type: "date" })
  check_in!: string;

  @Column({ type: "date" })
  check_out!: string;

  // === BOOKING DETAILS ===
  @Column({ type: "enum", enum: ["website", "phone", "walk_in", "ota", "corporate", "agency", "other"], default: "website" })
  booking_source!: BookingSource;

  @Column({ type: "enum", enum: ["booked", "confirmed", "checked_in", "checked_out", "canceled", "no_show"], default: "booked" })
  status!: ReservationStatus;

  // === FINANCIAL ===
  @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
  total_amount!: number;

  @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
  paid_amount!: number;

  @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
  balance!: number; // total_amount - paid_amount

  @Column({ nullable: true })
  currency?: string; // USD, EUR, IDR, etc.

  // === ADDITIONAL INFORMATION ===
  @Column({ type: "int", nullable: true })
  number_of_guests?: number;

  @Column({ type: "int", nullable: true })
  number_of_adults?: number;

  @Column({ type: "int", nullable: true })
  number_of_children?: number;

  @Column({ type: "text", nullable: true })
  special_requests?: string;

  @Column({ type: "text", nullable: true })
  notes?: string;

  // === SYSTEM FIELDS ===
  @Column({ type: "datetime", nullable: true })
  confirmed_at?: Date;

  @Column({ type: "datetime", nullable: true })
  checked_in_at?: Date;

  @Column({ type: "datetime", nullable: true })
  checked_out_at?: Date;

  @Column({ type: "datetime", nullable: true })
  canceled_at?: Date;

  @Column({ nullable: true })
  canceled_reason?: string;

  // === AUDIT FIELDS ===
  @CreateDateColumn({ type: "timestamp" })
  created_at!: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updated_at!: Date;

  @DeleteDateColumn({ type: "timestamp", nullable: true })
  deleted_at?: Date | null;

  // === COMPUTED PROPERTIES ===
  get guest_name(): string {
    return this.guest?.full_name || "Unknown Guest";
  }

  get duration(): number {
    if (!this.check_in || !this.check_out) return 0;
    const checkIn = new Date(this.check_in);
    const checkOut = new Date(this.check_out);
    const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  get is_active(): boolean {
    return ["booked", "confirmed", "checked_in"].includes(this.status);
  }

  get is_completed(): boolean {
    return this.status === "checked_out";
  }

  get is_canceled(): boolean {
    return this.status === "canceled";
  }

  get payment_status(): "unpaid" | "partial" | "paid" {
    if (this.balance <= 0) return "paid";
    if (this.paid_amount > 0) return "partial";
    return "unpaid";
  }

  // Auto-generate booking number
  generateBookingNumber(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");
    return `BK${timestamp}${random}`;
  }
}
