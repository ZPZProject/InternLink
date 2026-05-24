import { TRPCError } from "@trpc/server";
import type { Client } from "@v1/supabase/types";
import {
  documentsCreateUploadIntentSchema,
  documentsDeleteSchema,
  documentsGetSignedReadUrlSchema,
  documentsListByApplicationSchema,
  documentsReviewSchema,
} from "../schemas/documents";
import {
  createTRPCRouter,
  protectedProcedure,
  studentProcedure,
  supervisorProcedure,
} from "../trpc";

const BUCKET = "application-documents";

function slugFileName(fileName: string): string {
  const base = fileName.split(/[/\\]/).pop() ?? "file";
  const cleaned = base
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 180);
  return cleaned.length > 0 ? cleaned : "file";
}

async function assertStudentAcceptedApplication(
  ctx: {
    supabase: Client;
    user: { id: string };
  },
  applicationId: string,
) {
  const { data: app, error } = await ctx.supabase
    .from("applications")
    .select("id, student_profile_id, status")
    .eq("id", applicationId)
    .maybeSingle();

  if (error) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: error.message,
    });
  }
  if (!app) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Application not found",
    });
  }
  if (app.student_profile_id !== ctx.user.id) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "You do not have access to this application",
    });
  }
  if (app.status !== "accepted") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Documents can only be managed for accepted applications",
    });
  }
  return app;
}

async function assertStudentOwnsApplication(
  ctx: {
    supabase: Client;
    user: { id: string };
  },
  applicationId: string,
) {
  const { data: app, error } = await ctx.supabase
    .from("applications")
    .select("id, student_profile_id, status")
    .eq("id", applicationId)
    .maybeSingle();

  if (error) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: error.message,
    });
  }
  if (!app) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Application not found",
    });
  }
  if (app.student_profile_id !== ctx.user.id) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "You do not have access to this application",
    });
  }
  return app;
}

