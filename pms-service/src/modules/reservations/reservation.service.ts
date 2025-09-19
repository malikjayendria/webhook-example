import { reservationRepo, searchReservations, getReservationsByGuest, getReservationsByStatus, getUpcomingReservations, getReservationStats, ReservationSearchParams } from "./reservation.repository";
import { guestRepo } from "../guests/guest.repository";
import { CreateReservationDTO, UpdateReservationDTO } from "./reservation.dto";

export async function createReservation(input: CreateReservationDTO) {
  // Validate guest exists before creating reservation
  const guest = await guestRepo.findOne({ where: { id: String(input.guest_id) } });
  if (!guest) {
    throw new Error("Guest not found");
  }

  // Generate booking number if not provided
  const bookingNumber = input.booking_number || generateBookingNumber();

  // Calculate balance
  const totalAmount = input.total_amount || 0;
  const paidAmount = input.paid_amount || 0;
  const balance = totalAmount - paidAmount;

  const resv = reservationRepo.create({
    booking_number: bookingNumber,
    guest_id: String(input.guest_id),
    room_type: input.room_type,
    room_allocation: input.room_allocation,
    room_number: input.room_number,
    check_in: input.check_in,
    check_out: input.check_out,
    booking_source: input.booking_source || "website",
    status: input.status || "booked",
    total_amount: totalAmount,
    paid_amount: paidAmount,
    balance: balance,
    currency: input.currency || "USD",
    number_of_guests: input.number_of_guests,
    number_of_adults: input.number_of_adults,
    number_of_children: input.number_of_children,
    special_requests: input.special_requests,
    notes: input.notes,
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
      if (error.message.includes("booking_number")) {
        throw new Error("Booking number already exists");
      }
      throw new Error("Reservation already exists");
    }
    throw error;
  }
}

// Helper function to generate booking number
function generateBookingNumber(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");
  return `BK${timestamp}${random}`;
}

export function getReservation(id: string) {
  return reservationRepo.findOne({ where: { id }, relations: ["guest"] });
}

export function listReservations(params: ReservationSearchParams = {}) {
  return searchReservations(params);
}

export function getReservationsByGuestId(guestId: string, limit = 10) {
  return getReservationsByGuest(guestId, limit);
}

export function getReservationsByStatusFilter(status: string, limit = 50) {
  return getReservationsByStatus(status, limit);
}

export function getUpcomingReservationsList(daysAhead = 30) {
  return getUpcomingReservations(daysAhead);
}

export function getReservationStatistics() {
  return getReservationStats();
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
