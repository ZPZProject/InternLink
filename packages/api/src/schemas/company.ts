import { z } from "zod/v4";

export const companyGetSchema = z.object({
  id: z.uuid(),
});

export const companyListSchema = z.object({
  query: z.string().trim().max(200).optional(),
  limit: z.number().int().min(1).max(50).optional().default(30),
});

export const companyListApprovedSchema = z.object({
  query: z.string().trim().max(200).optional(),
  limit: z.number().int().min(1).max(50).optional().default(30),
});

export const companyJoinSchema = z.object({
  company_id: z.uuid(),
});

export const companyCreateSchema = z.object({
  name: z.string().trim().min(1).max(200),
  tax_id: z.string().trim().max(80).optional().nullable(),
  address: z.string().trim().max(500).optional().nullable(),
  contact_person: z.string().trim().max(200).optional().nullable(),
});
