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
import { useI18n } from "@/locales/client";
import { useTRPC } from "@/trpc/react";

export function SchoolCombobox({
  value,
  onChange,
}: {
  value?: string;
  onChange?: (value?: string) => void;
}) {
  const t = useI18n();
  const trpc = useTRPC();
  const [search, setSearch] = useState("");

  const listQuery = useQuery(
    trpc.school.list.queryOptions(
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
    listQuery.data?.map((school) => ({
      value: school.id,
      label: school.name,
    })) ?? [];

  const selectedItem = items.find((item) => item.value === value) ?? null;

  const getEmptyMessage = () => {
    if (listQuery.isError) return t("schoolCombobox.loadError");
    if (listQuery.isPending) return t("schoolCombobox.loading");
    return t("schoolCombobox.noResults");
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
        placeholder={t("schoolCombobox.placeholder")}
      />
      <ComboboxContent>
        <ComboboxEmpty>{getEmptyMessage()}</ComboboxEmpty>
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
