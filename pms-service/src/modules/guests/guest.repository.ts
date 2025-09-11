import { AppDataSource } from "../../config/data-source";
import { Guest } from "../../domain/guest.entity";
import { FindOptionsWhere, ILike } from "typeorm";

export const guestRepo = AppDataSource.getRepository(Guest);

export async function listGuests(params: { q?: string; limit?: number; offset?: number }) {
  const { q, limit = 50, offset = 0 } = params;

  const where: FindOptionsWhere<Guest>[] = [];
  if (q) {
    where.push({ email: ILike(`%${q}%`) });
    where.push({ name: ILike(`%${q}%`) });
  }

  return guestRepo.find({
    where: where.length ? where : undefined,
    order: { id: "DESC" },
    take: limit,
    skip: offset,
  });
}
