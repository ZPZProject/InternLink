import { TRPCError } from "@trpc/server";

import { authSignInSchema, authSignUpSchema } from "../schemas/auth";
import { createTRPCRouter, publicProcedure } from "../trpc";

function requestOrigin(ctx: { protocol: string; host: string }): string {
  const { protocol, host } = ctx;
  if (host.startsWith("http://") || host.startsWith("https://")) {
    return host;
  }
  return `${protocol}://${host}`;
}

export const authRouter = createTRPCRouter({
  signIn: publicProcedure
    .input(authSignInSchema)
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase.auth.signInWithPassword({
        email: input.email,
        password: input.password,
      });

      if (error) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: error.message,
        });
      }

      if (!data.user) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Sign-in succeeded but no user was returned",
        });
      }

      return {
        userId: data.user.id,
      };
    }),

  signUp: publicProcedure
    .input(authSignUpSchema)
    .mutation(async ({ ctx, input }) => {
      const origin = requestOrigin(ctx);
      const emailRedirectTo = `${origin}/api/auth/callback?next=${encodeURIComponent(input.callbackNext)}`;

      const { data, error } = await ctx.supabase.auth.signUp({
        email: input.email,
        password: input.password,
        options: {
          emailRedirectTo,
          data: {
            role: input.role,
            ...(input.first_name ? { first_name: input.first_name } : {}),
            ...(input.last_name ? { last_name: input.last_name } : {}),
          },
        },
      });

      if (error) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: error.message,
        });
      }

      return {
        needsEmailConfirmation: data.session == null,
        userId: data.user?.id ?? null,
      };
    }),
});
