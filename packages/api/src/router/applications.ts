import { TRPCError } from "@trpc/server";
import type { Client } from "@v1/supabase/types";
import {
  applicationsApplySchema,
  applicationsByIdSchema,
  applicationsByOfferSchema,
  applicationsMyListSchema,
  applicationsReviewSchema,
} from "../schemas/applications";
import {
  createTRPCRouter,
  employerProcedure,
  protectedProcedure,
  studentProcedure,
} from "../trpc";

const MAX_ACTIVE_APPLICATIONS = 5;

async function getStudentProfileId(ctx: { supabase: Client; user: { id: string } }) {
  const { data, error } = await ctx.supabase
    .from("student_profiles")
    .select("id")
    .eq("id", ctx.user.id)
    .maybeSingle();

  if (error) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: error.message,
    });
  }
  if (!data) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Complete student onboarding first",
    });
  }
  return data.id;
}

async function getEmployerCompanyId(ctx: { supabase: Client; user: { id: string } }) {
  const { data: member, error } = await ctx.supabase
    .from("company_members")
    .select("company_id")
    .eq("profile_id", ctx.user.id)
    .maybeSingle();

  if (error || !member) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "You must belong to a company",
    });
  }
  return member.company_id;
}

export const applicationsRouter = createTRPCRouter({
  create: studentProcedure
    .input(applicationsApplySchema)
    .mutation(async ({ ctx, input }) => {
      const studentProfileId = await getStudentProfileId(ctx);

      const { data: offer, error: offerError } = await ctx.supabase
        .from("internship_offers")
        .select("id, is_active, application_deadline, companies(name)")
        .eq("id", input.offer_id)
        .single();

      if (offerError || !offer) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Offer not found",
        });
      }

      if (!offer.is_active) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "This offer is no longer active",
        });
      }

      if (offer.application_deadline) {
        const deadline = new Date(offer.application_deadline);
        if (deadline < new Date()) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Application deadline has passed",
          });
        }
      }

      const { data: existing } = await ctx.supabase
        .from("applications")
        .select("id")
        .eq("offer_id", input.offer_id)
        .eq("student_profile_id", studentProfileId)
        .maybeSingle();

      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "You have already applied to this offer",
        });
      }

const { count: activeCount } = await ctx.supabase
        .from("applications")
        .select("*", { count: "exact", head: true })
        .eq("student_profile_id", studentProfileId)
        .in("status", ["pending", "accepted"]);

      if ((activeCount ?? 0) >= MAX_ACTIVE_APPLICATIONS) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `You can only have ${MAX_ACTIVE_APPLICATIONS} active applications at a time`,
        });
      }

      const { data, error } = await ctx.supabase
        .from("applications")
        .insert({
          offer_id: input.offer_id,
          student_profile_id: studentProfileId,
          motivation_letter: input.motivation_letter,
          status: "pending",
          applied_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message,
        });
      }

      return data;
    }),

  myList: studentProcedure
    .input(applicationsMyListSchema)
    .query(async ({ ctx, input }) => {
      const studentProfileId = await getStudentProfileId(ctx);

      const from = input.offset ?? 0;
      const to = from + input.limit - 1;

      const { data, error, count } = await ctx.supabase
        .from("applications")
        .select(
          "*, internship_offers(id, title, location, start_date, end_date, companies(name))",
          { count: "exact" },
        )
        .eq("student_profile_id", studentProfileId)
        .order("applied_at", { ascending: false })
        .range(from, to);

      if (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message,
        });
      }

      return {
        items: data ?? [],
        total: count ?? 0,
      };
    }),

  byId: protectedProcedure
    .input(applicationsByIdSchema)
    .query(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from("applications")
        .select(
          "*, internship_offers!inner(id, title, companies(name)), student_profiles!inner(id, index_number, majors(first_name, last_name))",
        )
        .eq("id", input.id)
        .single();

      if (error || !data) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Application not found",
        });
      }

      return data;
    }),

  byOffer: employerProcedure
    .input(applicationsByOfferSchema)
    .query(async ({ ctx, input }) => {
      const companyId = await getEmployerCompanyId(ctx);

      const { data: offer } = await ctx.supabase
        .from("internship_offers")
        .select("id, company_id")
        .eq("id", input.offer_id)
        .single();

      if (!offer || offer.company_id !== companyId) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Offer not found",
        });
      }

      const from = input.offset ?? 0;
      const to = from + input.limit - 1;

      const { data, error, count } = await ctx.supabase
        .from("applications")
        .select(
          "*, student_profiles(id, index_number, major, year_of_study, profiles(first_name, last_name, email))",
          { count: "exact" },
        )
        .eq("offer_id", input.offer_id)
        .order("applied_at", { ascending: false })
        .range(from, to);

      if (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message,
        });
      }

      return {
        items: data ?? [],
        total: count ?? 0,
      };
    }),

  review: employerProcedure
    .input(applicationsReviewSchema)
    .mutation(async ({ ctx, input }) => {
      const companyId = await getEmployerCompanyId(ctx);

      const { data: app, error: appError } = await ctx.supabase
        .from("applications")
        .select("*, internship_offers(company_id)")
        .eq("id", input.application_id)
        .single();

      if (appError || !app) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Application not found",
        });
      }

      if ((app.internship_offers as { company_id: string }).company_id !== companyId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "This application does not belong to your company",
        });
      }

      if (app.status !== "pending") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "This application has already been reviewed",
        });
      }

      const newStatus = input.action === "accept" ? "accepted" : "rejected";

      const { data, error } = await ctx.supabase
        .from("applications")
        .update({
          status: newStatus,
          reviewed_at: new Date().toISOString(),
          employer_rejection_reason: input.action === "reject" ? input.reason : null,
        })
        .eq("id", input.application_id)
        .select()
        .single();

      if (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message,
        });
      }

      return data;
    }),
});