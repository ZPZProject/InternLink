"use client";

import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@v1/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@v1/ui/field";
import { Input } from "@v1/ui/input";
import { toast } from "@v1/ui/sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { useI18n } from "@/locales/client";
import { useTRPC } from "@/trpc/react";

type LoginValues = { email: string; password: string };

export function LoginForm() {
  const t = useI18n();

  const loginSchema = z.object({
    email: z.email(t("loginForm.error.invalidEmail")),
    password: z.string().min(1, t("loginForm.error.passwordRequired")),
  });

  const formId = useId();
  const router = useRouter();
  const trpc = useTRPC();
  const signIn = useMutation(
    trpc.auth.signIn.mutationOptions({
      onSuccess: () => {
        router.refresh();
        router.push("/home");
      },
      onError: (err) => {
        const message =
          err instanceof Error ? err.message : t("loginForm.error.signInFailed");
        toast.error(message);
      },
    }),
  );
  const form = useForm<LoginValues>({
    resolver: standardSchemaResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const busy = form.formState.isSubmitting || signIn.isPending;

  function onSubmit(values: LoginValues) {
    signIn.mutate({
      email: values.email,
      password: values.password,
    });
  }

  return (
    <form
      id={`${formId}-login`}
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-4"
    >
      <FieldGroup>
        <Controller
          name="email"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid ? true : undefined}>
              <FieldLabel htmlFor={`${formId}-email`}>
                {t("loginForm.emailLabel")}
              </FieldLabel>
              <Input
                {...field}
                id={`${formId}-email`}
                type="email"
                autoComplete="email"
                aria-invalid={fieldState.invalid}
                disabled={busy}
                placeholder={t("loginForm.emailPlaceholder")}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="password"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid ? true : undefined}>
              <FieldLabel htmlFor={`${formId}-password`}>
                {t("loginForm.passwordLabel")}
              </FieldLabel>
              <Input
                {...field}
                id={`${formId}-password`}
                type="password"
                autoComplete="current-password"
                aria-invalid={fieldState.invalid}
                disabled={busy}
                placeholder={t("loginForm.passwordPlaceholder")}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>

      <Button type="submit" className="w-full" disabled={busy}>
        {busy ? t("loginForm.submitBusy") : t("loginForm.submitIdle")}
      </Button>
      <p className="text-muted-foreground text-center text-sm">
        {t("loginForm.noAccount")}{" "}
        <Link className="text-primary underline" href="/register">
          {t("loginForm.registerLink")}
        </Link>
      </p>
    </form>
  );
}
