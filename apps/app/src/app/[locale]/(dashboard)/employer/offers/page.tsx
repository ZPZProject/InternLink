import { EmployerOffersHeader } from "@/components/offers/employer-offers-header";
import { OffersStats } from "@/components/offers/offers-stats";
import { EmployerOffersList } from "@/components/offers/employer-offers-list";
import { EmployerOffersMembershipHints } from "@/components/offers/employer-offers-membership-hints";
import { EMPLOYER_OFFERS_LIST_QUERY } from "@/components/offers/employer-offers-query";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";

export default function EmployerOffersPage() {
  prefetch(trpc.company.myMembership.queryOptions());
  prefetch(trpc.offers.listMine.queryOptions(EMPLOYER_OFFERS_LIST_QUERY));
  prefetch(trpc.offers.getStats.queryOptions());

  return (
    <HydrateClient>
      <div className="space-y-6">
        <EmployerOffersHeader />
        <OffersStats isEmployer />
        <EmployerOffersMembershipHints />
        <EmployerOffersList />
      </div>
    </HydrateClient>
  );
}
