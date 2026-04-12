import { z } from "zod/v4";

export const schoolGetSchema = z.object({
  id: z.uuid(),
});

export const schoolListSchema = z.object({
  query: z.string().trim().max(200).optional(),
  limit: z.number().int().min(1).max(50).optional().default(30),
});

export const schoolListApprovedSchema = z.object({
  query: z.string().trim().max(200).optional(),
  limit: z.number().int().min(1).max(50).optional().default(30),
});
