"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { Button } from "@v1/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@v1/ui/empty";
import { Briefcase } from "lucide-react";
import Link from "next/link";
import { useI18n } from "@/locales/client";

import { EmployerOfferCard } from "@/components/offers/employer-offer-card";
import { EMPLOYER_OFFERS_LIST_QUERY } from "@/components/offers/employer-offers-query";
import { useTRPC } from "@/trpc/react";

export function EmployerOffersList() {
  const t = useI18n();
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(
    trpc.offers.listMine.queryOptions(EMPLOYER_OFFERS_LIST_QUERY),
  );

  const { items } = data;

  if (items.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Briefcase className="size-5" />
          </EmptyMedia>
          <EmptyTitle>{t("employerOffersList.emptyTitle")}</EmptyTitle>
          <EmptyDescription>
            {t("employerOffersList.emptyDescription")}
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button asChild>
            <Link href="/employer/offers/new">
              {t("employerOffersList.createOfferBtn")}
            </Link>
          </Button>
        </EmptyContent>
      </Empty>
    );
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
