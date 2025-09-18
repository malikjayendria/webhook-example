/**
 * Input sanitization middleware
 */

import { Request, Response, NextFunction } from "express";

/**
 * Sanitize string inputs to prevent XSS and other injection attacks
 */
export function sanitizeInput(req: Request, res: Response, next: NextFunction) {
  // Sanitize query parameters
  if (req.query) {
    sanitizeObject(req.query);
  }

  // Sanitize body parameters
  if (req.body && typeof req.body === "object") {
    sanitizeObject(req.body);
  }

  // Sanitize route parameters
  if (req.params) {
    sanitizeObject(req.params);
  }

  next();
}

/**
 * Recursively sanitize object properties
 */
function sanitizeObject(obj: any): void {
  if (!obj || typeof obj !== "object" || obj === null) {
    return;
  }

  // Handle arrays
  if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) {
      if (typeof obj[i] === "string") {
        obj[i] = sanitizeString(obj[i]);
      } else if (typeof obj[i] === "object" && obj[i] !== null) {
        sanitizeObject(obj[i]);
      }
    }
    return;
  }

  // Handle plain objects
  const keys = Object.keys(obj);
  for (const key of keys) {
    const value = obj[key];

    if (typeof value === "string") {
      obj[key] = sanitizeString(value);
    } else if (Array.isArray(value)) {
      // Sanitize array elements
      obj[key] = value.map((item) => (typeof item === "string" ? sanitizeString(item) : item));
    } else if (typeof value === "object" && value !== null) {
      // Recursively sanitize nested objects
      sanitizeObject(value);
    }
  }
}

/**
 * Sanitize individual string values
 */
function sanitizeString(str: string): string {
  if (typeof str !== "string") {
    return str;
  }

  return (
    str
      // Remove null bytes
      .replace(/\0/g, "")
      // Remove potential script tags
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      // Remove potential HTML tags
      .replace(/<[^>]*>/g, "")
      // Remove potential SQL injection patterns (basic)
      .replace(/(\b(union|select|insert|update|delete|drop|create|alter)\b)/gi, "")
      // Trim whitespace
      .trim()
      // Limit length to prevent buffer overflow
      .substring(0, 10000)
  );
}

/**
 * Validate and sanitize email addresses
 */
export function sanitizeEmail(email: string): string {
  if (typeof email !== "string") {
    return email;
  }

  return email
    .toLowerCase()
    .trim()
    .replace(/[<>'"&]/g, "") // Remove potentially dangerous characters
    .substring(0, 255); // Limit length
}

/**
 * Validate and sanitize phone numbers
 */
export function sanitizePhone(phone: string): string {
  if (typeof phone !== "string") {
    return phone;
  }

  return phone
    .replace(/[^\d\s\-\+\(\)]/g, "") // Only allow digits, spaces, hyphens, plus, parentheses
    .trim()
    .substring(0, 20); // Limit length
}

/**
 * Validate and sanitize room numbers
 */
export function sanitizeRoomNumber(roomNumber: string): string {
  if (typeof roomNumber !== "string") {
    return roomNumber;
  }

  return roomNumber
    .replace(/[^A-Z0-9\-]/gi, "") // Only allow alphanumeric and hyphens
    .toUpperCase()
    .trim()
    .substring(0, 10); // Limit length
}
