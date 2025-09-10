import { z } from "zod";

export const createGuestSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
  phone: z.string().optional(),
  date_of_birth: z
    .string()
    .date()
    .optional()
    .or(
      z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/)
        .optional()
    ),
  country: z.string().optional(),
});

export const updateGuestSchema = createGuestSchema.partial();

export type CreateGuestDTO = z.infer<typeof createGuestSchema>;
export type UpdateGuestDTO = z.infer<typeof updateGuestSchema>;
