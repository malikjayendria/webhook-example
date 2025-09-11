import axios from "axios";
import { env } from "../config/env";
import { logger } from "../config/logger";
import { AppDataSource } from "../config/data-source";

// HMAC utility function
function hmacSHA256(secret: string, payload: string): string {
  const crypto = require("crypto");
  return crypto.createHmac("sha256", secret).update(payload, "utf8").digest("hex");
}

type WebhookEvent = {
  type: "guest.created" | "guest.updated" | "guest.deleted" | "reservation.created" | "reservation.updated" | "reservation.deleted";
  idempotency_key: string; // gunakan UUID v4 di caller
  timestamp: number; // ms
  payload: unknown;
};

type WebhookQueueItem = WebhookEvent & {
  id?: string;
  retry_count: number;
  next_retry_at: Date;
  created_at: Date;
  updated_at: Date;
};

// In-memory queue for failed webhooks (in production, use Redis/database)
const failedWebhookQueue: WebhookQueueItem[] = [];
const processingQueue = new Set<string>();

// Circuit breaker state
let circuitBreakerState = "CLOSED"; // CLOSED, OPEN, HALF_OPEN
let circuitBreakerFailures = 0;
let circuitBreakerLastFailure = 0;
const CIRCUIT_BREAKER_THRESHOLD = 5;
const CIRCUIT_BREAKER_TIMEOUT = 60000; // 1 minute

// Webhook retry configuration
const MAX_RETRIES = 5;
const RETRY_DELAYS = [1000, 2000, 5000, 10000, 30000]; // milliseconds

/**
 * Send webhook asynchronously with retry mechanism
 */
export async function emitToCRM(event: WebhookEvent) {
  if (!env.webhook.url || !env.webhook.secret) {
    logger.warn({ msg: "Webhook not configured, skipping", event_type: event.type });
    return; // non-blocking jika belum di-set
  }

  logger.info({
    msg: "Webhook emission triggered",
    type: event.type,
    idempotency_key: event.idempotency_key,
    payload_email: (event.payload as any)?.email || "N/A",
  });

  // Check circuit breaker
  if (circuitBreakerState === "OPEN") {
    if (Date.now() - circuitBreakerLastFailure < CIRCUIT_BREAKER_TIMEOUT) {
      logger.warn({ msg: "Circuit breaker OPEN, queuing webhook", event_type: event.type });
      await queueFailedWebhook(event);
      return;
    } else {
      circuitBreakerState = "HALF_OPEN";
      logger.info({ msg: "Circuit breaker HALF_OPEN, testing connection" });
    }
  }

  // Send webhook asynchronously
  setImmediate(async () => {
    try {
      await sendWebhookWithRetry(event, 0);
    } catch (error) {
      logger.error({
        msg: "Critical error in webhook emission",
        type: event.type,
        idempotency_key: event.idempotency_key,
        error: (error as Error).message,
      });
    }
  });
}

/**
 * Send webhook with retry logic
 */
