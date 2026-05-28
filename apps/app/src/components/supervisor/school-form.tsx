"use client";

import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@v1/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@v1/ui/field";
import { Input } from "@v1/ui/input";
import { toast } from "@v1/ui/sonner";
import { Textarea } from "@v1/ui/textarea";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { useI18n } from "@/locales/client";
import { useTRPC } from "@/trpc/react";

const createSchoolSchema = z.object({
  name: z.string().trim().min(1, "School name is required").max(200),
  address: z.string().trim().max(500).optional(),
  website: z.string().trim().max(500).optional(),
});

type CreateSchoolValues = z.infer<typeof createSchoolSchema>;

export function SchoolForm() {
  const t = useI18n();
  const router = useRouter();
  const trpc = useTRPC();
  const createForm = useForm<CreateSchoolValues>({
    resolver: standardSchemaResolver(createSchoolSchema),
    defaultValues: { name: "", address: "", website: "" },
  });
  const createMutation = useMutation(
    trpc.school.create.mutationOptions({
      onSuccess: () => {
        toast.success(t("schoolForm.toast.success"));
        router.refresh();
        router.push("/home");
      },
      onError: (err) => {
        toast.error(
          err instanceof Error ? err.message : t("schoolForm.toast.error"),
        );
      },
    }),
  );

  const busyCreate =
    createMutation.isPending || createForm.formState.isSubmitting;

  function onCreate(values: CreateSchoolValues) {
    createMutation.mutate({
      name: values.name,
      address: values.address || null,
      website: values.website || null,
    });
  }

  return (
    <form className="space-y-4" onSubmit={createForm.handleSubmit(onCreate)}>
      <FieldGroup>
        <Controller
          name="name"
          control={createForm.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid ? true : undefined}>
              <FieldLabel htmlFor="school-name">
                {t("schoolForm.nameLabel")}
              </FieldLabel>
              <Input
                {...field}
                id="school-name"
                aria-invalid={fieldState.invalid}
                disabled={busyCreate}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="address"
          control={createForm.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid ? true : undefined}>
              <FieldLabel htmlFor="school-address">
                {t("schoolForm.addressLabel")}
              </FieldLabel>
              <Textarea
                {...field}
                id="school-address"
                aria-invalid={fieldState.invalid}
                disabled={busyCreate}
                rows={2}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="website"
          control={createForm.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid ? true : undefined}>
              <FieldLabel htmlFor="school-website">
                {t("schoolForm.websiteLabel")}
              </FieldLabel>
              <Input
                {...field}
                id="school-website"
                aria-invalid={fieldState.invalid}
                disabled={busyCreate}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>
      <Button type="submit" className="w-full" disabled={busyCreate}>
        {busyCreate ? t("schoolForm.submitBusy") : t("schoolForm.submitIdle")}
      </Button>
    </form>
  );
}
