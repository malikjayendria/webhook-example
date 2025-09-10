import crypto from "crypto";
export function hmacSHA256(secret: string, payload: string) {
  return crypto.createHmac("sha256", secret).update(payload, "utf8").digest("hex");
}
