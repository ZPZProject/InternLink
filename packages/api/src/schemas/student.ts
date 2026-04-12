import { z } from "zod/v4";

export const studentOnboardingSchema = z.object({
  school_id: z.uuid(),
  index_number: z.string().trim().min(1).max(40),
  major: z.string().trim().min(1).max(200),
  year_of_study: z.coerce
    .number()
    .int()
    .min(1, "Year must be at least 1")
    .max(6, "Year must be at most 6"),
});
