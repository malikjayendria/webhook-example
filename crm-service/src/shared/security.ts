import crypto from "crypto";
import { env } from "../config/env";

export function hmacSHA256(secret: string, payload: Buffer | string) {
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

export function verifySignature(raw: Buffer, provided: string) {
  const expected = hmacSHA256(env.webhook.secret, raw);

  console.log("=== SIGNATURE VERIFICATION ===");
  console.log("Raw body:", raw.toString("utf8"));
  console.log("Secret:", env.webhook.secret);
  console.log("Expected signature:", expected);
  console.log("Provided signature:", provided);

  // timing-safe compare
  const a = Buffer.from(expected);
  const b = Buffer.from(provided || "");
  const result = a.length === b.length && crypto.timingSafeEqual(a, b);
  console.log("Signature match:", result);

  return result;
}

export function isTimestampFresh(tsStr: string) {
  const ts = Number(tsStr);
  if (!Number.isFinite(ts)) return false;
  const now = Date.now();
  const skew = Math.abs(now - ts) / 1000;
  console.log(`Timestamp check: ts=${ts}, now=${now}, skew=${skew}, maxSkew=${env.webhook.maxSkewSec}`);
  return skew <= env.webhook.maxSkewSec;
}
