import { Request, Response, NextFunction } from "express";
import { eventRepo } from "./event.repository";
import { ok } from "../../shared/http";

export async function list(_req: Request, res: Response, next: NextFunction) {
  try {
    const items = await eventRepo.find({ order: { id: "DESC" }, take: 100 });
    res.json(ok(items));
  } catch (e) {
    next(e);
  }
}
