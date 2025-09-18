import { z } from "zod";

export const createGuestSchema = z.object({
  email: z.string().email().max(255).toLowerCase().trim(),
  name: z.string().min(1).max(100).trim().optional(),
  phone: z
    .string()
    .max(20)
    .regex(/^\+?[\d\s\-\(\)]+$/)
    .optional(),
  date_of_birth: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .refine((date) => {
      const d = new Date(date);
      const now = new Date();
      const minDate = new Date("1900-01-01");
      return d >= minDate && d <= now;
    }, "Date of birth must be between 1900 and today")
    .optional(),
  country: z.string().max(100).trim().optional(),
});

export const updateGuestSchema = createGuestSchema.partial();

export type CreateGuestDTO = z.infer<typeof createGuestSchema>;
export type UpdateGuestDTO = z.infer<typeof updateGuestSchema>;
