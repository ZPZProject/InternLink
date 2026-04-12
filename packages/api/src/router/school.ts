import { TRPCError } from "@trpc/server";

import {
  schoolGetSchema,
  schoolListApprovedSchema,
  schoolListSchema,
} from "../schemas/school";
import { createTRPCRouter, protectedProcedure } from "../trpc";

/** Read-only school directory for students (and other roles) picking an institution. */
export const schoolRouter = createTRPCRouter({
  get: protectedProcedure
    .input(schoolGetSchema)
    .query(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from("schools")
        .select("*")
        .eq("id", input.id)
        .single();

      if (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message,
        });
      }

      return data;
    }),

  list: protectedProcedure
    .input(schoolListSchema)
    .query(async ({ ctx, input }) => {
      let q = ctx.supabase
        .from("schools")
        .select("id, name, approval_status")
        .order("name", { ascending: true })
        .limit(input.limit);

      if (input.query && input.query.length > 0) {
        q = q.ilike("name", `%${input.query}%`);
      }

      const { data, error } = await q;

      if (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message,
        });
      }
      return data ?? [];
    }),

  listApproved: protectedProcedure
    .input(schoolListApprovedSchema)
    .query(async ({ ctx, input }) => {
      let q = ctx.supabase
        .from("schools")
        .select("id, name, approval_status")
        .eq("approval_status", "approved")
        .order("name", { ascending: true })
        .limit(input.limit);

      if (input.query && input.query.length > 0) {
        q = q.ilike("name", `%${input.query}%`);
      }

      const { data, error } = await q;

      if (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message,
        });
      }
      return data ?? [];
    }),
});
