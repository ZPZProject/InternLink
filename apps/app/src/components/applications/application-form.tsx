"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@v1/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@v1/ui/field";
import { toast } from "@v1/ui/sonner";
import { Textarea } from "@v1/ui/textarea";
import { useRouter } from "next/navigation";
import { useId } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { useTRPC } from "@/trpc/react";

const schema = z.object({
  motivation_letter: z.string().max(5000),
});

type Values = z.infer<typeof schema>;

const defaults: Values = {
  motivation_letter: "",
};

export function ApplicationForm({
  offerId,
  onSuccess,
}: {
  offerId: string;
  onSuccess?: () => void;
}) {
  const formId = useId();
  const router = useRouter();
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const form = useForm<Values>({
    defaultValues: defaults,
  });

  const mut = useMutation(
    trpc.applications.create.mutationOptions({
      onSuccess: () => {
        toast.success("Application submitted successfully");
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
          err instanceof Error ? err.message : "Could not submit application",
        );
      },
    }),
  );

  const busy = form.formState.isSubmitting || mut.isPending;

  function onSubmit(values: Values) {
    mut.mutate({
      offer_id: offerId,
      motivation_letter: values.motivation_letter,
    });
  }

  return (
    <form
      className="space-y-4"
      onSubmit={form.handleSubmit(onSubmit)}
      noValidate
    >
      <FieldGroup className="flex flex-col gap-4">
        <Controller
          name="motivation_letter"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid ? true : undefined}>
              <FieldLabel htmlFor={`${formId}-motivation`}>
                Motivation letter
              </FieldLabel>
              <FieldDescription>
                Explain why you want to do this internship and what makes you a
                good candidate.
              </FieldDescription>
              <Textarea
                {...field}
                id={`${formId}-motivation`}
                value={field.value ?? ""}
                onChange={field.onChange}
                disabled={busy}
                aria-invalid={fieldState.invalid}
                rows={6}
                placeholder="I am interested in this position because..."
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>
      <div className="flex gap-2">
        <Button type="submit" disabled={busy}>
          {busy ? "Submitting…" : "Submit application"}
        </Button>
      </div>
    </form>
  );
}
