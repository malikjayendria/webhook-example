import { z } from "zod";

export const createReservationSchema = z.object({
  guest_id: z.string().or(z.number()).transform(String),
  room_number: z.string().min(1),
  check_in: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  check_out: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  status: z.enum(["booked", "checked_in", "checked_out", "canceled"]).optional(),
});

export const updateReservationSchema = createReservationSchema.partial();

export type CreateReservationDTO = z.infer<typeof createReservationSchema>;
export type UpdateReservationDTO = z.infer<typeof updateReservationSchema>;
