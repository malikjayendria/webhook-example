import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, OneToMany } from "typeorm";
import { Reservation } from "./reservation.entity";

@Entity({ name: "guests" })
export class Guest {
  @PrimaryGeneratedColumn({ type: "bigint" })
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ nullable: true })
  name?: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({ type: "date", nullable: true })
  date_of_birth?: string;

  @Column({ nullable: true })
  country?: string;

  @CreateDateColumn({ type: "timestamp" })
  created_at!: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updated_at!: Date;

  @DeleteDateColumn({ type: "timestamp", nullable: true })
  deleted_at?: Date | null;

  @OneToMany(() => Reservation, (r) => r.guest)
  reservations!: Reservation[];
}
