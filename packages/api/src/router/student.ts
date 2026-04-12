import { TRPCError } from "@trpc/server";

import { studentOnboardingSchema } from "../schemas/student";
import { createTRPCRouter, studentProcedure } from "../trpc";

function isOnboardingComplete(row: {
  school_id: string | null;
  index_number: string | null;
  major: string | null;
  year_of_study: number | null;
}): boolean {
  if (!row.school_id) return false;
  const index = row.index_number?.trim() ?? "";
  const major = row.major?.trim() ?? "";
  const year = row.year_of_study;
  if (index.length === 0 || major.length === 0) return false;
  if (year === null || year === undefined) return false;
  return Number.isInteger(year) && year >= 1 && year <= 6;
}

export const studentRouter = createTRPCRouter({
  myProfile: studentProcedure.query(async ({ ctx }) => {
    const { data, error } = await ctx.supabase
      .from("student_profiles")
      .select("*")
      .eq("id", ctx.user.id)
      .maybeSingle();

    if (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: error.message,
      });
    }
    return data;
  }),

  completeOnboarding: studentProcedure
    .input(studentOnboardingSchema)
    .mutation(async ({ ctx, input }) => {
      const { data: school, error: schoolError } = await ctx.supabase
        .from("schools")
        .select("id")
        .eq("id", input.school_id)
        .maybeSingle();

      if (schoolError) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: schoolError.message,
        });
      }
      if (!school) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "School not found",
        });
      }

      const { data: existing, error: fetchError } = await ctx.supabase
        .from("student_profiles")
        .select("id")
        .eq("id", ctx.user.id)
        .maybeSingle();

      if (fetchError) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: fetchError.message,
        });
      }

      const fields = {
        school_id: input.school_id,
        index_number: input.index_number,
        major: input.major,
        year_of_study: input.year_of_study,
      };

      const q = existing
        ? ctx.supabase
            .from("student_profiles")
            .update(fields)
            .eq("id", ctx.user.id)
        : ctx.supabase
            .from("student_profiles")
            .insert({ id: ctx.user.id, ...fields });

      const { data, error } = await q.select().single();

      if (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message,
        });
      }

      if (!isOnboardingComplete(data)) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Profile could not be saved",
        });
      }

      return data;
    }),
});
