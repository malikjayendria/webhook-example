import { Request, Response, NextFunction } from "express";
import {
  createReservation,
  deleteReservation,
  getReservation,
  listReservations,
  updateReservation,
  getReservationsByGuestId,
  getReservationsByStatusFilter,
  getUpcomingReservationsList,
  getReservationStatistics,
} from "./reservation.service";
import { createReservationSchema, updateReservationSchema } from "./reservation.dto";
import { ok, fail, created as okCreated } from "../../shared/http";
import { emitToCRM } from "../../shared/webhook";
import { randomUUID } from "crypto";

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const data = createReservationSchema.parse(req.body);
    const r = await createReservation(data);
    res.status(201).json(okCreated(r));
    await emitToCRM({ type: "reservation.created", idempotency_key: randomUUID(), timestamp: Date.now(), payload: r });
  } catch (e) {
    next(e);
  }
}

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100); // Max 100
    const offset = Math.max(parseInt(req.query.offset as string) || 0, 0);

    // Build search parameters from query
    const searchParams = {
      q: req.query.q as string,
      guest_id: req.query.guest_id as string,
      status: req.query.status as string,
      booking_source: req.query.booking_source as string,
      room_type: req.query.room_type as string,
      check_in_from: req.query.check_in_from as string,
      check_in_to: req.query.check_in_to as string,
      check_out_from: req.query.check_out_from as string,
      check_out_to: req.query.check_out_to as string,
      min_balance: req.query.min_balance ? parseFloat(req.query.min_balance as string) : undefined,
      max_balance: req.query.max_balance ? parseFloat(req.query.max_balance as string) : undefined,
      limit,
      offset,
    };

    const reservations = await listReservations(searchParams);

    res.json(
      ok({
        data: reservations,
        pagination: {
          limit,
          offset,
          hasMore: reservations.length === limit,
          query: searchParams.q || undefined,
        },
        filters: {
          applied: Object.fromEntries(Object.entries(searchParams).filter(([key, value]) => value !== undefined && value !== "" && !["limit", "offset"].includes(key))),
        },
      })
    );
  } catch (e) {
    next(e);
  }
}

export async function detail(req: Request, res: Response, next: NextFunction) {
  try {
    const r = await getReservation(String(req.params.id));
    if (!r) return res.status(404).json(fail("Reservation not found", "NOT_FOUND"));
    res.json(ok(r));
  } catch (e) {
    next(e);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const data = updateReservationSchema.parse(req.body);
    const r = await updateReservation(String(req.params.id), data);
    if (!r) return res.status(404).json(fail("Reservation not found", "NOT_FOUND"));
    res.json(ok(r));
    await emitToCRM({ type: "reservation.updated", idempotency_key: randomUUID(), timestamp: Date.now(), payload: r });
  } catch (e) {
    next(e);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const okDel = await deleteReservation(String(req.params.id));
    if (!okDel) return res.status(404).json(fail("Reservation not found", "NOT_FOUND"));
    res.json(ok({ message: "Reservation deleted successfully" }));
    await emitToCRM({ type: "reservation.deleted", idempotency_key: randomUUID(), timestamp: Date.now(), payload: { id: req.params.id } });
  } catch (e) {
    next(e);
  }
}

// Additional endpoints for advanced functionality
export async function getByGuest(req: Request, res: Response, next: NextFunction) {
  try {
    const guestId = req.params.guestId;
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);

    const reservations = await getReservationsByGuestId(guestId, limit);
    res.json(ok(reservations));
  } catch (e) {
    next(e);
  }
}

export async function getByStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const status = req.params.status;
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);

    const reservations = await getReservationsByStatusFilter(status, limit);
    res.json(ok(reservations));
  } catch (e) {
    next(e);
  }
}

export async function getUpcoming(req: Request, res: Response, next: NextFunction) {
  try {
    const daysAhead = Math.min(parseInt(req.query.days as string) || 30, 90); // Max 90 days

    const reservations = await getUpcomingReservationsList(daysAhead);
    res.json(ok(reservations));
  } catch (e) {
    next(e);
  }
}

export async function getStats(req: Request, res: Response, next: NextFunction) {
  try {
    const stats = await getReservationStatistics();
    res.json(ok(stats));
  } catch (e) {
    next(e);
  }
}
