"use client";

import { Field, FieldLabel } from "@v1/ui/field";
import { Input } from "@v1/ui/input";
import { debounce, parseAsString, useQueryStates } from "nuqs";
import { useId } from "react";
import { useI18n } from "@/locales/client";
import { CityLocationCombobox } from "./city-location-combobox";

const offersFiltersParsers = {
  q: parseAsString.withDefault(""),
  location: parseAsString.withDefault(""),
};

export function OffersFilters() {
  const t = useI18n();
  const uid = useId();
  const [{ q, location }, setParams] = useQueryStates(offersFiltersParsers, {
    history: "push",
    shallow: false,
  });

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
      <Field className="min-w-[200px] w-[400px]">
        <FieldLabel htmlFor={`${uid}-q`}>{t("offersFilters.searchLabel")}</FieldLabel>
        <Input
          id={`${uid}-q`}
          value={q}
          placeholder={t("offersFilters.searchPlaceholder")}
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
      <Field className="min-w-[200px] w-[250px]">
        <FieldLabel htmlFor={`${uid}-loc`}>{t("offersFilters.locationLabel")}</FieldLabel>
        <CityLocationCombobox
          id={`${uid}-loc`}
          value={location}
          placeholder={t("offersFilters.locationPlaceholder")}
          onChange={(v) => {
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
