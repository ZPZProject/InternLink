import { getI18n } from "@/locales/server";
import { Button } from "@v1/ui/button";
import Link from "next/link";
import { OfferForm } from "@/components/offers/offer-form";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";

export default async function NewOfferPage() {
  const t = await getI18n();
  prefetch(trpc.company.myMembership.queryOptions());

  return (
    <HydrateClient>
      <div className="mx-auto max-w-3xl space-y-6">
        <Button variant="link" asChild>
          <Link href="/employer/offers">{t("newOffer.backLink")}</Link>
        </Button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {t("newOffer.title")}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {t("newOffer.subtitle")}
          </p>
        </div>
        <OfferForm mode="create" />
      </div>
    </HydrateClient>
  );
}
