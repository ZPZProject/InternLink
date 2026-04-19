"use client";

import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@v1/ui/button";
import { DatePicker } from "@v1/ui/date-picker";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from "@v1/ui/field";
import { Input } from "@v1/ui/input";
import { toast } from "@v1/ui/sonner";
import { Switch } from "@v1/ui/switch";
import { Textarea } from "@v1/ui/textarea";
import { useRouter } from "next/navigation";
import { useId } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { useTRPC } from "@/trpc/react";
import { CityLocationCombobox } from "./city-location-combobox";
import { EMPLOYER_OFFERS_LIST_QUERY } from "./employer-offers-query";

const schema = z
  .object({
    title: z.string().trim().min(1).max(200),
    description: z.string().max(20_000).optional().default(""),
    requirements: z.string().max(20_000).optional(),
    location: z.string().trim().min(1).max(200),
    number_of_positions: z.coerce.number().int().min(1).max(500),
    start_date: z.date(),
    end_date: z.date(),
    application_deadline: z.date().optional(),
    is_active: z.boolean(),
  })
  .refine((v) => v.end_date >= v.start_date, {
    message: "End date must be on or after start date",
    path: ["end_date"],
  });

type Values = z.infer<typeof schema>;

const defaults: Partial<Values> = {
  title: "",
  description: "",
  requirements: "",
  location: "",
  number_of_positions: 1,
  is_active: false,
};

export function OfferForm({
  mode,
  offerId,
  initial,
}: {
  mode: "create" | "edit";
  offerId?: string;
  initial?: Partial<Values>;
}) {
  const formId = useId();
  const router = useRouter();
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const form = useForm<Values>({
    resolver: standardSchemaResolver(schema),
    defaultValues: { ...defaults, ...initial },
  });

  const createMut = useMutation(
    trpc.offers.create.mutationOptions({
      onSuccess: () => {
        toast.success("Offer created");
        router.push(`/employer/offers`);
      },
      onError: (err) => {
        toast.error(
          err instanceof Error ? err.message : "Could not create offer",
        );
      },
    }),
  );

  const updateMut = useMutation(
    trpc.offers.update.mutationOptions({
      onSuccess: () => {
        toast.success("Offer updated");
        queryClient.invalidateQueries(
          trpc.offers.listMine.queryOptions(EMPLOYER_OFFERS_LIST_QUERY),
        );
      },
      onError: (err) => {
        toast.error(
          err instanceof Error ? err.message : "Could not update offer",
        );
      },
    }),
  );

  const busy =
    form.formState.isSubmitting || createMut.isPending || updateMut.isPending;

  function onSubmit(values: Values) {
    const deadline =
      values.application_deadline && values.application_deadline !== undefined
        ? values.application_deadline
        : null;

    if (mode === "create") {
      createMut.mutate({
        title: values.title,
        description: values.description ?? "",
        requirements: values.requirements || null,
        location: values.location,
        number_of_positions: values.number_of_positions,
        start_date: values.start_date,
        end_date: values.end_date,
        application_deadline: deadline,
        is_active: values.is_active,
      });
      return;
    }

    if (!offerId) return;

    updateMut.mutate({
      id: offerId,
      title: values.title,
      description: values.description,
      requirements: values.requirements || null,
      location: values.location,
      number_of_positions: values.number_of_positions,
      start_date: values.start_date,
      end_date: values.end_date,
      application_deadline: deadline,
      is_active: values.is_active,
    });
  }

  return (
    <form
      className="space-y-4"
      onSubmit={form.handleSubmit(onSubmit)}
      noValidate
    >
      <FieldGroup className="flex flex-col gap-4 md:flex-row">
        <div className="flex-1 space-y-4">
          <Controller
            name="title"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid ? true : undefined}>
                <FieldLabel htmlFor={`${formId}-title`}>Title</FieldLabel>
                <Input
                  {...field}
                  id={`${formId}-title`}
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
            name="description"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid ? true : undefined}>
                <FieldLabel htmlFor={`${formId}-desc`}>Description</FieldLabel>
                <Textarea
                  {...field}
                  id={`${formId}-desc`}
                  rows={5}
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
            name="requirements"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid ? true : undefined}>
                <FieldLabel htmlFor={`${formId}-req`}>
                  Requirements (optional)
                </FieldLabel>
                <Textarea
                  {...field}
                  id={`${formId}-req`}
                  rows={3}
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
            name="location"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid ? true : undefined}>
                <FieldLabel htmlFor={`${formId}-loc`}>Location</FieldLabel>
                <CityLocationCombobox
                  id={`${formId}-loc`}
                  value={field.value}
                  onChange={field.onChange}
                  disabled={busy}
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </div>
        <div className="shrink-0 basis-3xs space-y-4">
          <Controller
            name="is_active"
            control={form.control}
            render={({ field }) => (
              <FieldLabel htmlFor="is_active">
                <Field orientation="horizontal">
                  <FieldContent>
                    <FieldTitle>Active</FieldTitle>
                    <FieldDescription>
                      Visible in the public offers list
                    </FieldDescription>
                  </FieldContent>
                  <Switch
                    id="is_active"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={busy}
                  />
                </Field>
              </FieldLabel>
            )}
          />
          <Controller
            name="number_of_positions"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid ? true : undefined}>
                <FieldLabel htmlFor={`${formId}-num`}>
                  Number of positions
                </FieldLabel>
                <Input
                  {...field}
                  id={`${formId}-num`}
                  type="number"
                  min={1}
                  aria-invalid={fieldState.invalid}
                  disabled={busy}
                  onChange={(e) => field.onChange(e.target.valueAsNumber)}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name="start_date"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid ? true : undefined}>
                <FieldLabel htmlFor={`${formId}-start`}>Start date</FieldLabel>
                <DatePicker
                  selected={field.value ? new Date(field.value) : undefined}
                  onSelect={field.onChange}
                  disabled={busy}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name="end_date"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid ? true : undefined}>
                <FieldLabel htmlFor={`${formId}-end`}>End date</FieldLabel>
                <DatePicker
                  selected={field.value ? new Date(field.value) : undefined}
                  onSelect={field.onChange}
                  disabled={busy}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name="application_deadline"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid ? true : undefined}>
                <FieldLabel htmlFor={`${formId}-deadline`}>
                  Application deadline (optional)
                </FieldLabel>
                <DatePicker
                  selected={field.value ? new Date(field.value) : undefined}
                  onSelect={field.onChange}
                  disabled={busy}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </div>
      </FieldGroup>
      <Button type="submit" disabled={busy}>
        {busy ? "Saving…" : mode === "create" ? "Create offer" : "Save changes"}
      </Button>
    </form>
  );
}
