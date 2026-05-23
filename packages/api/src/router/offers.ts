import { TRPCError } from "@trpc/server";
import type { Client } from "@v1/supabase/types";
import { formatISO } from "date-fns";
import {
  offersByIdSchema,
  offersCreateSchema,
  offersListMineSchema,
  offersListSchema,
  offersSetActiveSchema,
  offersUpdateSchema,
} from "../schemas/offers";
import {
  createTRPCRouter,
  employerProcedure,
  protectedProcedure,
} from "../trpc";

type OfferRow = {
  id: string;
  company_id: string;
  is_active: boolean;
};

type EmployerCtx = { supabase: Client; user: { id: string } };

async function getEmployerCompanyContext(ctx: EmployerCtx) {
  const { data: member, error: e1 } = await ctx.supabase
    .from("company_members")
    .select("company_id")
    .eq("profile_id", ctx.user.id)
    .maybeSingle();

  if (e1) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: e1.message,
    });
  }
  if (!member) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "You must complete company onboarding first",
    });
  }

  const { data: company, error: e2 } = await ctx.supabase
    .from("companies")
    .select("id, approval_status")
    .eq("id", member.company_id)
    .single();

  if (e2 || !company) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: e2?.message ?? "Could not load company",
    });
  }

  return {
    companyId: member.company_id,
  };
}

async function assertCanManageOffer(ctx: EmployerCtx, offer: OfferRow) {
  const { companyId } = await getEmployerCompanyContext(ctx);
  if (offer.company_id !== companyId) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "This offer belongs to another company",
    });
  }
}

