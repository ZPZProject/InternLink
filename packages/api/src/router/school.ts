import { TRPCError } from "@trpc/server";

import {
  schoolCreateSchema,
  schoolGetSchema,
  schoolJoinSchema,
  schoolListApprovedSchema,
  schoolListSchema,
} from "../schemas/school";
import {
  createTRPCRouter,
  protectedProcedure,
  supervisorProcedure,
} from "../trpc";

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

  myMembership: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.profile.role !== "supervisor") {
      return null;
    }

    const { data: member, error: e1 } = await ctx.supabase
      .from("school_members")
      .select("*")
      .eq("profile_id", ctx.user.id)
      .maybeSingle();

    if (e1) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: e1.message,
      });
    }
    if (!member) {
      return null;
    }

    const { data: school, error: e2 } = await ctx.supabase
      .from("schools")
      .select("*")
      .eq("id", member.school_id)
      .single();

    if (e2) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: e2.message,
      });
    }

    return { member, school };
  }),

  create: supervisorProcedure
    .input(schoolCreateSchema)
    .mutation(async ({ ctx, input }) => {
      const { data: existing } = await ctx.supabase
        .from("school_members")
        .select("profile_id")
        .eq("profile_id", ctx.user.id)
        .maybeSingle();

      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "You are already linked to a school",
        });
      }

      const { data: school, error } = await ctx.supabase
        .from("schools")
        .insert({
          name: input.name.trim(),
          address: input.address?.trim() || null,
          website: input.website?.trim() || null,
          created_by_profile_id: ctx.user.id,
          approval_status: "pending",
        })
        .select()
        .single();

      if (error || !school) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error?.message ?? "Could not create school",
        });
      }

      const { error: memberError } = await ctx.supabase
        .from("school_members")
        .insert({
          profile_id: ctx.user.id,
          school_id: school.id,
        });

      if (memberError) {
        await ctx.supabase.from("schools").delete().eq("id", school.id);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: memberError.message,
        });
      }

      return school;
    }),

  join: supervisorProcedure
    .input(schoolJoinSchema)
    .mutation(async ({ ctx, input }) => {
      const { data: existing } = await ctx.supabase
        .from("school_members")
        .select("profile_id")
        .eq("profile_id", ctx.user.id)
        .maybeSingle();

      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "You are already linked to a school",
        });
      }

      const { data: schoolRow, error: e1 } = await ctx.supabase
        .from("schools")
        .select("id")
        .eq("id", input.school_id)
        .single();

      if (e1 || !schoolRow) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "School not found",
        });
      }

      const { error: e2 } = await ctx.supabase.from("school_members").insert({
        profile_id: ctx.user.id,
        school_id: input.school_id,
      });

      if (e2) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: e2.message,
        });
      }

      const { data: full, error: e3 } = await ctx.supabase
        .from("schools")
        .select("*")
        .eq("id", input.school_id)
        .single();

      if (e3 || !full) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: e3?.message ?? "Could not load school",
        });
      }

      return full;
    }),
});
