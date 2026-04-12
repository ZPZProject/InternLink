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

export const schoolJoinSchema = z.object({
  school_id: z.uuid(),
});

export const schoolCreateSchema = z.object({
  name: z.string().trim().min(1).max(200),
  address: z.string().trim().max(500).optional().nullable(),
  website: z.string().trim().max(500).optional().nullable(),
});
