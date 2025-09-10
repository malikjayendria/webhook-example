import { Request, Response, NextFunction } from "express";
import { gpRepo } from "./guest_profile.repository";
import { ok } from "../../shared/http";

export async function list(_req: Request, res: Response, next: NextFunction) {
  try {
    const items = await gpRepo.find({ order: { id: "DESC" } });
    res.json(ok(items));
  } catch (e) {
    next(e);
  }
}
