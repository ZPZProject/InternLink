"use client";

import type { RouterOutputs } from "@v1/api";
import { Badge } from "@v1/ui/badge";
import { Button } from "@v1/ui/button";
import { Card, CardContent, CardDescription, CardTitle } from "@v1/ui/card";
import { Icons } from "@v1/ui/icons";
import Link from "next/link";
import { EmployerOfferActiveToggle } from "@/components/offers/employer-offer-actions";
import { htmlToPlainText } from "@/lib/html-text";

type Offer = RouterOutputs["offers"]["listMine"]["items"][number];

export function EmployerOfferCard({ offer }: { offer: Offer }) {
  return (
    <Card>
      <CardContent className="space-y-4">
        <div className="flex gap-4 justify-between items-start w-full flex-1">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle className="text-base">{offer.title}</CardTitle>
              <Badge variant={offer.is_active ? "default" : "secondary"}>
                {offer.is_active ? "Active" : "Inactive"}
              </Badge>
            </div>

            <p className="text-muted-foreground text-xs inline-flex gap-1 items-center">
              <Icons.Location className="size-4" />
              {offer.location}
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href={`/employer/offers/${offer.id}/edit`}>Edit</Link>
            </Button>
            <EmployerOfferActiveToggle
              offerId={offer.id}
              isActive={offer.is_active}
            />
          </div>
        </div>

        <CardDescription className="line-clamp-2">
          {htmlToPlainText(offer.description) || "—"}
        </CardDescription>
      </CardContent>
    </Card>
  );
}
