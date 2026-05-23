import { z } from "zod/v4";

export const DOCUMENT_TYPES = ["contract", "internship_log", "other"] as const;

/** PDF and DOCX only (spec). */
export const ALLOWED_DOCUMENT_MIMES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
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
