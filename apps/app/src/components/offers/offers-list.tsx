import { Badge } from "@v1/ui/badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@v1/ui/card";
import Link from "next/link";

import { htmlToPlainText } from "@/lib/html-text";

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

function companyName(offer: OfferListItem): string {
  const c = offer.companies;
  if (!c) return "Company";
  if (Array.isArray(c)) return c[0]?.name ?? "Company";
  return c.name;
}

export function OffersList({ items }: { items: OfferListItem[] }) {
  if (items.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        No offers match your filters yet.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {items.map((offer) => (
        <li key={offer.id}>
          <Link href={`/offers/${offer.id}`} className="block">
            <Card className="transition-colors hover:bg-muted/40">
              <CardHeader className="gap-1">
                <div className="flex flex-wrap items-center gap-2">
                  <CardTitle className="text-base">{offer.title}</CardTitle>
                  <Badge variant="secondary">{companyName(offer)}</Badge>
                </div>
                <CardDescription className="line-clamp-2">
                  {htmlToPlainText(offer.description) || "No description"}
                </CardDescription>
                <p className="text-muted-foreground text-xs">
                  {offer.location} · {offer.start_date} → {offer.end_date}
                </p>
              </CardHeader>
            </Card>
          </Link>
        </li>
      ))}
    </ul>
  );
}
