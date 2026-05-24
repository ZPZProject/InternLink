import { z } from "zod/v4";

export const evaluationsByApplicationSchema = z.object({
  application_id: z.uuid(),
});

export const evaluationsCreateSchema = z.object({
  application_id: z.uuid(),
  score: z.number().int().min(2).max(5),
  comment: z.string().trim().max(2000).optional().nullable(),
});