export const documentsRouter = createTRPCRouter({
  createUploadIntent: studentProcedure
    .input(documentsCreateUploadIntentSchema)
    .mutation(async ({ ctx, input }) => {
      await assertStudentAcceptedApplication(ctx, input.application_id);

      const documentId = crypto.randomUUID();
      const slug = slugFileName(input.file_name);
      const storagePath = `${input.application_id}/${documentId}_${slug}`;

      const { data: row, error: insertError } = await ctx.supabase
        .from("documents")
        .insert({
          id: documentId,
          application_id: input.application_id,
          type: input.type,
          file_name: input.file_name,
          storage_path: storagePath,
          file_size_bytes: input.file_size_bytes,
          mime_type: input.mime_type,
        })
        .select("id, storage_path")
        .single();

      if (insertError) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: insertError?.message ?? "Could not create document record",
        });
      }

      const { data: signed, error: signError } =
        await ctx.supabaseServiceRole.storage
          .from(BUCKET)
          .createSignedUploadUrl(storagePath);

      if (signError) {
        await ctx.supabase.from("documents").delete().eq("id", documentId);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: signError?.message ?? "Could not create upload URL",
        });
      }

      return {
        documentId: row.id,
        storagePath: row.storage_path,
        signedUrl: signed.signedUrl,
        token: signed.token,
        path: signed.path,
      };
    }),

  listByApplication: studentProcedure
    .input(documentsListByApplicationSchema)
    .query(async ({ ctx, input }) => {
      await assertStudentOwnsApplication(ctx, input.application_id);

      const { data, error } = await ctx.supabase
        .from("documents")
        .select("*")
        .eq("application_id", input.application_id)
        .order("uploaded_at", { ascending: false });

      if (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message,
        });
      }

      return data ?? [];
    }),

  delete: studentProcedure
    .input(documentsDeleteSchema)
    .mutation(async ({ ctx, input }) => {
      const { data: doc, error: fetchError } = await ctx.supabase
        .from("documents")
        .select("id, application_id, storage_path, review_status")
        .eq("id", input.id)
        .maybeSingle();

      if (fetchError) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: fetchError.message,
        });
      }
      if (!doc) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Document not found",
        });
      }

      await assertStudentAcceptedApplication(ctx, doc.application_id);

      if (doc.review_status !== "pending") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Only pending documents can be deleted",
        });
      }

      const { error: removeError } = await ctx.supabaseServiceRole.storage
        .from(BUCKET)
        .remove([doc.storage_path]);

      if (removeError) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: removeError.message,
        });
      }

      const { error: delError } = await ctx.supabase
        .from("documents")
        .delete()
        .eq("id", input.id);

      if (delError) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: delError.message,
        });
      }

      return { ok: true as const };
    }),

  listByApplicationSupervisor: supervisorProcedure
    .input(documentsListByApplicationSchema)
    .query(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from("documents")
        .select("*")
        .eq("application_id", input.application_id)
        .order("uploaded_at", { ascending: false });

      if (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message,
        });
      }

      return data ?? [];
    }),

  review: supervisorProcedure
    .input(documentsReviewSchema)
    .mutation(async ({ ctx, input }) => {
      const { data: doc, error: fetchError } = await ctx.supabase
        .from("documents")
        .select("id, review_status")
        .eq("id", input.document_id)
        .maybeSingle();

      if (fetchError) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: fetchError.message,
        });
      }
      if (!doc) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Document not found",
        });
      }
      if (doc.review_status !== "pending") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "This document has already been reviewed",
        });
      }

      const newStatus = input.action === "approve" ? "approved" : "rejected";

      const { error: updateError } = await ctx.supabase
        .from("documents")
        .update({
          review_status: newStatus,
          reviewed_at: new Date().toISOString(),
          supervisor_id: ctx.user.id,
          rejection_reason:
            input.action === "reject" ? (input.rejection_reason ?? null) : null,
        })
        .eq("id", input.document_id);

      if (updateError) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: updateError.message,
        });
      }

      return { ok: true as const, review_status: newStatus };
    }),

  getSignedReadUrl: supervisorProcedure
    .input(documentsGetSignedReadUrlSchema)
    .query(async ({ ctx, input }) => {
      const { data: doc, error: fetchError } = await ctx.supabase
        .from("documents")
        .select("id, storage_path")
        .eq("id", input.document_id)
        .maybeSingle();

      if (fetchError) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: fetchError.message,
        });
      }
      if (!doc) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Document not found",
        });
      }

      const { data: signed, error: signError } =
        await ctx.supabaseServiceRole.storage
          .from(BUCKET)
          .createSignedUrl(doc.storage_path, 300);

      if (signError) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: signError?.message ?? "Could not create download URL",
        });
      }

      return { signedUrl: signed.signedUrl, expiresIn: 300 };
    }),

  reviewQueue: supervisorProcedure.query(async ({ ctx }) => {
    const { data: applications, error } = await ctx.supabase
      .from("applications")
      .select(
        `id, status, applied_at,
         student_profiles!inner(id, index_number, major, year_of_study, profiles!inner(first_name, last_name, email)),
         internship_offers!inner(id, title, location, companies!inner(name))`,
      )
      .eq("status", "accepted");

    if (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: error.message,
      });
    }

    const appIds = (applications ?? []).map((a) => a.id);

    if (appIds.length === 0) {
      return [];
    }

    const { data: docs, error: docsError } = await ctx.supabase
      .from("documents")
      .select("*")
      .in("application_id", appIds)
      .order("uploaded_at", { ascending: false });

    if (docsError) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: docsError.message,
      });
    }

    const docsByApp = new Map<string, typeof docs>();
    for (const d of docs ?? []) {
      const existing = docsByApp.get(d.application_id) ?? [];
      existing.push(d);
      docsByApp.set(d.application_id, existing);
    }

    return (applications ?? [])
      .map((app) => {
        const appDocs = docsByApp.get(app.id) ?? [];
        const pendingDocs = appDocs.filter(
          (d) => d.review_status === "pending",
        );
        return {
          application_id: app.id,
          status: app.status,
          applied_at: app.applied_at,
          student: app.student_profiles as {
            id: string;
            index_number: string | null;
            major: string | null;
            year_of_study: number | null;
            profiles: {
              first_name: string | null;
              last_name: string | null;
              email: string | null;
            };
          },
          offer: app.internship_offers as {
            id: string;
            title: string;
            location: string | null;
            companies: { name: string };
          },
          total_documents: appDocs.length,
          pending_documents: pendingDocs.length,
          documents: appDocs,
        };
      })
      .filter((item) => item.pending_documents > 0);
  }),
});
