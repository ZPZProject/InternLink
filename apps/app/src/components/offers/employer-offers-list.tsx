"use client";

import { useSuspenseQuery } from "@tanstack/react-query";

import { EmployerOfferCard } from "@/components/offers/employer-offer-card";
import { EMPLOYER_OFFERS_LIST_QUERY } from "@/components/offers/employer-offers-query";
import { useTRPC } from "@/trpc/react";

export function EmployerOffersList() {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(
    trpc.offers.listMine.queryOptions(EMPLOYER_OFFERS_LIST_QUERY),
  );

  const { items } = data;

  if (items.length === 0) {
    return <p className="text-muted-foreground text-sm">No offers yet.</p>;
  }

  return (
    <ul className="space-y-3">
      {items.map((offer) => (
        <li key={offer.id}>
          <EmployerOfferCard offer={offer} />
        </li>
      ))}
    </ul>
  );
}
