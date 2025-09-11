import { z } from "zod";

export const createReservationSchema = z
  .object({
    guest_id: z
      .union([z.string(), z.number()])
      .transform((val) => String(val))
      .refine((val) => !isNaN(Number(val)) && Number(val) > 0, "Guest ID must be a valid positive number"),
    room_number: z
      .string()
      .min(1)
      .max(10)
      .regex(/^[A-Z0-9\-]+$/)
      .trim(),
    check_in: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .refine((date) => {
        const d = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return d >= today;
      }, "Check-in date must be today or later"),
    check_out: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .refine((date) => {
        const d = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return d > today;
      }, "Check-out date must be tomorrow or later"),
    status: z.enum(["booked", "checked_in", "checked_out", "canceled"]).optional().default("booked"),
  })
  .refine(
    (data) => {
      const checkIn = new Date(data.check_in);
      const checkOut = new Date(data.check_out);
      return checkOut > checkIn;
    },
    {
      message: "Check-out date must be after check-in date",
      path: ["check_out"],
    }
  );

export const updateReservationSchema = createReservationSchema.partial();

export type CreateReservationDTO = z.infer<typeof createReservationSchema>;
export type UpdateReservationDTO = z.infer<typeof updateReservationSchema>;
