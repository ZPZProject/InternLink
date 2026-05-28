"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { Button } from "@v1/ui/button";
import { Icons } from "@v1/ui/icons";
import Link from "next/link";
import { useI18n } from "@/locales/client";
import { useTRPC } from "@/trpc/react";

export function EmployerOffersHeader() {
  const t = useI18n();
  const trpc = useTRPC();
  const { data: stats } = useSuspenseQuery(trpc.offers.getStats.queryOptions());

  const total = stats?.stats?.totalOffers ?? 0;

  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {t("employerOffersHeader.title")}
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {t("employerOffersHeader.subtitle", { total })}
        </p>
      </div>

      <Button asChild>
        <Link href="/employer/offers/new">
          <Icons.Plus className="mr-2 h-4 w-4" />
          {t("employerOffersHeader.newOfferBtn")}
        </Link>
      </Button>
    </div>
  );
}
