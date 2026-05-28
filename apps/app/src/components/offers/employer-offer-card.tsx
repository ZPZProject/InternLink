"use client";

import type { RouterOutputs } from "@v1/api";
import { Badge } from "@v1/ui/badge";
import { Button } from "@v1/ui/button";
import { Card, CardContent } from "@v1/ui/card";
import { Calendar, MapPin, Users } from "lucide-react";
import Link from "next/link";
import { useI18n } from "@/locales/client";
import { EmployerOfferActiveToggle } from "@/components/offers/employer-offer-actions";
import { htmlToPlainText } from "@/lib/html-text";

type Offer = RouterOutputs["offers"]["listMine"]["items"][number];

export function EmployerOfferCard({ offer }: { offer: Offer }) {
  const t = useI18n();
  const description = htmlToPlainText(offer.description);

  return (
    <Card className="transition-colors hover:bg-muted/20">
      <CardContent className="p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex-1 min-w-0 space-y-3">
            {/* Title + status */}
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-semibold text-sm leading-snug">{offer.title}</h3>
              <Badge
                variant={offer.is_active ? "default" : "secondary"}
                className="text-xs"
              >
                {offer.is_active
                  ? t("employerOfferCard.badgeActive")
                  : t("employerOfferCard.badgeInactive")}
              </Badge>
            </div>

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <MapPin className="size-3.5" />
                {offer.location}
              </span>
              {(offer.start_date || offer.end_date) && (
                <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Calendar className="size-3.5" />
                  {offer.start_date ?? "?"} → {offer.end_date ?? "?"}
                </span>
              )}
            </div>

            {/* Description */}
            {description && (
              <p className="text-muted-foreground text-xs line-clamp-2 leading-relaxed">
                {description}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-2 sm:flex-col sm:items-end sm:shrink-0">
            <Button asChild variant="outline" size="sm">
              <Link
                href={`/employer/offers/${offer.id}/applications`}
                className="inline-flex items-center gap-1.5"
              >
                <Users className="size-3.5" />
                {t("employerOfferCard.applicationsBtn")}
              </Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link href={`/employer/offers/${offer.id}/edit`}>
                {t("employerOfferCard.editBtn")}
              </Link>
            </Button>
            <EmployerOfferActiveToggle
              offerId={offer.id}
              isActive={offer.is_active}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
