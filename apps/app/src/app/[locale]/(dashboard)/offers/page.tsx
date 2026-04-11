import { OffersFilters } from "@/components/offers/offers-filters";
import { OffersPublicHeader } from "@/components/offers/offers-public-header";
import { OffersPublicList } from "@/components/offers/offers-public-list";
import { offersPublicListInput } from "@/components/offers/offers-public-list-query";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";

type SearchParams = Promise<{ q?: string; location?: string }>;

export default async function OffersPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  await prefetch(
    trpc.offers.list.queryOptions(offersPublicListInput(sp.q, sp.location)),
  );

  return (
    <HydrateClient>
      <div className="space-y-6">
        <OffersPublicHeader search={sp.q} location={sp.location} />
        <OffersFilters />
        <OffersPublicList search={sp.q} location={sp.location} />
      </div>
    </HydrateClient>
  );
}
