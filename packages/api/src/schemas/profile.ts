import { z } from "zod/v4";

export const profileUpdateMeSchema = z
  .object({
    first_name: z.string().trim().min(1).max(120).optional(),
    last_name: z.string().trim().min(1).max(120).optional(),
  })
  .refine((v) => v.first_name !== undefined || v.last_name !== undefined, {
    message: "Provide first_name and/or last_name",
  });