export const offersRouter = createTRPCRouter({
  list: protectedProcedure
    .input(offersListSchema)
    .query(async ({ ctx, input }) => {
      let q = ctx.supabase
        .from("internship_offers")
        .select("*, companies(id, name)", { count: "exact" })
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .range(input.offset, input.offset + input.limit - 1);

      if (input.location && input.location.length > 0) {
        q = q.ilike("location", `%${input.location}%`);
      }

      if (input.search && input.search.length > 0) {
        const s = input.search.replace(/%/g, "\\%");
        q = q.or(`title.ilike.%${s}%,description.ilike.%${s}%`);
      }

      const { data, error, count } = await q;

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

  getStats: protectedProcedure.query(async ({ ctx }) => {
    const role = ctx.profile.role;

    if (role === "employer") {
      const { data: member } = await ctx.supabase
        .from("company_members")
        .select("company_id")
        .eq("profile_id", ctx.user.id)
        .maybeSingle();

      if (!member) {
        return {
          role: "employer" as const,
          hasCompany: false,
          stats: {
            totalOffers: 0,
            activeOffers: 0,
            inactiveOffers: 0,
            totalApplications: 0,
          },
        };
      }

      const { count: totalOffers } = await ctx.supabase
        .from("internship_offers")
        .select("*", { count: "exact", head: true })
        .eq("company_id", member.company_id);

      const { count: activeOffers } = await ctx.supabase
        .from("internship_offers")
        .select("*", { count: "exact", head: true })
        .eq("company_id", member.company_id)
        .eq("is_active", true);

      const { count: inactiveOffers } = await ctx.supabase
        .from("internship_offers")
        .select("*", { count: "exact", head: true })
        .eq("company_id", member.company_id)
        .eq("is_active", false);

      const { data: offerIds } = await ctx.supabase
        .from("internship_offers")
        .select("id")
        .eq("company_id", member.company_id);

      const offerIdList = offerIds?.map((o) => o.id) ?? [];
      const { count: totalApplications } = offerIdList.length
        ? await ctx.supabase
            .from("applications")
            .select("*", { count: "exact", head: true })
            .in("offer_id", offerIdList)
        : { count: 0 };

      return {
        role: "employer" as const,
        hasCompany: true,
        stats: {
          totalOffers: totalOffers ?? 0,
          activeOffers: activeOffers ?? 0,
          inactiveOffers: inactiveOffers ?? 0,
          totalApplications: totalApplications ?? 0,
        },
      };
    }

    const { count: totalActive } = await ctx.supabase
      .from("internship_offers")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true);

    const { count: remoteOffers } = await ctx.supabase
      .from("internship_offers")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true)
      .ilike("location", "%remote%");

    return {
      role: "public" as const,
      stats: {
        totalActive: totalActive ?? 0,
        remoteOffers: remoteOffers ?? 0,
      },
    };
  }),

  byId: protectedProcedure
    .input(offersByIdSchema)
    .query(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from("internship_offers")
        .select("*, companies(id, name, approval_status)")
        .eq("id", input.id)
        .maybeSingle();

      if (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message,
        });
      }
      if (!data) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Offer not found" });
      }

      if (!data.is_active) {
        const { data: member } = await ctx.supabase
          .from("company_members")
          .select("company_id")
          .eq("profile_id", ctx.user.id)
          .maybeSingle();

        const canSee =
          member !== null &&
          member.company_id === (data as { company_id: string }).company_id;

        if (!canSee) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Offer not found",
          });
        }
      }

      return data;
    }),

  listMine: employerProcedure
    .input(offersListMineSchema)
    .query(async ({ ctx, input }) => {
      const { data: member, error: e1 } = await ctx.supabase
        .from("company_members")
        .select("company_id")
        .eq("profile_id", ctx.user.id)
        .maybeSingle();

      if (e1) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: e1.message,
        });
      }

      if (!member) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You must complete company onboarding first",
        });
      }

      const from = input.offset ?? 0;
      const to = from + input.limit - 1;

      const { data, error, count } = await ctx.supabase
        .from("internship_offers")
        .select("*, companies(id, name, approval_status)", { count: "exact" })
        .eq("company_id", member.company_id)
        .order("created_at", { ascending: false })
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

  create: employerProcedure
    .input(offersCreateSchema)
    .mutation(async ({ ctx, input }) => {
      const { companyId } = await getEmployerCompanyContext(ctx);

      const { data, error } = await ctx.supabase
        .from("internship_offers")
        .insert({
          company_id: companyId,
          created_by_profile_id: ctx.user.id,
          title: input.title,
          description: input.description ?? "",
          requirements: input.requirements ?? null,
          location: input.location,
          number_of_positions: input.number_of_positions,
          start_date: formatISO(input.start_date),
          end_date: formatISO(input.end_date),
          application_deadline: input.application_deadline
            ? formatISO(input.application_deadline)
            : null,
          is_active: input.is_active,
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

  update: employerProcedure
    .input(offersUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...patch } = input;

      const { data: offer, error: e1 } = await ctx.supabase
        .from("internship_offers")
        .select("id, company_id, is_active")
        .eq("id", id)
        .single();

      if (e1 || !offer) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Offer not found",
        });
      }

      await assertCanManageOffer(ctx, offer);

      const { data, error } = await ctx.supabase
        .from("internship_offers")
        .update({
          ...patch,
          start_date: patch.start_date
            ? formatISO(patch.start_date)
            : undefined,
          end_date: patch.end_date ? formatISO(patch.end_date) : undefined,
          application_deadline: patch.application_deadline
            ? formatISO(patch.application_deadline)
            : undefined,
        })
        .eq("id", id)
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

  setActive: employerProcedure
    .input(offersSetActiveSchema)
    .mutation(async ({ ctx, input }) => {
      const { data: offer, error: e1 } = await ctx.supabase
        .from("internship_offers")
        .select("id, company_id, is_active")
        .eq("id", input.id)
        .single();

      if (e1 || !offer) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Offer not found",
        });
      }

      await assertCanManageOffer(ctx, offer);

      const { data, error } = await ctx.supabase
        .from("internship_offers")
        .update({ is_active: input.is_active })
        .eq("id", input.id)
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
