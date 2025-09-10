import { AppDataSource } from "../../config/data-source";
import { Guest } from "../../domain/guest.entity";
import { FindOptionsWhere, ILike } from "typeorm";

export const guestRepo = AppDataSource.getRepository(Guest);

export async function listGuests(params: { q?: string }) {
  const where: FindOptionsWhere<Guest>[] = [];
  if (params.q) {
    where.push({ email: ILike(`%${params.q}%`) });
    where.push({ name: ILike(`%${params.q}%`) });
  }
  return guestRepo.find({ where: where.length ? where : undefined, order: { id: "DESC" } });
}
