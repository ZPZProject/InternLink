import { Button } from "@v1/ui/button";
import Link from "next/link";
import { OfferForm } from "@/components/offers/offer-form";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";

export default function NewOfferPage() {
  prefetch(trpc.company.myMembership.queryOptions());

  return (
    <HydrateClient>
      <div className="mx-auto max-w-3xl space-y-6">
        <Button variant="link" asChild>
          <Link href="/employer/offers">← Back to my offers</Link>
        </Button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">New offer</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            This listing will be visible to students when marked active.
          </p>
        </div>
        <OfferForm mode="create" />
      </div>
    </HydrateClient>
  );
}