async function sendWebhookWithRetry(event: WebhookEvent, retryCount: number) {
  const idempotencyKey = `${event.idempotency_key}_${retryCount}`;

  // Prevent duplicate processing
  if (processingQueue.has(idempotencyKey)) {
    logger.warn({ msg: "Webhook already processing", idempotency_key: event.idempotency_key, retry: retryCount });
    return;
  }

  processingQueue.add(idempotencyKey);

  try {
    const body = JSON.stringify(event);
    const signature = hmacSHA256(env.webhook.secret, body);

    logger.info({
      msg: "Sending webhook",
      type: event.type,
      idempotency_key: event.idempotency_key,
      retry_count: retryCount,
      circuit_breaker: circuitBreakerState,
    });

    const response = await axios.post(env.webhook.url, body, {
      headers: {
        "Content-Type": "application/json",
        "X-Signature": signature,
        "X-Idempotency-Key": event.idempotency_key,
        "X-Event-Type": event.type,
        "X-Timestamp": String(event.timestamp),
      },
      timeout: 10000, // 10 seconds timeout
    });

    // Success
    if (response.status === 202 || response.status === 200) {
      logger.info({
        msg: "Webhook delivered successfully",
        type: event.type,
        idempotency_key: event.idempotency_key,
        status: response.status,
      });

      // Reset circuit breaker on success
      if (circuitBreakerState === "HALF_OPEN") {
        circuitBreakerState = "CLOSED";
        circuitBreakerFailures = 0;
        logger.info({ msg: "Circuit breaker CLOSED - connection restored" });
      }
    } else {
      throw new Error(`Unexpected status: ${response.status}`);
    }
  } catch (error: any) {
    logger.error({
      msg: "Webhook delivery failed",
      type: event.type,
      idempotency_key: event.idempotency_key,
      retry_count: retryCount,
      error: error.message,
      status: error.response?.status,
    });

    // Update circuit breaker
    circuitBreakerFailures++;
    circuitBreakerLastFailure = Date.now();

    if (circuitBreakerFailures >= CIRCUIT_BREAKER_THRESHOLD) {
      circuitBreakerState = "OPEN";
      logger.error({
        msg: "Circuit breaker OPEN - too many failures",
        failures: circuitBreakerFailures,
      });
    }

    // Retry logic
    if (retryCount < MAX_RETRIES) {
      const delay = RETRY_DELAYS[retryCount] || 30000;
      logger.info({
        msg: "Scheduling webhook retry",
        type: event.type,
        idempotency_key: event.idempotency_key,
        retry_count: retryCount + 1,
        delay_ms: delay,
      });

      setTimeout(() => {
        sendWebhookWithRetry(event, retryCount + 1);
      }, delay);
    } else {
      // Max retries reached, queue for later processing
      logger.error({
        msg: "Max retries reached, queuing failed webhook",
        type: event.type,
        idempotency_key: event.idempotency_key,
      });
      await queueFailedWebhook(event);
    }
  } finally {
    processingQueue.delete(idempotencyKey);
  }
}

/**
 * Queue failed webhook for later processing
 */
async function queueFailedWebhook(event: WebhookEvent) {
  const queueItem: WebhookQueueItem = {
    ...event,
    retry_count: MAX_RETRIES + 1,
    next_retry_at: new Date(Date.now() + 300000), // 5 minutes
    created_at: new Date(),
    updated_at: new Date(),
  };

  failedWebhookQueue.push(queueItem);

  logger.warn({
    msg: "Webhook queued for retry",
    type: event.type,
    idempotency_key: event.idempotency_key,
    queue_size: failedWebhookQueue.length,
  });
}

/**
 * Process queued failed webhooks (call this periodically)
 */
export async function processFailedWebhooks() {
  if (failedWebhookQueue.length === 0) return;

  const now = new Date();
  const toProcess = failedWebhookQueue.filter((item) => item.next_retry_at <= now);

  for (const item of toProcess) {
    // Remove from queue
    const index = failedWebhookQueue.indexOf(item);
    if (index > -1) failedWebhookQueue.splice(index, 1);

    // Retry
    logger.info({
      msg: "Retrying queued webhook",
      type: item.type,
      idempotency_key: item.idempotency_key,
    });

    await emitToCRM({
      type: item.type,
      idempotency_key: item.idempotency_key,
      timestamp: item.timestamp,
      payload: item.payload,
    });
  }
}

/**
 * Get webhook queue status
 */
export function getWebhookStatus() {
  return {
    circuit_breaker: {
      state: circuitBreakerState,
      failures: circuitBreakerFailures,
      last_failure: circuitBreakerLastFailure,
    },
    queue: {
      failed_count: failedWebhookQueue.length,
      processing_count: processingQueue.size,
    },
  };
}

/**
 * Start periodic processing of failed webhooks
 */
export function startWebhookProcessor() {
  setInterval(async () => {
    try {
      await processFailedWebhooks();
    } catch (error) {
      logger.error({ msg: "Failed webhook processor error", error: (error as Error).message });
    }
  }, 60000); // Process every minute

  logger.info({ msg: "Webhook processor started" });
}
