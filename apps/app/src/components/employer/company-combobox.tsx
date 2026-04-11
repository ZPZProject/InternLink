"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@v1/ui/combobox";
import { useState } from "react";
import { useTRPC } from "@/trpc/react";

export function CompanyCombobox({
  value,
  onChange,
}: {
  value?: string;
  onChange?: (value?: string) => void;
}) {
  const trpc = useTRPC();
  const [search, setSearch] = useState("");

  const listQuery = useQuery(
    trpc.company.list.queryOptions(
      {
        query: search.trim() || undefined,
        limit: 40,
      },
      {
        placeholderData: keepPreviousData,
      },
    ),
  );

  const items =
    listQuery.data?.map((company) => ({
      value: company.id,
      label: company.name,
    })) ?? [];

  const selectedItem = items.find((item) => item.value === value) ?? null;

  const getEmptyMessage = () => {
    if (listQuery.isError) {
      return "Could not load companies.";
    }
    if (listQuery.isPending) {
      return "Loading…";
    }
    return "No companies found.";
  };

  return (
    <Combobox
      items={items}
      value={selectedItem}
      onValueChange={(item) => {
        if (item) {
          onChange?.(item.value);
          setSearch(item.label);
        } else {
          onChange?.(undefined);
          setSearch("");
        }
      }}
    >
      <ComboboxInput
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Select a company"
      />
      <ComboboxContent>
        <ComboboxEmpty>{getEmptyMessage()}</ComboboxEmpty>
        <ComboboxList>
          {(item) => (
            <ComboboxItem key={item} value={item}>
              {item.label}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
