import { TRPCError } from "@trpc/server";
import type { Client } from "@v1/supabase/types";

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
    approvalStatus: company.approval_status,
  };
}

async function assertCanManageOffer(ctx: EmployerCtx, offer: OfferRow) {
  const { companyId, approvalStatus } = await getEmployerCompanyContext(ctx);
  if (offer.company_id !== companyId) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "This offer belongs to another company",
    });
  }
  if (approvalStatus !== "approved") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Your company must be approved before managing offers",
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
      const { companyId, approvalStatus } =
        await getEmployerCompanyContext(ctx);

      if (approvalStatus !== "approved") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message:
            "Your company must be approved by an administrator before you can publish internship offers.",
        });
      }

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
          start_date: input.start_date,
          end_date: input.end_date,
          application_deadline: input.application_deadline ?? null,
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

      const updatePayload: Record<string, unknown> = {};
      if (patch.title !== undefined) updatePayload.title = patch.title;
      if (patch.description !== undefined)
        updatePayload.description = patch.description;
      if (patch.requirements !== undefined)
        updatePayload.requirements = patch.requirements;
      if (patch.location !== undefined) updatePayload.location = patch.location;
      if (patch.number_of_positions !== undefined) {
        updatePayload.number_of_positions = patch.number_of_positions;
      }
      if (patch.start_date !== undefined)
        updatePayload.start_date = patch.start_date;
      if (patch.end_date !== undefined) updatePayload.end_date = patch.end_date;
      if (patch.application_deadline !== undefined) {
        updatePayload.application_deadline = patch.application_deadline;
      }
      if (patch.is_active !== undefined)
        updatePayload.is_active = patch.is_active;

      if (Object.keys(updatePayload).length === 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No fields to update",
        });
      }

      const { data, error } = await ctx.supabase
        .from("internship_offers")
        .update(updatePayload)
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
