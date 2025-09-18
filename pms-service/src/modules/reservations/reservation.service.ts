import { reservationRepo } from "./reservation.repository";
import { guestRepo } from "../guests/guest.repository";
import { CreateReservationDTO, UpdateReservationDTO } from "./reservation.dto";

export async function createReservation(input: CreateReservationDTO) {
  // Validate guest exists before creating reservation
  const guest = await guestRepo.findOne({ where: { id: String(input.guest_id) } });
  if (!guest) {
    throw new Error("Guest not found");
  }

  const resv = reservationRepo.create({
    guest_id: String(input.guest_id),
    room_number: input.room_number,
    check_in: input.check_in,
    check_out: input.check_out,
    status: input.status ?? "booked",
  });

  try {
    const saved = await reservationRepo.save(resv);
    // Load guest relation for webhook payload
    return reservationRepo.findOne({
      where: { id: saved.id },
      relations: ["guest"],
    });
  } catch (error: any) {
    // Handle database constraint errors
    if (error.code === "ER_NO_REFERENCED_ROW_2") {
      throw new Error("Invalid guest ID");
    }
    if (error.code === "ER_DUP_ENTRY") {
      throw new Error("Reservation already exists");
    }
    throw error;
  }
}

export function getReservation(id: string) {
  return reservationRepo.findOne({ where: { id }, relations: ["guest"] });
}

export function listReservations(options: { limit?: number; offset?: number } = {}) {
  const { limit = 50, offset = 0 } = options;

  return reservationRepo.find({
    order: { id: "DESC" },
    relations: ["guest"],
    take: limit,
    skip: offset,
  });
}

export async function updateReservation(id: string, input: UpdateReservationDTO) {
  const r = await getReservation(id);
  if (!r) return null;

  // Validate guest exists if guest_id is being updated
  if (input.guest_id) {
    const guest = await guestRepo.findOne({ where: { id: String(input.guest_id) } });
    if (!guest) {
      throw new Error("Guest not found");
    }
  }

  Object.assign(r, input);

  try {
    return await reservationRepo.save(r);
  } catch (error: any) {
    // Handle database constraint errors
    if (error.code === "ER_NO_REFERENCED_ROW_2") {
      throw new Error("Invalid guest ID");
    }
    if (error.code === "ER_DUP_ENTRY") {
      throw new Error("Reservation conflict");
    }
    throw error;
  }
}

export async function deleteReservation(id: string) {
  const r = await getReservation(id);
  if (!r) return null;
  await reservationRepo.softRemove(r);
  return true;
}
