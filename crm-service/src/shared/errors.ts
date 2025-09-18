import { NextFunction, Request, Response } from "express";
import { logger } from "../config/logger";
import { fail } from "./http";
import { formatZodError, getErrorStatus, getErrorCode } from "./error-utils";

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  // Log the full error for debugging
  logger.error(err);

  // Format error message for user-friendly response
  let message = "Internal Server Error";

  try {
    // Handle Zod validation errors
    if (err?.name === "ZodError") {
      message = formatZodError(err);
    } else if (typeof err?.message === "string") {
      message = err.message;
    }

    // Handle specific known errors
    if (message === "Invalid signature" || message === "Timestamp skew too large" || message === "Missing headers") {
      message = "Invalid request data";
    }

    if (message === "Duplicate idempotency key" || message.startsWith("Idempotency key conflict")) {
      message = "Request already processed";
    }
  } catch (formatError) {
    // If formatting fails, use safe fallback
    message = "An error occurred while processing your request";
  }

  // Get appropriate status and error code
  const status = err?.status || getErrorStatus(err);
  const errorCode = getErrorCode(err);

  res.status(status).json(fail(message, errorCode));
}
