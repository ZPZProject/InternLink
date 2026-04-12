import { z } from "zod/v4";

export const offersListSchema = z.object({
  location: z.string().trim().max(200).optional(),
  search: z.string().trim().max(200).optional(),
  limit: z.number().int().min(1).max(50).optional().default(20),
  offset: z.number().int().min(0).optional().default(0),
});

export const offersByIdSchema = z.object({
  id: z.uuid(),
});

export const offersCreateSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().max(20_000).optional().default(""),
  requirements: z.string().max(20_000).optional().nullable(),
  location: z.string().trim().min(1).max(200),
  number_of_positions: z.number().int().min(1).max(500).optional().default(1),
  start_date: z.date(),
  end_date: z.date(),
  application_deadline: z.date().optional().nullable(),
  is_active: z.boolean().optional().default(true),
});

export const offersUpdateSchema = z.object({
  id: z.uuid(),
  title: z.string().trim().min(1).max(200).optional(),
  description: z.string().max(20_000).optional(),
  requirements: z.string().max(20_000).optional().nullable(),
  location: z.string().trim().min(1).max(200).optional(),
  number_of_positions: z.number().int().min(1).max(500).optional(),
  start_date: z.date().optional(),
  end_date: z.date().optional(),
  application_deadline: z.date().optional().nullable(),
  is_active: z.boolean().optional(),
});

export const offersSetActiveSchema = z.object({
  id: z.uuid(),
  is_active: z.boolean(),
});

export const offersListMineSchema = z.object({
  limit: z.number().int().min(1).max(50).optional().default(30),
  offset: z.number().int().min(0).optional().default(0),
});
