import { AppDataSource } from "../../config/data-source";
import { Guest } from "../../domain/guest.entity";
import { FindOptionsWhere, ILike } from "typeorm";

export const guestRepo = AppDataSource.getRepository(Guest);

export async function listGuests(params: { q?: string; limit?: number; offset?: number }) {
  const { q, limit = 50, offset = 0 } = params;

  const where: FindOptionsWhere<Guest>[] = [];
  if (q) {
    // Search across multiple fields
    where.push({ email: ILike(`%${q}%`) });
    where.push({ first_name: ILike(`%${q}%`) });
    where.push({ last_name: ILike(`%${q}%`) });
    where.push({ preferred_name: ILike(`%${q}%`) });
    where.push({ phone_number: ILike(`%${q}%`) });
  }

  return guestRepo.find({
    where: where.length ? where : undefined,
    order: { created_at: "DESC" },
    take: limit,
    skip: offset,
  });
}
