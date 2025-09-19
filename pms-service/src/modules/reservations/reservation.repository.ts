import { AppDataSource } from "../../config/data-source";
import { Reservation } from "../../domain/reservation.entity";
import { FindOptionsWhere, ILike, Between, MoreThanOrEqual, LessThanOrEqual } from "typeorm";

export const reservationRepo = AppDataSource.getRepository(Reservation);

export interface ReservationSearchParams {
  q?: string; // General search
  guest_id?: string;
  status?: string;
  booking_source?: string;
  room_type?: string;
  check_in_from?: string;
  check_in_to?: string;
  check_out_from?: string;
  check_out_to?: string;
  min_balance?: number;
  max_balance?: number;
  limit?: number;
  offset?: number;
}

export async function searchReservations(params: ReservationSearchParams) {
  const { q, guest_id, status, booking_source, room_type, check_in_from, check_in_to, check_out_from, check_out_to, min_balance, max_balance, limit = 50, offset = 0 } = params;

  const where: FindOptionsWhere<Reservation>[] = [];

  // General search across multiple fields
  if (q) {
    where.push({ booking_number: ILike(`%${q}%`) }, { room_number: ILike(`%${q}%`) }, { guest: { first_name: ILike(`%${q}%`) } }, { guest: { last_name: ILike(`%${q}%`) } }, { guest: { email: ILike(`%${q}%`) } });
  }

  // Specific filters
  const specificWhere: FindOptionsWhere<Reservation> = {};

  if (guest_id) {
    specificWhere.guest_id = guest_id;
  }

  if (status) {
    specificWhere.status = status as any;
  }

  if (booking_source) {
    specificWhere.booking_source = booking_source as any;
  }

  if (room_type) {
    specificWhere.room_type = room_type as any;
  }

  // Date range filters
  if (check_in_from || check_in_to) {
    if (check_in_from && check_in_to) {
      specificWhere.check_in = Between(check_in_from, check_in_to);
    } else if (check_in_from) {
      specificWhere.check_in = MoreThanOrEqual(check_in_from);
    } else if (check_in_to) {
      specificWhere.check_in = LessThanOrEqual(check_in_to);
    }
  }

  if (check_out_from || check_out_to) {
    if (check_out_from && check_out_to) {
      specificWhere.check_out = Between(check_out_from, check_out_to);
    } else if (check_out_from) {
      specificWhere.check_out = MoreThanOrEqual(check_out_from);
    } else if (check_out_to) {
      specificWhere.check_out = LessThanOrEqual(check_out_to);
    }
  }

  // Balance filters
  if (min_balance !== undefined || max_balance !== undefined) {
    if (min_balance !== undefined && max_balance !== undefined) {
      specificWhere.balance = Between(min_balance, max_balance);
    } else if (min_balance !== undefined) {
      specificWhere.balance = MoreThanOrEqual(min_balance);
    } else if (max_balance !== undefined) {
      specificWhere.balance = LessThanOrEqual(max_balance);
    }
  }

  // Add specific filters if any
  if (Object.keys(specificWhere).length > 0) {
    where.push(specificWhere);
  }

  return reservationRepo.find({
    where: where.length ? where : undefined,
    relations: ["guest"],
    order: { created_at: "DESC" },
    take: limit,
    skip: offset,
  });
}

export async function getReservationsByGuest(guestId: string, limit = 10) {
  return reservationRepo.find({
    where: { guest_id: guestId },
    relations: ["guest"],
    order: { check_in: "DESC" },
    take: limit,
  });
}

export async function getReservationsByStatus(status: string, limit = 50) {
  return reservationRepo.find({
    where: { status: status as any },
    relations: ["guest"],
    order: { created_at: "DESC" },
    take: limit,
  });
}

export async function getUpcomingReservations(daysAhead = 30) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + daysAhead);

  return reservationRepo.find({
    where: {
      check_in: Between(new Date().toISOString().split("T")[0], futureDate.toISOString().split("T")[0]),
      status: "confirmed" as any,
    },
    relations: ["guest"],
    order: { check_in: "ASC" },
  });
}

export async function getReservationStats() {
  const total = await reservationRepo.count();
  const active = await reservationRepo.count({ where: { status: "confirmed" as any } });
  const checkedIn = await reservationRepo.count({ where: { status: "checked_in" as any } });
  const completed = await reservationRepo.count({ where: { status: "checked_out" as any } });
  const canceled = await reservationRepo.count({ where: { status: "canceled" as any } });

  // Calculate total revenue
  const revenueResult = await reservationRepo
    .createQueryBuilder("reservation")
    .select("SUM(reservation.total_amount)", "total")
    .where("reservation.status IN (:...statuses)", { statuses: ["confirmed", "checked_in", "checked_out"] })
    .getRawOne();

  return {
    total,
    active,
    checkedIn,
    completed,
    canceled,
    totalRevenue: parseFloat(revenueResult?.total || "0"),
  };
}
