"use client";

import { useSuspenseQuery } from "@tanstack/react-query";

import { offersPublicListInput } from "@/components/offers/offers-public-list-query";
import { useTRPC } from "@/trpc/react";

export function OffersPublicHeader({
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

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">
        Internship offers
      </h1>
      <p className="text-muted-foreground mt-1 text-sm">
        Active listings from approved companies ({data.total} total).
      </p>
    </div>
  );
}
