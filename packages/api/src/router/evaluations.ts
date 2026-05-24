import { TRPCError } from "@trpc/server";
import type { Client } from "@v1/supabase/types";
import {
  evaluationsByApplicationSchema,
  evaluationsCreateSchema,
} from "../schemas/evaluations";
import {
  createTRPCRouter,
  protectedProcedure,
  supervisorProcedure,
} from "../trpc";

async function getApplicationForEvaluation(
  supabase: Client,
  applicationId: string,
) {
  const { data, error } = await supabase
    .from("applications")
    .select(
      `id, status, student_profile_id,
       student_profiles!inner(id, index_number, major, year_of_study, profiles!inner(first_name, last_name, email)),
       internship_offers!inner(id, title, location, companies!inner(name))`,
    )
    .eq("id", applicationId)
    .maybeSingle();

  if (error) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: error.message,
    });
  }

  return data;
}

async function getDocumentsForApplication(
  supabase: Client,
  applicationId: string,
) {
  const { data, error } = await supabase
    .from("documents")
    .select("id, review_status")
    .eq("application_id", applicationId);

  if (error) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: error.message,
    });
  }

  return data ?? [];
}

export const evaluationsRouter = createTRPCRouter({
  listCompletable: supervisorProcedure.query(async ({ ctx }) => {
    const { data: applications, error } = await ctx.supabase
      .from("applications")
      .select(
        `id, status,
         student_profiles!inner(id, index_number, major, year_of_study, profiles!inner(first_name, last_name, email)),
         internship_offers!inner(id, title, location, companies!inner(name))`,
      )
      .eq("status", "accepted")
      .order("applied_at", { ascending: false });

    if (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: error.message,
      });
    }

    const applicationIds = (applications ?? []).map(
      (application) => application.id,
    );
    if (applicationIds.length === 0) {
      return [];
    }

    const [
      { data: documents, error: docsError },
      { data: existingEvaluations, error: evalsError },
    ] = await Promise.all([
      ctx.supabase
        .from("documents")
        .select("application_id, review_status")
        .in("application_id", applicationIds),
      ctx.supabase
        .from("evaluations")
        .select("application_id")
        .in("application_id", applicationIds),
    ]);

    if (docsError) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: docsError.message,
      });
    }
    if (evalsError) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: evalsError.message,
      });
    }

    const docsByApplication = new Map<
      string,
      Array<{
        application_id: string;
        review_status: "pending" | "approved" | "rejected";
      }>
    >();

    for (const document of documents ?? []) {
      const items = docsByApplication.get(document.application_id) ?? [];
      items.push(document);
      docsByApplication.set(document.application_id, items);
    }

    const evaluatedApplicationIds = new Set(
      (existingEvaluations ?? []).map(
        (evaluation) => evaluation.application_id,
      ),
    );

    return (applications ?? [])
      .map((application) => {
        const applicationDocuments =
          docsByApplication.get(application.id) ?? [];
        const approvedDocuments = applicationDocuments.filter(
          (document) => document.review_status === "approved",
        ).length;
        const allDocumentsApproved =
          applicationDocuments.length > 0 &&
          applicationDocuments.every(
            (document) => document.review_status === "approved",
          );

        return {
          application_id: application.id,
          student: application.student_profiles,
          offer: application.internship_offers,
          total_documents: applicationDocuments.length,
          approved_documents: approvedDocuments,
          already_evaluated: evaluatedApplicationIds.has(application.id),
          can_evaluate:
            allDocumentsApproved &&
            !evaluatedApplicationIds.has(application.id),
        };
      })
      .filter((application) => application.can_evaluate);
  }),

  create: supervisorProcedure
    .input(evaluationsCreateSchema)
    .mutation(async ({ ctx, input }) => {
      const application = await getApplicationForEvaluation(
        ctx.supabase,
        input.application_id,
      );

      if (!application) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Application not found",
        });
      }
      if (application.status !== "accepted") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Only accepted applications can be evaluated",
        });
      }

      const documents = await getDocumentsForApplication(
        ctx.supabase,
        input.application_id,
      );
      if (documents.length === 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            "At least one approved document is required before evaluation",
        });
      }
      if (documents.some((document) => document.review_status !== "approved")) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "All uploaded documents must be approved before evaluation",
        });
      }

      const { data: existingEvaluation, error: existingError } =
        await ctx.supabase
          .from("evaluations")
          .select("id")
          .eq("application_id", input.application_id)
          .maybeSingle();

      if (existingError) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: existingError.message,
        });
      }
      if (existingEvaluation) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "This application has already been evaluated",
        });
      }

      const { data, error } = await ctx.supabase
        .from("evaluations")
        .insert({
          application_id: input.application_id,
          supervisor_profile_id: ctx.user.id,
          score: input.score,
          comment: input.comment?.trim() || null,
        })
        .select(
          "id, application_id, supervisor_profile_id, score, comment, created_at",
        )
        .single();

      if (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message,
        });
      }

      return data;
    }),

  byApplication: protectedProcedure
    .input(evaluationsByApplicationSchema)
    .query(async ({ ctx, input }) => {
      const application = await getApplicationForEvaluation(
        ctx.supabase,
        input.application_id,
      );

      if (!application) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Application not found",
        });
      }

      if (
        ctx.profile.role === "student" &&
        application.student_profile_id !== ctx.user.id
      ) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not have access to this evaluation",
        });
      }
      if (ctx.profile.role === "employer") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not have access to this evaluation",
        });
      }

      const { data: evaluation, error } = await ctx.supabase
        .from("evaluations")
        .select(
          "id, application_id, supervisor_profile_id, score, comment, created_at",
        )
        .eq("application_id", input.application_id)
        .maybeSingle();

      if (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message,
        });
      }
      if (!evaluation) {
        return null;
      }

      const { data: supervisor, error: supervisorError } = await ctx.supabase
        .from("profiles")
        .select("first_name, last_name, email")
        .eq("id", evaluation.supervisor_profile_id)
        .maybeSingle();

      if (supervisorError) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: supervisorError.message,
        });
      }

      return {
        ...evaluation,
        supervisor,
      };
    }),
});
