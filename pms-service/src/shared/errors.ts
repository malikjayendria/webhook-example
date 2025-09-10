import { NextFunction, Request, Response } from "express";
import { logger } from "../config/logger";
import { fail } from "./http";

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  logger.error(err);
  const message = typeof err?.message === "string" ? err.message : "Internal Server Error";
  const status = message === "Email already exists" ? 409 : 500;
  res.status(status).json(fail(message, status === 409 ? "CONFLICT" : "INTERNAL_ERROR"));
}
