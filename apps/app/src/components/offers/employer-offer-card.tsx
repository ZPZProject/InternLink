"use client";

import type { RouterOutputs } from "@v1/api";
import { Badge } from "@v1/ui/badge";
import { Button } from "@v1/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@v1/ui/card";
import Link from "next/link";

import { EmployerOfferActiveToggle } from "@/components/offers/employer-offer-actions";

type Offer = RouterOutputs["offers"]["listMine"]["items"][number];

export function EmployerOfferCard({ offer }: { offer: Offer }) {
  return (
    <Card>
      <CardHeader className="gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle className="text-base">{offer.title}</CardTitle>
            <Badge variant={offer.is_active ? "default" : "secondary"}>
              {offer.is_active ? "Active" : "Inactive"}
            </Badge>
          </div>
          <CardDescription className="line-clamp-2">
            {offer.description || "—"}
          </CardDescription>
          <p className="text-muted-foreground text-xs">{offer.location}</p>
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
      </CardHeader>
    </Card>
  );
}
