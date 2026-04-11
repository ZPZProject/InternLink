import { EmployerOffersHeader } from "@/components/offers/employer-offers-header";
import { EmployerOffersList } from "@/components/offers/employer-offers-list";
import { EmployerOffersMembershipHints } from "@/components/offers/employer-offers-membership-hints";
import { EMPLOYER_OFFERS_LIST_QUERY } from "@/components/offers/employer-offers-query";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";

export default async function EmployerOffersPage() {
  await prefetch(trpc.company.myMembership.queryOptions());
  await prefetch(trpc.offers.listMine.queryOptions(EMPLOYER_OFFERS_LIST_QUERY));

  return (
    <HydrateClient>
      <div className="space-y-6">
        <EmployerOffersHeader />
        <EmployerOffersMembershipHints />
        <EmployerOffersList />
      </div>
    </HydrateClient>
  );
}
