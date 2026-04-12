import { Badge } from "@v1/ui/badge";
import { Button } from "@v1/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@v1/ui/card";
import Link from "next/link";

import { caller } from "@/trpc/server";

type Props = { params: Promise<{ id: string }> };

export default async function OfferDetailPage({ params }: Props) {
  const { id } = await params;

  const offer = await caller.offers.byId({ id });

  return (
    <div className="space-y-6">
      <Button asChild variant="link" size="sm">
        <Link href="/offers">← Back to offers</Link>
      </Button>

      <Card>
        <CardHeader className="gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle className="text-2xl">{offer.title}</CardTitle>
            <Badge variant="secondary">{offer.companies.name}</Badge>
          </div>
          <p className="text-muted-foreground text-sm">
            {offer.location} · {offer.start_date} → {offer.end_date}
          </p>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <section>
            <h2 className="mb-1 font-medium">Description</h2>
            <p className="text-muted-foreground whitespace-pre-wrap">
              {offer.description || "—"}
            </p>
          </section>
          {offer.requirements ? (
            <section>
              <h2 className="mb-1 font-medium">Requirements</h2>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {offer.requirements}
              </p>
            </section>
          ) : null}
          <p className="text-muted-foreground text-xs">
            Positions: {offer.number_of_positions}
            {offer.application_deadline
              ? ` · Apply by ${offer.application_deadline}`
              : null}
          </p>
          <Button type="button" disabled className="w-full sm:w-auto">
            Apply (coming in week 3)
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
