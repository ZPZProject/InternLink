import { TRPCError } from "@trpc/server";

import { profileUpdateMeSchema } from "../schemas/profile";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const profileRouter = createTRPCRouter({
  me: protectedProcedure.query(({ ctx }) => ctx.profile),

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
