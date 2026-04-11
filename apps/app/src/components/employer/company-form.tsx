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
import { useTRPC } from "@/trpc/react";

const createCompanySchema = z.object({
  name: z.string().trim().min(1, "Company name is required").max(200),
  tax_id: z.string().trim().max(80).optional(),
  address: z.string().trim().max(500).optional(),
  contact_person: z.string().trim().max(200).optional(),
});

type CreateCompanyValues = z.infer<typeof createCompanySchema>;

export const CompanyForm = () => {
  const router = useRouter();
  const trpc = useTRPC();
  const createForm = useForm<CreateCompanyValues>({
    resolver: standardSchemaResolver(createCompanySchema),
    defaultValues: {
      name: "",
      tax_id: "",
      address: "",
      contact_person: "",
    },
  });
  const createMutation = useMutation(
    trpc.company.create.mutationOptions({
      onSuccess: () => {
        toast.success("Company created — pending admin approval");
        router.refresh();
        router.push("/home");
      },
      onError: (err) => {
        toast.error(
          err instanceof Error ? err.message : "Could not create company",
        );
      },
    }),
  );

  const busyCreate =
    createMutation.isPending || createForm.formState.isSubmitting;

  function onCreate(values: CreateCompanyValues) {
    createMutation.mutate({
      name: values.name,
      tax_id: values.tax_id || null,
      address: values.address || null,
      contact_person: values.contact_person || null,
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
              <FieldLabel htmlFor="name">Company name</FieldLabel>
              <Input
                {...field}
                id="name"
                aria-invalid={fieldState.invalid}
                disabled={busyCreate}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="tax_id"
          control={createForm.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid ? true : undefined}>
              <FieldLabel htmlFor="tax_id">Tax ID (optional)</FieldLabel>
              <Input
                {...field}
                id="tax_id"
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
              <FieldLabel htmlFor="address">Address (optional)</FieldLabel>
              <Textarea
                {...field}
                id="address"
                aria-invalid={fieldState.invalid}
                disabled={busyCreate}
                rows={2}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="contact_person"
          control={createForm.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid ? true : undefined}>
              <FieldLabel htmlFor="contact_person">
                Contact person (optional)
              </FieldLabel>
              <Input
                {...field}
                id="contact_person"
                aria-invalid={fieldState.invalid}
                disabled={busyCreate}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>
      <Button type="submit" className="w-full" disabled={busyCreate}>
        {busyCreate ? "Creating…" : "Create company"}
      </Button>
    </form>
  );
};
