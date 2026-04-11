"use client";

import { Field, FieldLabel } from "@v1/ui/field";
import { Input } from "@v1/ui/input";
import { debounce, parseAsString, useQueryStates } from "nuqs";
import { useId, useTransition } from "react";

const offersFiltersParsers = {
  q: parseAsString.withDefault(""),
  location: parseAsString.withDefault(""),
};

export function OffersFilters() {
  const uid = useId();
  const [pending, startTransition] = useTransition();
  const [{ q, location }, setParams] = useQueryStates(offersFiltersParsers, {
    history: "push",
    shallow: false,
    startTransition,
  });

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
      <Field className="min-w-[200px] flex-1">
        <FieldLabel htmlFor={`${uid}-q`}>Search</FieldLabel>
        <Input
          id={`${uid}-q`}
          value={q}
          placeholder="Title or description"
          disabled={pending}
          onChange={(e) => {
            const v = e.target.value;
            void setParams(
              { q: v === "" ? null : v },
              {
                limitUrlUpdates: v === "" ? undefined : debounce(350),
              },
            );
          }}
        />
      </Field>
      <Field className="min-w-[160px] flex-1">
        <FieldLabel htmlFor={`${uid}-loc`}>Location</FieldLabel>
        <Input
          id={`${uid}-loc`}
          value={location}
          placeholder="City or remote"
          disabled={pending}
          onChange={(e) => {
            const v = e.target.value;
            void setParams(
              { location: v === "" ? null : v },
              {
                limitUrlUpdates: v === "" ? undefined : debounce(350),
              },
            );
          }}
        />
      </Field>
    </div>
  );
}
