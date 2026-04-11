"use client";

import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@v1/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@v1/ui/field";
import { Input } from "@v1/ui/input";
import { toast } from "@v1/ui/sonner";
import { Textarea } from "@v1/ui/textarea";
import { useRouter } from "next/navigation";
import { useId, useMemo, useState } from "react";
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

export function EmployerOnboardingForm() {
  const formId = useId();
  const router = useRouter();
  const trpc = useTRPC();
  const [mode, setMode] = useState<"join" | "create">("join");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const listQuery = useQuery(
    trpc.company.listApproved.queryOptions({
      query: search.trim() || undefined,
      limit: 40,
    }),
  );

  const createForm = useForm<CreateCompanyValues>({
    resolver: standardSchemaResolver(createCompanySchema),
    defaultValues: {
      name: "",
      tax_id: "",
      address: "",
      contact_person: "",
    },
  });

  const joinMutation = useMutation(
    trpc.company.join.mutationOptions({
      onSuccess: () => {
        toast.success("Joined company");
        router.refresh();
        router.push("/home");
      },
      onError: (err) => {
        toast.error(
          err instanceof Error ? err.message : "Could not join company",
        );
      },
    }),
  );

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

  const busyJoin = joinMutation.isPending;
  const busyCreate =
    createMutation.isPending || createForm.formState.isSubmitting;

  const companies = listQuery.data ?? [];

  const selectedCompany = useMemo(
    () => companies.find((c) => c.id === selectedId) ?? null,
    [companies, selectedId],
  );

  function onJoin() {
    if (!selectedId) {
      toast.error("Select a company");
      return;
    }
    joinMutation.mutate({ company_id: selectedId });
  }

  function onCreate(values: CreateCompanyValues) {
    createMutation.mutate({
      name: values.name,
      tax_id: values.tax_id || null,
      address: values.address || null,
      contact_person: values.contact_person || null,
    });
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Company setup</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Join an approved company or register a new one. New companies require
          administrator approval before you can post internship offers.
        </p>
      </div>

      <div className="flex gap-2">
        <Button
          type="button"
          variant={mode === "join" ? "default" : "outline"}
          size="sm"
          onClick={() => setMode("join")}
        >
          Join existing
        </Button>
        <Button
          type="button"
          variant={mode === "create" ? "default" : "outline"}
          size="sm"
          onClick={() => setMode("create")}
        >
          Create new
        </Button>
      </div>

      {mode === "join" ? (
        <div className="space-y-4">
          <Field>
            <FieldLabel htmlFor={`${formId}-search`}>
              Search companies
            </FieldLabel>
            <Input
              id={`${formId}-search`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Type to filter by name"
              disabled={busyJoin}
            />
          </Field>

          <div className="border-border max-h-56 space-y-1 overflow-y-auto rounded-lg border p-2">
            {listQuery.isLoading ? (
              <p className="text-muted-foreground text-sm">Loading…</p>
            ) : companies.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No approved companies match your search.
              </p>
            ) : (
              companies.map((c) => (
                <label
                  key={c.id}
                  className="hover:bg-muted/60 flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm"
                >
                  <input
                    type="radio"
                    name="company"
                    checked={selectedId === c.id}
                    onChange={() => setSelectedId(c.id)}
                    disabled={busyJoin}
                  />
                  <span>{c.name}</span>
                </label>
              ))
            )}
          </div>

          {selectedCompany ? (
            <p className="text-muted-foreground text-xs">
              You will join{" "}
              <span className="text-foreground">{selectedCompany.name}</span>.
            </p>
          ) : null}

          <Button
            type="button"
            className="w-full"
            disabled={busyJoin || !selectedId}
            onClick={onJoin}
          >
            {busyJoin ? "Joining…" : "Join company"}
          </Button>
        </div>
      ) : (
        <form
          className="space-y-4"
          onSubmit={createForm.handleSubmit(onCreate)}
          id={`${formId}-create`}
        >
          <FieldGroup>
            <Controller
              name="name"
              control={createForm.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid ? true : undefined}>
                  <FieldLabel htmlFor={`${formId}-name`}>
                    Company name
                  </FieldLabel>
                  <Input
                    {...field}
                    id={`${formId}-name`}
                    aria-invalid={fieldState.invalid}
                    disabled={busyCreate}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="tax_id"
              control={createForm.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid ? true : undefined}>
                  <FieldLabel htmlFor={`${formId}-tax`}>
                    Tax ID (optional)
                  </FieldLabel>
                  <Input
                    {...field}
                    id={`${formId}-tax`}
                    aria-invalid={fieldState.invalid}
                    disabled={busyCreate}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="address"
              control={createForm.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid ? true : undefined}>
                  <FieldLabel htmlFor={`${formId}-addr`}>
                    Address (optional)
                  </FieldLabel>
                  <Textarea
                    {...field}
                    id={`${formId}-addr`}
                    aria-invalid={fieldState.invalid}
                    disabled={busyCreate}
                    rows={2}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="contact_person"
              control={createForm.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid ? true : undefined}>
                  <FieldLabel htmlFor={`${formId}-contact`}>
                    Contact person (optional)
                  </FieldLabel>
                  <Input
                    {...field}
                    id={`${formId}-contact`}
                    aria-invalid={fieldState.invalid}
                    disabled={busyCreate}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>
          <Button type="submit" className="w-full" disabled={busyCreate}>
            {busyCreate ? "Creating…" : "Create company"}
          </Button>
        </form>
      )}
    </div>
  );
}
