"use client";

import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useMutation } from "@tanstack/react-query";
import type { Tables } from "@v1/supabase/types";
import { Button } from "@v1/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@v1/ui/field";
import { Input } from "@v1/ui/input";
import { toast } from "@v1/ui/sonner";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { useI18n } from "@/locales/client";
import { SchoolCombobox } from "@/components/school/school-combobox";
import { useTRPC } from "@/trpc/react";

type FormValues = {
  school_id: string;
  index_number: string;
  major: string;
  year_of_study: number;
};

export function StudentOnboardingForm({
  initial,
}: {
  initial: Tables<"student_profiles"> | null;
}) {
  const t = useI18n();

  const studentOnboardingFormSchema = z.object({
    school_id: z.uuid(t("studentOnboardingForm.error.schoolRequired")),
    index_number: z
      .string()
      .trim()
      .min(1, t("studentOnboardingForm.error.indexRequired"))
      .max(40),
    major: z
      .string()
      .trim()
      .min(1, t("studentOnboardingForm.error.majorRequired"))
      .max(200),
    year_of_study: z.coerce
      .number()
      .int()
      .min(1, t("studentOnboardingForm.error.yearRange"))
      .max(6, t("studentOnboardingForm.error.yearRange")),
  });

  const router = useRouter();
  const trpc = useTRPC();
  const form = useForm<FormValues>({
    resolver: standardSchemaResolver(studentOnboardingFormSchema),
    defaultValues: {
      school_id: initial?.school_id ?? "",
      index_number: initial?.index_number ?? "",
      major: initial?.major ?? "",
      year_of_study: initial?.year_of_study ?? 1,
    },
  });

  const mutation = useMutation(
    trpc.student.completeOnboarding.mutationOptions({
      onSuccess: () => {
        toast.success(t("studentOnboardingForm.toast.success"));
        router.refresh();
        router.push("/home");
      },
      onError: (err) => {
        toast.error(
          err instanceof Error
            ? err.message
            : t("studentOnboardingForm.toast.error"),
        );
      },
    }),
  );

  const busy = mutation.isPending || form.formState.isSubmitting;

  function onSubmit(values: FormValues) {
    mutation.mutate(values);
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <FieldGroup>
          <Controller
            name="school_id"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid ? true : undefined}>
                <FieldLabel>{t("studentOnboardingForm.schoolLabel")}</FieldLabel>
                <SchoolCombobox
                  value={field.value || undefined}
                  onChange={field.onChange}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name="index_number"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid ? true : undefined}>
                <FieldLabel htmlFor="index_number">
                  {t("studentOnboardingForm.indexNumberLabel")}
                </FieldLabel>
                <Input
                  {...field}
                  id="index_number"
                  autoComplete="off"
                  aria-invalid={fieldState.invalid}
                  disabled={busy}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name="major"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid ? true : undefined}>
                <FieldLabel htmlFor="major">
                  {t("studentOnboardingForm.majorLabel")}
                </FieldLabel>
                <Input
                  {...field}
                  id="major"
                  autoComplete="organization"
                  aria-invalid={fieldState.invalid}
                  disabled={busy}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name="year_of_study"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid ? true : undefined}>
                <FieldLabel htmlFor="year_of_study">
                  {t("studentOnboardingForm.yearLabel")}
                </FieldLabel>
                <Input
                  {...field}
                  id="year_of_study"
                  type="number"
                  min={1}
                  max={6}
                  inputMode="numeric"
                  aria-invalid={fieldState.invalid}
                  disabled={busy}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value === "" ? "" : Number(e.target.value),
                    )
                  }
                  value={field.value === undefined ? "" : field.value}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </FieldGroup>
        <Button disabled={busy} type="submit">
          {t("studentOnboardingForm.submitBtn")}
        </Button>
      </form>
    </div>
  );
}
