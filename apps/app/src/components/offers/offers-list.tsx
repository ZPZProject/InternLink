"use client";

import { Avatar, AvatarFallback } from "@v1/ui/avatar";
import { Card, CardContent } from "@v1/ui/card";
import { Calendar, MapPin } from "lucide-react";
import Link from "next/link";
import { htmlToPlainText } from "@/lib/html-text";
import { useI18n } from "@/locales/client";

type Company = { id: string; name: string } | null;

type OfferListItem = {
  id: string;
  title: string;
  description: string;
  location: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  companies: Company | Company[];
};

function getCompanyName(offer: OfferListItem, fallback: string): string {
  const c = offer.companies;
  if (!c) return fallback;
  if (Array.isArray(c)) return c[0]?.name ?? fallback;
  return c.name;
}

function companyInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export function OffersList({ items }: { items: OfferListItem[] }) {
  const t = useI18n();

  if (items.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">{t("offersList.empty")}</p>
    );
  }

  return (
    <ul className="space-y-3">
      {items.map((offer) => {
        const fallback = t("offersList.fallbackCompany");
        const name = getCompanyName(offer, fallback);
        const description = htmlToPlainText(offer.description);

        return (
          <li key={offer.id}>
            <Link href={`/offers/${offer.id}`} className="block">
              <Card className="transition-colors hover:bg-muted/40">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <Avatar className="size-10 shrink-0 rounded-lg">
                      <AvatarFallback className="rounded-lg text-xs font-medium">
                        {companyInitials(name)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div>
                        <p className="font-medium text-sm leading-snug">
                          {offer.title}
                        </p>
                        <p className="text-muted-foreground text-xs mt-0.5">
                          {name}
                        </p>
                      </div>

                      {description && (
                        <p className="text-muted-foreground text-xs line-clamp-2 leading-relaxed">
                          {description}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-0.5">
                        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                          <MapPin className="size-3" />
                          {offer.location}
                        </span>
                        {(offer.start_date || offer.end_date) && (
                          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Calendar className="size-3" />
                            {offer.start_date} → {offer.end_date}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
