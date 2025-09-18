import { Request, Response, NextFunction } from "express";
import { createReservation, deleteReservation, getReservation, listReservations, updateReservation } from "./reservation.service";
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

    const reservations = await listReservations({ limit, offset });

    res.json(ok({
      data: reservations,
      pagination: {
        limit,
        offset,
        hasMore: reservations.length === limit,
      },
    }));
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
