import { TRPCError } from "@trpc/server";

import { profileUpdateMeSchema } from "../schemas/profile";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const profileRouter = createTRPCRouter({
  me: protectedProcedure.query(({ ctx }) => ctx.profile),

  homeStats: protectedProcedure.query(async ({ ctx }) => {
    const role = ctx.profile.role;

    if (role === "student") {
      const { data: studentProfile } = await ctx.supabase
        .from("student_profiles")
        .select("id, school_id, index_number, major, year_of_study")
        .eq("id", ctx.user.id)
        .maybeSingle();

      const { count: totalApps } = await ctx.supabase
        .from("applications")
        .select("*", { count: "exact", head: true })
        .eq("student_profile_id", ctx.user.id);

      const { count: pendingApps } = await ctx.supabase
        .from("applications")
        .select("*", { count: "exact", head: true })
        .eq("student_profile_id", ctx.user.id)
        .eq("status", "pending");

      const { count: acceptedApps } = await ctx.supabase
        .from("applications")
        .select("*", { count: "exact", head: true })
        .eq("student_profile_id", ctx.user.id)
        .eq("status", "accepted");

      const onboardingComplete = !!(
        studentProfile?.school_id &&
        studentProfile?.index_number &&
        studentProfile?.major &&
        studentProfile?.year_of_study
      );

      return {
        role: "student" as const,
        onboardingComplete,
        stats: {
          totalApplications: totalApps ?? 0,
          pendingApplications: pendingApps ?? 0,
          acceptedApplications: acceptedApps ?? 0,
        },
      };
    }

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
          stats: { totalOffers: 0, activeOffers: 0, totalApplications: 0 },
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
          totalApplications: totalApplications ?? 0,
        },
      };
    }

    if (role === "supervisor") {
      const { data: member } = await ctx.supabase
        .from("school_members")
        .select("school_id, schools(name, approval_status)")
        .eq("profile_id", ctx.user.id)
        .maybeSingle();

      return {
        role: "supervisor" as const,
        hasSchool: !!member?.school_id,
        school: member?.schools ?? null,
      };
    }

    if (role === "admin") {
      const { count: totalUsers } = await ctx.supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      const { count: pendingCompanies } = await ctx.supabase
        .from("companies")
        .select("*", { count: "exact", head: true })
        .eq("approval_status", "pending");

      const { count: pendingSchools } = await ctx.supabase
        .from("schools")
        .select("*", { count: "exact", head: true })
        .eq("approval_status", "pending");

      return {
        role: "admin" as const,
        stats: {
          totalUsers: totalUsers ?? 0,
          pendingCompanies: pendingCompanies ?? 0,
          pendingSchools: pendingSchools ?? 0,
        },
      };
    }

    return { role: "unknown" as const };
  }),

  updateMe: protectedProcedure
    .input(profileUpdateMeSchema)
    .mutation(async ({ ctx, input }) => {
      const patch: { first_name?: string; last_name?: string } = {};
      if (input.first_name !== undefined) patch.first_name = input.first_name;
      if (input.last_name !== undefined) patch.last_name = input.last_name;

      const { data, error } = await ctx.supabase
        .from("profiles")
        .update(patch)
        .eq("id", ctx.user.id)
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
