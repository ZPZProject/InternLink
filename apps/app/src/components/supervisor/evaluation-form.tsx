"use client";

import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@v1/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from "@v1/ui/field";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@v1/ui/select";
import { toast } from "@v1/ui/sonner";
import { Textarea } from "@v1/ui/textarea";
import { useId } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { useI18n } from "@/locales/client";
import { useTRPC } from "@/trpc/react";

const schema = z.object({
  score: z.enum(["2", "3", "4", "5"]),
  comment: z.string().max(2000).optional().default(""),
});

type Values = z.infer<typeof schema>;

export function EvaluationForm({
  applicationId,
  studentName,
  onDone,
}: {
  applicationId: string;
  studentName: string;
  onDone?: () => void;
}) {
  const t = useI18n();
  const formId = useId();
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const form = useForm<Values>({
    resolver: standardSchemaResolver(schema),
    defaultValues: { score: "4", comment: "" },
  });

  const createMutation = useMutation(
    trpc.evaluations.create.mutationOptions({
      onSuccess: async () => {
        toast.success(t("evaluationForm.toast.success"));
        await queryClient.invalidateQueries(
          trpc.evaluations.listCompletable.queryOptions(),
        );
        onDone?.();
      },
      onError: (error) => {
        toast.error(
          error instanceof Error
            ? error.message
            : t("evaluationForm.toast.error"),
        );
      },
    }),
  );

  const busy = form.formState.isSubmitting || createMutation.isPending;

  function onSubmit(values: Values) {
    createMutation.mutate({
      application_id: applicationId,
      score: Number(values.score),
      comment: values.comment?.trim() || null,
    });
  }

  return (
    <form
      className="space-y-4 rounded-lg border p-4"
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <FieldGroup>
        <FieldTitle>
          {t("evaluationForm.title", { studentName })}
        </FieldTitle>
        <Controller
          name="score"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid ? true : undefined}>
              <FieldLabel htmlFor={`${formId}-score`}>
                {t("evaluationForm.scoreLabel")}
              </FieldLabel>
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={busy}
              >
                <SelectTrigger
                  id={`${formId}-score`}
                  className="w-full max-w-xs"
                >
                  <SelectValue
                    placeholder={t("evaluationForm.scorePlaceholder")}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {[2, 3, 4, 5].map((score) => (
                      <SelectItem key={score} value={`${score}`}>
                        {score}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="comment"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid ? true : undefined}>
              <FieldLabel htmlFor={`${formId}-comment`}>
                {t("evaluationForm.commentLabel")}
              </FieldLabel>
              <Textarea
                {...field}
                id={`${formId}-comment`}
                rows={5}
                placeholder={t("evaluationForm.commentPlaceholder")}
                disabled={busy}
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>
      <div className="flex gap-2">
        <Button type="submit" disabled={busy}>
          {t("evaluationForm.saveBtn")}
        </Button>
        {onDone && (
          <Button
            type="button"
            variant="outline"
            onClick={onDone}
            disabled={busy}
          >
            {t("evaluationForm.cancelBtn")}
          </Button>
        )}
      </div>
    </form>
  );
}
