import { reservationRepo } from "./reservation.repository";
import { CreateReservationDTO, UpdateReservationDTO } from "./reservation.dto";

export async function createReservation(input: CreateReservationDTO) {
  const resv = reservationRepo.create({
    guest_id: String(input.guest_id),
    room_number: input.room_number,
    check_in: input.check_in,
    check_out: input.check_out,
    status: input.status ?? "booked",
  });
  const saved = await reservationRepo.save(resv);
  // Load guest relation for webhook payload
  return reservationRepo.findOne({
    where: { id: saved.id },
    relations: ["guest"],
  });
}

export function getReservation(id: string) {
  return reservationRepo.findOne({ where: { id }, relations: ["guest"] });
}

export function listReservations() {
  return reservationRepo.find({ order: { id: "DESC" }, relations: ["guest"] });
}

export async function updateReservation(id: string, input: UpdateReservationDTO) {
  const r = await getReservation(id);
  if (!r) return null;
  Object.assign(r, input);
  return reservationRepo.save(r);
}

export async function deleteReservation(id: string) {
  const r = await getReservation(id);
  if (!r) return null;
  await reservationRepo.softRemove(r);
  return true;
}
