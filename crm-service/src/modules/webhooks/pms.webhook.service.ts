import { findEventByIdemKey, recordEvent } from "../events/event.repository";
import { upsertGuestFromGuestPayload, applyReservationAggregation } from "../guest_profiles/guest_profile.repository";
import { webhookHeadersSchema, guestPayloadSchema, reservationPayloadSchema } from "./pms.webhook.schemas";
import { verifySignature, isTimestampFresh, hmacSHA256 } from "../../shared/security"; // pastikan export hmacSHA256
import { AppDataSource } from "../../config/data-source";

export async function handleWebhook(req: any) {
  const headers = webhookHeadersSchema.parse({
    "x-signature": req.headers["x-signature"],
    "x-idempotency-key": req.headers["x-idempotency-key"],
    "x-event-type": req.headers["x-event-type"],
    "x-timestamp": req.headers["x-timestamp"],
  });

  if (!isTimestampFresh(headers["x-timestamp"])) throw new Error("Timestamp skew too large");

  const raw: Buffer = req.rawBody;
  if (!raw) throw new Error("Raw body not captured");
  const ok = verifySignature(raw, headers["x-signature"]);
  if (!ok) throw new Error("Invalid signature");

  const existing = await findEventByIdemKey(headers["x-idempotency-key"]);
  const payload = JSON.parse(raw.toString("utf8"));

  if (existing) {
    // payload sama? (pakai signature yang sudah kita simpan di tabel events)
    if (existing.signature === headers["x-signature"]) {
      // idempotent replay → terima lagi tanpa re-proses (atau boleh re-proses jika idempotent)
      return { ok: true, replay: true };
    }
    // bentrok: key sama, payload beda
    const err = new Error("Idempotency key conflict (different payload)");
    (err as any).status = 409;
    throw err;
  }

  // Transaksi kecil biar konsisten kalau nanti ada step lanjutan
  return await AppDataSource.transaction(async () => {
    await recordEvent({
      type: headers["x-event-type"],
      idempotency_key: headers["x-idempotency-key"],
      timestamp: headers["x-timestamp"],
      payload,
      signature: headers["x-signature"],
      source_ip: req.ip,
    });

    // Proses payload → update GDP
    switch (headers["x-event-type"]) {
      case "guest.created":
      case "guest.updated": {
        const p = guestPayloadSchema.parse(payload.payload);
        await upsertGuestFromGuestPayload(p);
        break;
      }
      case "reservation.created":
      case "reservation.updated": {
        const p = reservationPayloadSchema.parse(payload.payload);
        await applyReservationAggregation(p);
        break;
      }
      case "guest.deleted":
      case "reservation.deleted":
        // Log deleted events for audit purposes
        console.log(`Received ${headers["x-event-type"]} event for ID: ${payload.id}`);
        break;
      default:
        console.warn(`Unknown event type: ${headers["x-event-type"]}`);
        break;
    }

    return { ok: true };
  });
}
