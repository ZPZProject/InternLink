"use client";

import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@v1/ui/button";
import { cn } from "@v1/ui/cn";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@v1/ui/field";
import { Icons } from "@v1/ui/icons";
import { Input } from "@v1/ui/input";
import { RadioGroup, RadioGroupItem } from "@v1/ui/radio-group";
import { toast } from "@v1/ui/sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { useI18n } from "@/locales/client";
import { useTRPC } from "@/trpc/react";

type RegisterValues = {
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
  role: "student" | "employer" | "supervisor";
};

export function RegisterForm() {
  const t = useI18n();

  const registerSchema = z.object({
    email: z.email(t("registerForm.error.invalidEmail")),
    password: z.string().min(8, t("registerForm.error.passwordTooShort")),
    first_name: z.string().trim().max(120).optional(),
    last_name: z.string().trim().max(120).optional(),
    role: z.enum(["student", "employer", "supervisor"]),
  });
  const formId = useId();
  const router = useRouter();
  const trpc = useTRPC();

  const ROLE_OPTIONS = [
    {
      value: "student" as const,
      title: t("registerForm.roleStudent"),
      Icon: Icons.Student,
    },
    {
      value: "employer" as const,
      title: t("registerForm.roleEmployer"),
      Icon: Icons.Employer,
    },
    {
      value: "supervisor" as const,
      title: t("registerForm.roleSupervisor"),
      Icon: Icons.Supervisor,
    },
  ];

  const signUp = useMutation(
    trpc.auth.signUp.mutationOptions({
      onSuccess: () => {
        toast.success(t("registerForm.successToast"));
        router.push("/login");
      },
      onError: (err) => {
        const message =
          err instanceof Error
            ? err.message
            : t("registerForm.error.createFailed");
        toast.error(message);
      },
    }),
  );
  const form = useForm<RegisterValues>({
    resolver: standardSchemaResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      first_name: "",
      last_name: "",
      role: "student",
    },
  });

  const busy = form.formState.isSubmitting || signUp.isPending;

  function onSubmit(values: RegisterValues) {
    signUp.mutate({
      email: values.email,
      password: values.password,
      role: values.role,
      first_name: values.first_name?.trim() || undefined,
      last_name: values.last_name?.trim() || undefined,
      callbackNext: "/home",
    });
  }

  return (
    <form
      id={`${formId}-register`}
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-4"
    >
      <FieldGroup>
        <Controller
          name="role"
          control={form.control}
          render={({ field, fieldState }) => (
            <FieldSet className="gap-3">
              <FieldLegend variant="label">
                {t("registerForm.roleFieldLegend")}
              </FieldLegend>
              <FieldDescription>
                {t("registerForm.roleDescription")}
              </FieldDescription>
              <RadioGroup
                className="grid w-full grid-cols-1 gap-2 sm:grid-cols-3"
                name={field.name}
                value={field.value}
                onValueChange={field.onChange}
                onBlur={field.onBlur}
                ref={field.ref}
              >
                {ROLE_OPTIONS.map(({ value, title, Icon }) => {
                  const itemId = `${formId}-role-${value}`;
                  return (
                    <Field
                      key={value}
                      orientation="horizontal"
                      data-invalid={fieldState.invalid ? true : undefined}
                      className={cn(
                        "rounded-lg border border-input bg-background p-2.5 transition-colors",
                        "has-data-[state=checked]:border-primary has-data-[state=checked]:bg-primary/5 dark:has-data-[state=checked]:border-primary/20 dark:has-data-[state=checked]:bg-primary/10",
                      )}
                    >
                      <div className="sr-only">
                        <RadioGroupItem
                          value={value}
                          id={itemId}
                          aria-invalid={fieldState.invalid}
                          disabled={busy}
                        />
                      </div>

                      <FieldLabel
                        htmlFor={itemId}
                        className={cn(
                          "min-w-0 flex-1 cursor-pointer font-normal leading-snug grid place-items-center gap-1",
                          {
                            "text-primary": value === field.value,
                            "text-muted-foreground": value !== field.value,
                          },
                        )}
                      >
                        <Icon className="size-6" />
                        <span>{title}</span>
                      </FieldLabel>
                    </Field>
                  );
                })}
              </RadioGroup>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </FieldSet>
          )}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Controller
            name="first_name"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid ? true : undefined}>
                <FieldLabel htmlFor={`${formId}-first_name`}>
                  {t("registerForm.firstNameLabel")}
                </FieldLabel>
                <Input
                  {...field}
                  id={`${formId}-first_name`}
                  autoComplete="given-name"
                  aria-invalid={fieldState.invalid}
                  disabled={busy}
                  placeholder={t("registerForm.firstNamePlaceholder")}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name="last_name"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid ? true : undefined}>
                <FieldLabel htmlFor={`${formId}-last_name`}>
                  {t("registerForm.lastNameLabel")}
                </FieldLabel>
                <Input
                  {...field}
                  id={`${formId}-last_name`}
                  autoComplete="family-name"
                  aria-invalid={fieldState.invalid}
                  disabled={busy}
                  placeholder={t("registerForm.lastNamePlaceholder")}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </div>

        <Controller
          name="email"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid ? true : undefined}>
              <FieldLabel htmlFor={`${formId}-email`}>
                {t("registerForm.emailLabel")}
              </FieldLabel>
              <Input
                {...field}
                id={`${formId}-email`}
                type="email"
                autoComplete="email"
                aria-invalid={fieldState.invalid}
                disabled={busy}
                placeholder={t("registerForm.emailPlaceholder")}
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
                {t("registerForm.passwordLabel")}
              </FieldLabel>
              <Input
                {...field}
                id={`${formId}-password`}
                type="password"
                autoComplete="new-password"
                aria-invalid={fieldState.invalid}
                disabled={busy}
                placeholder={t("registerForm.passwordPlaceholder")}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>

      <Button type="submit" className="w-full" disabled={busy}>
        {busy ? t("registerForm.submitBusy") : t("registerForm.submitIdle")}
      </Button>
      <p className="text-muted-foreground text-center text-sm">
        {t("registerForm.alreadyHaveAccount")}{" "}
        <Link className="text-primary underline" href="/login">
          {t("registerForm.signInLink")}
        </Link>
      </p>
    </form>
  );
}
