import { TRPCError } from "@trpc/server";
import type { Client } from "@v1/supabase/types";
import {
  documentsCreateUploadIntentSchema,
  documentsDeleteSchema,
  documentsListByApplicationSchema,
} from "../schemas/documents";
import { createTRPCRouter, studentProcedure } from "../trpc";

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
});
