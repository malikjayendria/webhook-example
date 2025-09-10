import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index, Unique } from "typeorm";

@Entity({ name: "events" })
@Unique("uq_idempotency_key", ["idempotency_key"])
export class EventEntity {
  @PrimaryGeneratedColumn({ type: "bigint" })
  id!: string;

  @Column() type!: string;

  @Column({ length: 191 })
  @Index()
  idempotency_key!: string;

  @Column({ type: "bigint" })
  timestamp!: string;

  @Column({ type: "json" })
  payload!: unknown;

  @Column({ type: "varchar", length: 128 })
  signature!: string;

  @Column({ type: "varchar", length: 45, nullable: true })
  source_ip?: string | null;

  @CreateDateColumn({ type: "timestamp" })
  received_at!: Date;
}
