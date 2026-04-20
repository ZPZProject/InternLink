import { z } from "zod/v4";

export const applicationsApplySchema = z.object({
  offer_id: z.uuid(),
  motivation_letter: z.string().max(5000).optional().default(""),
});

export const applicationsMyListSchema = z.object({
  limit: z.number().int().min(1).max(50).optional().default(20),
  offset: z.number().int().min(0).optional().default(0),
});

export const applicationsByOfferSchema = z.object({
  offer_id: z.uuid(),
  limit: z.number().int().min(1).max(50).optional().default(20),
  offset: z.number().int().min(0).optional().default(0),
});

export const applicationsReviewSchema = z.object({
  application_id: z.uuid(),
  action: z.enum(["accept", "reject"]),
  reason: z.string().max(1000).optional().nullable(),
});

export const applicationsByIdSchema = z.object({
  id: z.uuid(),
});