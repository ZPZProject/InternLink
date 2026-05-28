"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, buttonVariants } from "@v1/ui/button";
import { cn } from "@v1/ui/cn";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@v1/ui/field";
import { Icons } from "@v1/ui/icons";
import { toast } from "@v1/ui/sonner";
import { useRouter } from "next/navigation";
import { useId, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { RichTextEditor } from "@/components/editor/rich-text-editor";
import { useI18n } from "@/locales/client";
import { useTRPC } from "@/trpc/react";

const MAX_CV_BYTES = 10 * 1024 * 1024;
const ALLOWED_CV_MIMES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const schema = z.object({
  motivation_letter: z.string().max(10000),
});

type Values = z.infer<typeof schema>;

const defaults: Values = {
  motivation_letter: "",
};

function putFileWithProgress(url: string, file: File): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.setRequestHeader(
      "Content-Type",
      file.type || "application/octet-stream",
    );
    xhr.onload = () => {
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

export function ApplicationForm({
  offerId,
  onSuccess,
}: {
  offerId: string;
  onSuccess?: () => void;
}) {
  const t = useI18n();
  const formId = useId();
  const cvInputId = `${formId}-cv`;
  const router = useRouter();
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cvUploading, setCvUploading] = useState(false);
  const [cvError, setCvError] = useState<string | null>(null);

  const form = useForm<Values>({
    defaultValues: defaults,
  });

  const createIntent = useMutation(
    trpc.documents.createCvUploadIntent.mutationOptions(),
  );

  const createApp = useMutation(
    trpc.applications.create.mutationOptions({
      onSuccess: async (application) => {
        if (cvFile) {
          setCvUploading(true);
          try {
            const intent = await createIntent.mutateAsync({
              application_id: application.id,
              type: "cv",
              file_name: cvFile.name,
              mime_type: cvFile.type as
                | "application/pdf"
                | "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
              file_size_bytes: cvFile.size,
            });
            await putFileWithProgress(intent.signedUrl, cvFile);
          } catch (err) {
            setCvUploading(false);
            toast.error(
              err instanceof Error
                ? err.message
                : t("applicationForm.toast.error"),
            );
            return;
          }
          setCvUploading(false);
        }

        toast.success(t("applicationForm.toast.success"));
        queryClient.invalidateQueries(
          trpc.applications.myList.queryOptions({ limit: 20, offset: 0 }),
        );
        queryClient.invalidateQueries(
          trpc.offers.listMine.queryOptions({ limit: 50, offset: 0 }),
        );
        onSuccess?.();
        router.push("/student/applications");
      },
      onError: (err) => {
        toast.error(
          err instanceof Error ? err.message : t("applicationForm.toast.error"),
        );
      },
    }),
  );

  const busy =
    form.formState.isSubmitting || createApp.isPending || cvUploading;

  function onSubmit(values: Values) {
    createApp.mutate({
      offer_id: offerId,
      motivation_letter: values.motivation_letter,
    });
  }

  function handleCvSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setCvError(null);
    if (!file) {
      setCvFile(null);
      return;
    }
    if (!ALLOWED_CV_MIMES.includes(file.type)) {
      setCvError("Only PDF and DOCX files are allowed.");
      setCvFile(null);
      return;
    }
    if (file.size > MAX_CV_BYTES) {
      setCvError("File size must be less than 10 MB.");
      setCvFile(null);
      return;
    }
    setCvFile(file);
  }

  function removeCv() {
    setCvFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  return (
    <form
      className="space-y-6"
      onSubmit={form.handleSubmit(onSubmit)}
      noValidate
    >
      <FieldGroup className="flex flex-col gap-6">
        <Controller
          name="motivation_letter"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid ? true : undefined}>
              <FieldLabel htmlFor={`${formId}-motivation`}>
                {t("applicationForm.motivationLabel")}
              </FieldLabel>
              <FieldDescription>
                {t("applicationForm.motivationDescription")}
              </FieldDescription>
              <RichTextEditor
                id={`${formId}-motivation`}
                value={field.value ?? ""}
                onChange={field.onChange}
                disabled={busy}
                aria-invalid={fieldState.invalid}
                placeholder={t("applicationForm.motivationPlaceholder")}
                minHeight="min-h-[200px]"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Field>
          <FieldLabel>{t("applicationForm.cvLabel")}</FieldLabel>
          <FieldDescription>
            {t("applicationForm.cvDescription")}
          </FieldDescription>
          {cvFile ? (
            <div className="flex items-center gap-3 rounded-md border border-input bg-muted/30 px-3 py-2">
              <Icons.FileText className="size-5 shrink-0 text-muted-foreground" />
              <span className="flex-1 truncate text-sm">{cvFile.name}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                disabled={busy}
                onClick={removeCv}
              >
                <Icons.X className="size-4" />
              </Button>
            </div>
          ) : (
            <label
              htmlFor={cvInputId}
              className={cn(
                "flex cursor-pointer flex-col items-center gap-2 rounded-md border-2 border-dashed border-input px-4 py-6 text-center transition-colors hover:border-muted-foreground/50",
                busy && "pointer-events-none opacity-50",
              )}
            >
              <Icons.Upload className="size-6 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {t("applicationForm.cvDropHint")}
              </p>
              <span
                className={cn(
                  buttonVariants({ variant: "secondary", size: "sm" }),
                  "pointer-events-none",
                )}
              >
                {t("applicationForm.cvChooseFile")}
              </span>
            </label>
          )}
          {cvError && (
            <p className="mt-1 text-sm text-destructive">{cvError}</p>
          )}
          <input
            id={cvInputId}
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx"
            className="hidden"
            onChange={handleCvSelect}
            disabled={busy}
          />
        </Field>
      </FieldGroup>

      <div className="flex gap-2">
        <Button type="submit" disabled={busy}>
          {busy
            ? t("applicationForm.submitBusy")
            : t("applicationForm.submitIdle")}
        </Button>
      </div>
    </form>
  );
}
