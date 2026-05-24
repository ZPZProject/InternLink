"use client";

import { Button } from "@v1/ui/button";
import { Icons } from "@v1/ui/icons";
import Link from "next/link";

export function OffersHeader({
  total,
  isEmployer,
}: {
  total?: number;
  isEmployer?: boolean;
}) {
  if (isEmployer) {
    return (
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">My offers</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage internship listings for your company. You have {total} offer{total !== 1 ? "s" : ""}.
          </p>
        </div>

        <Button asChild>
          <Link href="/employer/offers/new">
            <Icons.Plus className="mr-2 h-4 w-4" />
            New offer
          </Link>
        </Button>
      </div>
    );
  }

  const offerTotal = total ?? 0;

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">
        Internship offers
      </h1>
      <p className="text-muted-foreground mt-1 text-sm">
        {offerTotal > 0
          ? `Browse ${offerTotal} active offer${offerTotal !== 1 ? "s" : ""} from companies.`
          : "No active offers available at the moment."}
      </p>
    </div>
  );
}
