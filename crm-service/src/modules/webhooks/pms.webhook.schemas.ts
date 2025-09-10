import { z } from "zod";

export const webhookHeadersSchema = z.object({
  "x-signature": z.string().min(10),
  "x-idempotency-key": z.string().min(8),
  "x-event-type": z.string().min(3),
  "x-timestamp": z.string().min(10),
});

export const guestPayloadSchema = z.object({
  id: z.string().or(z.number()).transform(String),
  email: z.string().email(),
  name: z.string().optional(),
  phone: z.string().optional(),
  date_of_birth: z.string().optional(),
  country: z.string().optional(),
});

export const reservationPayloadSchema = z.object({
  id: z.string().or(z.number()).transform(String),
  guest_id: z.string().or(z.number()).transform(String).optional(),
  room_number: z.string(),
  check_in: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  check_out: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  status: z.enum(["booked", "checked_in", "checked_out", "canceled"]).optional(),
  guest: z.object({ email: z.string().email() }).optional(),
});
