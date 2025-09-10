import { guestRepo, listGuests as repoListGuests } from "./guest.repository";
import { CreateGuestDTO, UpdateGuestDTO } from "./guest.dto";
import { Guest } from "../../domain/guest.entity";

export async function createGuest(input: CreateGuestDTO): Promise<Guest> {
  const existing = await guestRepo.findOne({ where: { email: input.email } });
  if (existing) throw new Error("Email already exists");
  const guest = guestRepo.create(input);
  return guestRepo.save(guest);
}

export function listGuests(params: { q?: string }) {
  return repoListGuests(params);
}

export function getGuest(id: string) {
  return guestRepo.findOne({ where: { id } });
}

export async function updateGuest(id: string, input: UpdateGuestDTO) {
  const g = await getGuest(id);
  if (!g) return null;
  if (input.email && input.email !== g.email) {
    const dup = await guestRepo.findOne({ where: { email: input.email } });
    if (dup) throw new Error("Email already exists");
  }
  Object.assign(g, input);
  return guestRepo.save(g);
}

export async function deleteGuest(id: string) {
  const g = await getGuest(id);
  if (!g) return null;
  await guestRepo.softRemove(g);
  return true;
}
