"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@v1/ui/combobox";
import { useEffect, useMemo, useState } from "react";
import { useI18n } from "@/locales/client";
import { useTRPC } from "@/trpc/react";

export function CityLocationCombobox({
  id,
  value,
  onChange,
  disabled,
  placeholder,
  "aria-invalid": ariaInvalid,
}: {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  "aria-invalid"?: boolean;
}) {
  const t = useI18n();
  const trpc = useTRPC();
  const [search, setSearch] = useState(value);
  const [debounced, setDebounced] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(search.trim()), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setSearch(value);
  }, [value]);

  const listQuery = useQuery(
    trpc.geocoding.searchPoland.queryOptions(
      { query: debounced, limit: 12 },
      {
        enabled: debounced.length >= 2,
      },
    ),
  );

  const items = useMemo(() => {
    const remote =
      listQuery.data?.map((row) => ({
        value: row.id,
        label: row.label,
      })) ?? [];
    const trimmed = value.trim();
    if (trimmed && !remote.some((i) => i.label === trimmed)) {
      return [{ value: "__manual", label: trimmed }, ...remote];
    }
    return remote;
  }, [listQuery.data, value]);

  const selectedItem = !value.trim()
    ? null
    : (items.find((i) => i.label === value) ?? null);

  const emptyMessage = () => {
    if (debounced.length < 2) return t("cityCombobox.typeToSearch");
    if (listQuery.isError) return t("cityCombobox.loadError");
    if (listQuery.isPending) return t("cityCombobox.loading");
    return t("cityCombobox.noResults");
  };

  return (
    <Combobox
      items={items}
      value={selectedItem}
      onValueChange={(item) => {
        if (item) {
          onChange(item.label);
          setSearch(item.label);
        } else {
          onChange("");
          setSearch("");
        }
      }}
    >
      <ComboboxInput
        id={id}
        value={search}
        onChange={(e) => {
          const v = e.target.value;
          setSearch(v);
          onChange(v);
        }}
        placeholder={placeholder ?? t("cityCombobox.defaultPlaceholder")}
        disabled={disabled}
        aria-invalid={ariaInvalid}
      />
      <ComboboxContent>
        <ComboboxEmpty>{emptyMessage()}</ComboboxEmpty>
        <ComboboxList>
          {(item) => (
            <ComboboxItem key={item.value} value={item}>
              {item.label}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
