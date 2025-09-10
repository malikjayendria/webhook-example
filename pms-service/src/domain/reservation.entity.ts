import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from "typeorm";
import { Guest } from "./guest.entity";

@Entity({ name: "reservations" })
export class Reservation {
  @PrimaryGeneratedColumn({ type: "bigint" })
  id!: string;

  @Column({ type: "bigint" })
  guest_id!: string;

  @ManyToOne(() => Guest, (g) => g.reservations)
  @JoinColumn({ name: "guest_id" })
  guest!: Guest;

  @Column()
  room_number!: string;

  @Column({ type: "date" })
  check_in!: string;

  @Column({ type: "date" })
  check_out!: string;

  @Column({ default: "booked" })
  status!: "booked" | "checked_in" | "checked_out" | "canceled";

  @CreateDateColumn({ type: "timestamp" })
  created_at!: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updated_at!: Date;

  @DeleteDateColumn({ type: "timestamp", nullable: true })
  deleted_at?: Date | null;
}
