import { Request, Response, NextFunction } from "express";
import { createGuest, deleteGuest, getGuest, listGuests, updateGuest } from "./guest.service";
import { createGuestSchema, updateGuestSchema } from "./guest.dto";
import { ok, created as okCreated, fail } from "../../shared/http";
import { emitToCRM } from "../../shared/webhook";
import { randomUUID } from "crypto";

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const data = createGuestSchema.parse(req.body);
    const g = await createGuest(data);
    res.status(201).json(okCreated(g));
    await emitToCRM({
      type: "guest.created",
      idempotency_key: randomUUID(),
      timestamp: Date.now(),
      payload: g,
    });
  } catch (e) {
    next(e);
  }
}

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const q = String(req.query.q ?? "");
    const items = await listGuests({ q: q || undefined });
    res.json(ok(items));
  } catch (e) {
    next(e);
  }
}

export async function detail(req: Request, res: Response, next: NextFunction) {
  try {
    const g = await getGuest(String(req.params.id));
    if (!g) return res.status(404).json(fail("Guest not found", "NOT_FOUND"));
    res.json(ok(g));
  } catch (e) {
    next(e);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const data = updateGuestSchema.parse(req.body);
    const g = await updateGuest(String(req.params.id), data);
    if (!g) return res.status(404).json(fail("Guest not found", "NOT_FOUND"));
    res.json(ok(g));
    await emitToCRM({
      type: "guest.updated",
      idempotency_key: randomUUID(),
      timestamp: Date.now(),
      payload: g,
    });
  } catch (e) {
    next(e);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const okDel = await deleteGuest(String(req.params.id));
    if (!okDel) return res.status(404).json(fail("Guest not found", "NOT_FOUND"));
    res.json(ok({ message: "Guest deleted successfully" }));
    await emitToCRM({
      type: "guest.deleted",
      idempotency_key: randomUUID(),
      timestamp: Date.now(),
      payload: { id: req.params.id },
    });
  } catch (e) {
    next(e);
  }
}
