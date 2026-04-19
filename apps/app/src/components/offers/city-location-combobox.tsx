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
import { useTRPC } from "@/trpc/react";

export function CityLocationCombobox({
  id,
  value,
  onChange,
  disabled,
  placeholder = "Search city or town in Poland",
  "aria-invalid": ariaInvalid,
}: {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  "aria-invalid"?: boolean;
}) {
  const trpc = useTRPC();
  const [search, setSearch] = useState(value);
  const [debounced, setDebounced] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search.trim()), 300);
    return () => clearTimeout(t);
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
    if (debounced.length < 2) {
      return "Type at least 2 characters to search.";
    }
    if (listQuery.isError) {
      return "Could not load suggestions.";
    }
    if (listQuery.isPending) {
      return "Loading…";
    }
    return "No matching places in Poland.";
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
        placeholder={placeholder}
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
