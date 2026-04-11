import { TRPCError } from "@trpc/server";

import {
  companyCreateSchema,
  companyGetSchema,
  companyJoinSchema,
  companyListApprovedSchema,
  companyListSchema,
} from "../schemas/company";
import {
  createTRPCRouter,
  employerProcedure,
  protectedProcedure,
} from "../trpc";

export const companyRouter = createTRPCRouter({
  get: protectedProcedure
    .input(companyGetSchema)
    .query(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from("companies")
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
    .input(companyListSchema)
    .query(async ({ ctx, input }) => {
      let q = ctx.supabase
        .from("companies")
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
    .input(companyListApprovedSchema)
    .query(async ({ ctx, input }) => {
      let q = ctx.supabase
        .from("companies")
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
    if (ctx.profile.role !== "employer") {
      return null;
    }

    const { data: member, error: e1 } = await ctx.supabase
      .from("company_members")
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

    const { data: company, error: e2 } = await ctx.supabase
      .from("companies")
      .select("*")
      .eq("id", member.company_id)
      .single();

    if (e2) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: e2.message,
      });
    }

    return { member, company };
  }),

  create: employerProcedure
    .input(companyCreateSchema)
    .mutation(async ({ ctx, input }) => {
      const { data: existing } = await ctx.supabase
        .from("company_members")
        .select("profile_id")
        .eq("profile_id", ctx.user.id)
        .maybeSingle();

      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "You are already linked to a company",
        });
      }

      const { data: company, error } = await ctx.supabase
        .from("companies")
        .insert({
          name: input.name.trim(),
          tax_id: input.tax_id?.trim() || null,
          address: input.address?.trim() || null,
          contact_person: input.contact_person?.trim() || null,
          created_by_profile_id: ctx.user.id,
          approval_status: "pending",
        })
        .select()
        .single();

      if (error || !company) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error?.message ?? "Could not create company",
        });
      }

      const { error: memberError } = await ctx.supabase
        .from("company_members")
        .insert({
          profile_id: ctx.user.id,
          company_id: company.id,
        });

      if (memberError) {
        await ctx.supabase.from("companies").delete().eq("id", company.id);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: memberError.message,
        });
      }

      return company;
    }),

  join: employerProcedure
    .input(companyJoinSchema)
    .mutation(async ({ ctx, input }) => {
      const { data: existing } = await ctx.supabase
        .from("company_members")
        .select("profile_id")
        .eq("profile_id", ctx.user.id)
        .maybeSingle();

      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "You are already linked to a company",
        });
      }

      const { data: company, error: e1 } = await ctx.supabase
        .from("companies")
        .select("id, approval_status")
        .eq("id", input.company_id)
        .single();

      if (e1 || !company) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Company not found",
        });
      }

      const { error: e2 } = await ctx.supabase.from("company_members").insert({
        profile_id: ctx.user.id,
        company_id: input.company_id,
      });

      if (e2) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: e2.message,
        });
      }

      const { data: full, error: e3 } = await ctx.supabase
        .from("companies")
        .select("*")
        .eq("id", input.company_id)
        .single();

      if (e3 || !full) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: e3?.message ?? "Could not load company",
        });
      }

      return full;
    }),
});
