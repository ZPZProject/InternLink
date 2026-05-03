import { use } from "react";
import { OffersFilters } from "@/components/offers/offers-filters";
import { OffersHeader } from "@/components/offers/offers-header";
import { OffersStats } from "@/components/offers/offers-stats";
import { OffersPublicList } from "@/components/offers/offers-public-list";
import { offersPublicListInput } from "@/components/offers/offers-public-list-query";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";

type SearchParams = Promise<{ q?: string; location?: string }>;

export default function OffersPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = use(searchParams);
  prefetch(
    trpc.offers.list.queryOptions(offersPublicListInput(sp.q, sp.location)),
  );
  prefetch(trpc.offers.getStats.queryOptions());

  return (
    <HydrateClient>
      <div className="space-y-6">
        <OffersHeader />
        <OffersStats />
        <OffersFilters />
        <OffersPublicList search={sp.q} location={sp.location} />
      </div>
    </HydrateClient>
  );
}
