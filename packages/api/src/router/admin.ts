import { TRPCError } from "@trpc/server";
import {
  adminUsersListSchema,
  adminUsersSetActiveSchema,
} from "../schemas/admin";
import { adminProcedure, createTRPCRouter } from "../trpc";

const usersRouter = createTRPCRouter({
  list: adminProcedure
    .input(adminUsersListSchema)
    .query(async ({ ctx, input }) => {
      let query = ctx.supabase
        .from("profiles")
        .select(
          "id, email, first_name, last_name, role, is_active, created_at",
          {
            count: "exact",
          },
        )
        .order("created_at", { ascending: false });

      if (input.role !== "all") {
        query = query.eq("role", input.role);
      }

      if (input.status === "active") {
        query = query.eq("is_active", true);
      } else if (input.status === "inactive") {
        query = query.eq("is_active", false);
      }

      if (input.query.length > 0) {
        const pattern = `%${input.query}%`;
        query = query.or(
          `email.ilike.${pattern},first_name.ilike.${pattern},last_name.ilike.${pattern}`,
        );
      }

      const from = input.offset;
      const to = input.offset + input.limit - 1;

      const { data, error, count } = await query.range(from, to);

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

  setActive: adminProcedure
    .input(adminUsersSetActiveSchema)
    .mutation(async ({ ctx, input }) => {
      if (input.user_id === ctx.user.id && input.is_active === false) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You cannot deactivate your own account",
        });
      }

      const { data, error } = await ctx.supabase
        .from("profiles")
        .update({ is_active: input.is_active })
        .eq("id", input.user_id)
        .select("id, email, first_name, last_name, role, is_active, created_at")
        .single();

      if (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message,
        });
      }

      const { error: auditError } = await ctx.supabase
        .from("audit_logs")
        .insert({
          actor_profile_id: ctx.user.id,
          action: input.is_active ? "user.activated" : "user.deactivated",
          entity_type: "profile",
          entity_id: input.user_id,
          metadata: { is_active: input.is_active },
        });

      if (auditError) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: auditError.message,
        });
      }

      return data;
    }),
});

export const adminRouter = createTRPCRouter({
  users: usersRouter,
});
