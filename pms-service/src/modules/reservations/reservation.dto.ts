import { z } from "zod";

export const createReservationSchema = z
  .object({
    // === REQUIRED FIELDS ===
    guest_id: z
      .union([z.string(), z.number()])
      .transform((val) => String(val))
      .refine((val) => !isNaN(Number(val)) && Number(val) > 0, "Guest ID must be a valid positive number"),

    room_number: z
      .string()
      .min(1)
      .max(50)
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

    // === OPTIONAL FIELDS ===
    booking_number: z.string().max(50).optional(),

    room_type: z.enum(["standard", "deluxe", "suite", "executive", "presidential", "villa", "other"]).optional(),

    room_allocation: z.string().max(100).trim().optional(),

    booking_source: z.enum(["website", "phone", "walk_in", "ota", "corporate", "agency", "other"]).default("website"),

    status: z.enum(["booked", "confirmed", "checked_in", "checked_out", "canceled", "no_show"]).default("booked"),

    // === FINANCIAL FIELDS ===
    total_amount: z
      .union([z.string(), z.number()])
      .transform((val) => parseFloat(String(val)))
      .refine((val) => val >= 0, "Total amount must be non-negative")
      .default(0),

    paid_amount: z
      .union([z.string(), z.number()])
      .transform((val) => parseFloat(String(val)))
      .refine((val) => val >= 0, "Paid amount must be non-negative")
      .default(0),

    currency: z.string().max(10).default("USD"),

    // === GUEST COUNT ===
    number_of_guests: z
      .union([z.string(), z.number()])
      .transform((val) => parseInt(String(val)))
      .refine((val) => val > 0, "Number of guests must be positive")
      .optional(),

    number_of_adults: z
      .union([z.string(), z.number()])
      .transform((val) => parseInt(String(val)))
      .refine((val) => val >= 0, "Number of adults must be non-negative")
      .optional(),

    number_of_children: z
      .union([z.string(), z.number()])
      .transform((val) => parseInt(String(val)))
      .refine((val) => val >= 0, "Number of children must be non-negative")
      .optional(),

    // === ADDITIONAL INFO ===
    special_requests: z.string().max(1000).trim().optional(),

    notes: z.string().max(1000).trim().optional(),
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
  )
  .refine(
    (data) => {
      return data.paid_amount <= data.total_amount;
    },
    {
      message: "Paid amount cannot exceed total amount",
      path: ["paid_amount"],
    }
  );

export const updateReservationSchema = createReservationSchema.partial();

export type CreateReservationDTO = z.infer<typeof createReservationSchema>;
export type UpdateReservationDTO = z.infer<typeof updateReservationSchema>;
