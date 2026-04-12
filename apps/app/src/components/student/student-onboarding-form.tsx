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
import { SchoolCombobox } from "@/components/school/school-combobox";
import { useTRPC } from "@/trpc/react";

const studentOnboardingFormSchema = z.object({
  school_id: z.uuid("Select your school or university"),
  index_number: z.string().trim().min(1, "Index number is required").max(40),
  major: z.string().trim().min(1, "Major is required").max(200),
  year_of_study: z.coerce
    .number()
    .int()
    .min(1, "Year must be between 1 and 6")
    .max(6, "Year must be between 1 and 6"),
});

type FormValues = z.infer<typeof studentOnboardingFormSchema>;

export function StudentOnboardingForm({
  initial,
}: {
  initial: Tables<"student_profiles"> | null;
}) {
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
        toast.success("Profile saved");
        router.refresh();
        router.push("/home");
      },
      onError: (err) => {
        toast.error(
          err instanceof Error ? err.message : "Could not save profile",
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
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Complete your student profile
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          We need your school, index number, major, and year of study before you
          can browse offers and apply.
        </p>
      </div>

      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <FieldGroup>
          <Controller
            name="school_id"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid ? true : undefined}>
                <FieldLabel>School / university</FieldLabel>
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
                <FieldLabel htmlFor="index_number">Index number</FieldLabel>
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
                <FieldLabel htmlFor="major">Major / field of study</FieldLabel>
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
                  Year of study (1–6)
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
          Save and continue
        </Button>
      </form>
    </div>
  );
}
