import { z } from "zod/v4";

export const adminUsersListSchema = z.object({
  query: z.string().trim().max(100).optional().default(""),
  role: z
    .enum(["all", "student", "employer", "supervisor", "admin"])
    .optional()
    .default("all"),
  status: z.enum(["all", "active", "inactive"]).optional().default("all"),
  limit: z.number().int().min(1).max(100).optional().default(20),
  offset: z.number().int().min(0).optional().default(0),
});

export const adminUsersSetActiveSchema = z.object({
  user_id: z.uuid(),
  is_active: z.boolean(),
});
