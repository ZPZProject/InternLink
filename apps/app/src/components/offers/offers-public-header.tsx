"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { useI18n } from "@/locales/client";
import { offersPublicListInput } from "@/components/offers/offers-public-list-query";
import { useTRPC } from "@/trpc/react";

export function OffersPublicHeader({
  search,
  location,
}: {
  search?: string;
  location?: string;
}) {
  const t = useI18n();
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(
    trpc.offers.list.queryOptions(offersPublicListInput(search, location)),
  );

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">
        {t("offersPublicHeader.title")}
      </h1>
      <p className="text-muted-foreground mt-1 text-sm">
        {data.total > 0
          ? t("offersPublicHeader.subtitleWithOffers", { total: data.total })
          : t("offersPublicHeader.subtitleEmpty")}
      </p>
    </div>
  );
}
