import { z } from "zod/v4";

export const DOCUMENT_TYPES = ["cv", "contract", "internship_log", "other"] as const;

/** PDF only. */
export const ALLOWED_DOCUMENT_MIMES = [
  "application/pdf",
] as const;

export const MAX_DOCUMENT_BYTES = 10 * 1024 * 1024;

export const documentsCreateUploadIntentSchema = z.object({
  application_id: z.uuid(),
  type: z.enum(DOCUMENT_TYPES),
  file_name: z.string().min(1).max(255),
  mime_type: z.enum(ALLOWED_DOCUMENT_MIMES),
  file_size_bytes: z.number().int().positive().max(MAX_DOCUMENT_BYTES),
});

export const documentsListByApplicationSchema = z.object({
  application_id: z.uuid(),
});

export const documentsDeleteSchema = z.object({
  id: z.uuid(),
});

export const documentsReviewSchema = z.object({
  document_id: z.uuid(),
  action: z.enum(["approve", "reject"]),
  rejection_reason: z.string().max(500).optional(),
});

export const documentsGetSignedReadUrlSchema = z.object({
  document_id: z.uuid(),
});
