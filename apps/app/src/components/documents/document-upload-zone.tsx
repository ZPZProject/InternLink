"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@v1/ui/button";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@v1/ui/field";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@v1/ui/select";
import { toast } from "@v1/ui/sonner";
import { useId, useRef, useState } from "react";
import { useTRPC } from "@/trpc/react";
import { UploadProgress } from "./upload-progress";

const MAX_BYTES = 10 * 1024 * 1024;

const ALLOWED_MIMES = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

function putFileWithProgress(
  url: string,
  file: File,
  onProgress: (percent: number | null) => void,
) {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.setRequestHeader(
      "Content-Type",
      file.type || "application/octet-stream",
    );
    xhr.upload.onloadstart = () => onProgress(null);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && e.total > 0) {
        onProgress(Math.min(100, Math.round((e.loaded / e.total) * 100)));
      }
    };
    xhr.onload = () => {
      onProgress(100);
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(
          new Error(
            xhr.status === 0
              ? "Network error"
              : `Upload failed (${xhr.status})`,
          ),
        );
      }
    };
    xhr.onerror = () => reject(new Error("Network error"));
    xhr.send(file);
  });
}

function validateFile(file: File): string | null {
  if (file.size > MAX_BYTES) {
    return "File must be 10 MB or smaller.";
  }
  const mime = file.type;
  if (mime && !ALLOWED_MIMES.has(mime)) {
    return "Only PDF and DOCX files are allowed.";
  }
  const lower = file.name.toLowerCase();
  if (!lower.endsWith(".pdf") && !lower.endsWith(".docx")) {
    return "Use a .pdf or .docx file.";
  }
  if (!mime) {
    if (!lower.endsWith(".pdf") && !lower.endsWith(".docx")) {
      return "Only PDF and DOCX files are allowed.";
    }
  }
  return null;
}

function mimeForUpload(file: File): string {
  if (file.type && ALLOWED_MIMES.has(file.type)) {
    return file.type;
  }
  if (file.name.toLowerCase().endsWith(".pdf")) {
    return "application/pdf";
  }
  return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
}

const DOC_TYPES = [
  { value: "contract", label: "Contract" },
  { value: "internship_log", label: "Internship log" },
  { value: "other", label: "Other" },
] as const;

type DocType = (typeof DOC_TYPES)[number]["value"];

export function DocumentUploadZone({
  applicationId,
}: {
  applicationId: string;
}) {
  const formId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [docType, setDocType] = useState<DocType>("contract");
  const [dragActive, setDragActive] = useState(false);
  const [uploadPercent, setUploadPercent] = useState<number | null>(null);
  const [uploadBusy, setUploadBusy] = useState(false);

  const intentMutation = useMutation(
    trpc.documents.createUploadIntent.mutationOptions(),
  );

  async function uploadFile(file: File) {
    const err = validateFile(file);
    if (err) {
      toast.error(err);
      return;
    }

    const mime_type = mimeForUpload(file);
    setUploadPercent(null);
    setUploadBusy(true);

    try {
      const intent = await intentMutation.mutateAsync({
        application_id: applicationId,
        type: docType,
        file_name: file.name,
        mime_type: mime_type as
          | "application/pdf"
          | "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        file_size_bytes: file.size,
      });

      await putFileWithProgress(intent.signedUrl, file, setUploadPercent);
      toast.success("File uploaded");
      await queryClient.invalidateQueries(
        trpc.documents.listByApplication.queryOptions({
          application_id: applicationId,
        }),
      );
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed. Try again.");
    } finally {
      setUploadPercent(null);
      setUploadBusy(false);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  }

  const busy = uploadBusy;

  return (
    <div className="space-y-4">
      <FieldGroup className="gap-4">
        <Field>
          <FieldLabel htmlFor={`${formId}-type`}>Document type</FieldLabel>
          <FieldDescription>
            Choose what you are uploading (e.g. contract or internship log).
          </FieldDescription>
          <Select
            value={docType}
            disabled={busy}
            onValueChange={(value) =>
              setDocType(value as (typeof DOC_TYPES)[number]["value"])
            }
          >
            <SelectTrigger id={`${formId}-type`} className="w-full max-w-md">
              <SelectValue placeholder="Document type" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {DOC_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>
      </FieldGroup>

      {/* biome-ignore lint/a11y/noStaticElementInteractions: drag-and-drop upload target */}
      <div
        className={`rounded-lg border border-dashed p-6 text-center transition-colors ${
          dragActive ? "bg-muted/80 border-primary" : "bg-muted/40"
        }`}
        onDragEnter={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          if (e.currentTarget === e.target) {
            setDragActive(false);
          }
        }}
        onDrop={(e) => {
          e.preventDefault();
          setDragActive(false);
          const f = e.dataTransfer.files[0];
          if (f) {
            void uploadFile(f);
          }
        }}
      >
        <p className="text-muted-foreground text-sm">
          Drag and drop a PDF or DOCX here, or choose a file (max 10 MB).
        </p>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          className="hidden"
          disabled={busy}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) {
              void uploadFile(f);
            }
          }}
        />
        <Button
          type="button"
          variant="secondary"
          className="mt-3"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
        >
          {busy ? "Uploading…" : "Choose file"}
        </Button>
      </div>

      {uploadPercent !== null && <UploadProgress value={uploadPercent} />}
    </div>
  );
}
