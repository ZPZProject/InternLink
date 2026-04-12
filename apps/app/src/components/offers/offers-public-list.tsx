"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { OffersList } from "@/components/offers/offers-list";
import { offersPublicListInput } from "@/components/offers/offers-public-list-query";
import { useTRPC } from "@/trpc/react";

export function OffersPublicList({
  search,
  location,
}: {
  search?: string;
  location?: string;
}) {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(
    trpc.offers.list.queryOptions(offersPublicListInput(search, location)),
  );

  return <OffersList items={data.items} />;
}
