import { AppDataSource } from "../../config/data-source";
import { EventEntity } from "../../domain/event.entity";

export const eventRepo = AppDataSource.getRepository(EventEntity);

export async function recordEvent(data: { type: string; idempotency_key: string; timestamp: string; payload: unknown; signature: string; source_ip?: string }) {
  const e = eventRepo.create(data);
  return eventRepo.save(e);
}

export function findEventByIdemKey(key: string) {
  return eventRepo.findOne({ where: { idempotency_key: key } });
}
