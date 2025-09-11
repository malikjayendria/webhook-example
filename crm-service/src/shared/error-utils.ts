/**
 * Error formatting utilities for better user experience
 */

export interface ValidationError {
  code: string;
  path: string[];
  message: string;
  values?: any[];
}

/**
 * Format Zod validation errors into user-friendly messages
 */
export function formatZodError(error: any): string {
  try {
    // Check if it's a Zod error
    if (error?.name === "ZodError" && Array.isArray(error?.issues)) {
      const issues = error.issues;

      // Group errors by field
      const fieldErrors: Record<string, string[]> = {};

      issues.forEach((issue: any) => {
        const field = issue.path?.join(".") || "unknown";
        const message = formatZodIssue(issue);

        if (!fieldErrors[field]) {
          fieldErrors[field] = [];
        }
        fieldErrors[field].push(message);
      });

      // Format grouped errors
      const errorMessages = Object.entries(fieldErrors).map(([field, messages]) => {
        return `${field}: ${messages.join(", ")}`;
      });

      return `Validation failed: ${errorMessages.join("; ")}`;
    }

    // If it's already a formatted string, return as is
    if (typeof error?.message === "string") {
      // Check if it's already a formatted validation error
      if (error.message.startsWith("Validation failed:")) {
        return error.message;
      }
    }

    // Fallback to original message
    return typeof error?.message === "string" ? error.message : "Unknown error";
  } catch (e) {
    // If formatting fails, return safe fallback
    return "Validation error occurred";
  }
}

/**
 * Format individual Zod issue into readable message
 */
function formatZodIssue(issue: any): string {
  const { code, message, received, expected } = issue;

  switch (code) {
    case "invalid_type":
      if (expected === "string" && received === "undefined") {
        return "is required";
      }
      return `must be ${expected}, received ${received}`;

    case "invalid_literal":
      return `must be "${expected}"`;

    case "too_small":
      if (issue.type === "string") {
        return `must be at least ${issue.minimum} characters`;
      }
      return `must be at least ${issue.minimum}`;

    case "too_big":
      if (issue.type === "string") {
        return `must be at most ${issue.maximum} characters`;
      }
      return `must be at most ${issue.maximum}`;

    case "invalid_string":
      if (issue.validation === "email") {
        return "must be a valid email address";
      }
      if (issue.validation === "regex") {
        return "format is invalid";
      }
      return message;

    case "invalid_enum_value":
      const values = issue.options?.join(", ") || "";
      return `must be one of: ${values}`;

    case "invalid_union":
      return "invalid value";

    default:
      return message || "invalid value";
  }
}

/**
 * Check if error is a validation error
 */
export function isValidationError(error: any): boolean {
  return error?.name === "ZodError" || error?.message?.includes("Validation failed");
}

/**
 * Get appropriate HTTP status for error
 */
export function getErrorStatus(error: any): number {
  if (isValidationError(error)) {
    return 400; // Bad Request
  }

  const message = error?.message || "";
  if (message.includes("already exists") || message.includes("duplicate")) {
    return 409; // Conflict
  }

  if (message.includes("not found")) {
    return 404; // Not Found
  }

  if (message.includes("unauthorized") || message.includes("forbidden")) {
    return 403; // Forbidden
  }

  return 500; // Internal Server Error
}

/**
 * Get error code for response
 */
export function getErrorCode(error: any): string {
  if (isValidationError(error)) {
    return "VALIDATION_ERROR";
  }

  const message = error?.message || "";
  if (message.includes("already exists") || message.includes("duplicate")) {
    return "CONFLICT";
  }

  if (message.includes("not found")) {
    return "NOT_FOUND";
  }

  if (message.includes("unauthorized")) {
    return "UNAUTHORIZED";
  }

  if (message.includes("forbidden")) {
    return "FORBIDDEN";
  }

  return "INTERNAL_ERROR";
}
