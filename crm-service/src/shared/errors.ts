import { NextFunction, Request, Response } from "express";
import { logger } from "../config/logger";
import { fail } from "./http";

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  const msg = typeof err?.message === "string" ? err.message : "Internal Server Error";

  let status = 500;
  if (msg === "Invalid signature" || msg === "Timestamp skew too large" || msg === "Missing headers") status = 400;
  if (msg === "Duplicate idempotency key" || msg.startsWith("Idempotency key conflict")) status = 409;
  if (typeof err?.status === "number") status = err.status; // <— hormati status custom di atas

  res.status(status).json(fail(msg, status === 409 ? "CONFLICT" : status >= 500 ? "INTERNAL" : "INVALID"));
}
