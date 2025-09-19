import { z } from "zod";

export const createGuestSchema = z.object({
  // Basic Information
  first_name: z.string().min(1).max(100).trim(),
  last_name: z.string().min(1).max(100).trim(),
  middle_name: z.string().max(100).trim().optional(),
  preferred_name: z.string().max(100).trim().optional(),
  gender: z.enum(["male", "female", "other", "prefer_not_to_say"]).optional(),

  // Contact Information
  email: z.string().email().max(255).toLowerCase().trim(),
  phone_number: z
    .string()
    .max(50)
    .regex(/^\+?[\d\s\-\(\)]+$/)
    .optional(),

  // Personal Information
  birthdate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .refine((date) => {
      const d = new Date(date);
      const now = new Date();
      const minDate = new Date("1900-01-01");
      return d >= minDate && d <= now;
    }, "Birthdate must be between 1900 and today")
    .optional(),

  // Address Information
  address_line_1: z.string().max(255).trim().optional(),
  address_line_2: z.string().max(255).trim().optional(),
  city: z.string().max(100).trim().optional(),
  country_of_residence: z.string().max(100).trim().optional(),
  nationality: z.string().max(100).trim().optional(),
  zip_code: z.string().max(20).trim().optional(),

  // System Information
  guest_type: z.enum(["regular", "vip", "blacklisted", "other"]).default("regular"),
});

export const updateGuestSchema = createGuestSchema.partial();

export type CreateGuestDTO = z.infer<typeof createGuestSchema>;
export type UpdateGuestDTO = z.infer<typeof updateGuestSchema>;
