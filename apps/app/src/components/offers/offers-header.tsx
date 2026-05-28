"use client";

import { Button } from "@v1/ui/button";
import { Icons } from "@v1/ui/icons";
import Link from "next/link";
import { useI18n } from "@/locales/client";

export function OffersHeader({
  total,
  isEmployer,
}: {
  total?: number;
  isEmployer?: boolean;
}) {
  const t = useI18n();

  if (isEmployer) {
    return (
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {t("employerOffersHeader.title")}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {t("employerOffersHeader.subtitle", { total: total ?? 0 })}
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

  const offerTotal = total ?? 0;

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">
        {t("offersPublicHeader.title")}
      </h1>
      <p className="text-muted-foreground mt-1 text-sm">
        {offerTotal > 0
          ? t("offersPublicHeader.subtitleWithOffers", { total: offerTotal })
          : t("offersPublicHeader.subtitleEmpty")}
      </p>
    </div>
  );
}
