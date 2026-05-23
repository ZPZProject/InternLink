"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { Button } from "@v1/ui/button";
import { Icons } from "@v1/ui/icons";
import Link from "next/link";
import { useTRPC } from "@/trpc/react";

export function EmployerOffersHeader() {
  const trpc = useTRPC();
  const { data: stats } = useSuspenseQuery(trpc.offers.getStats.queryOptions());

  const total = stats?.stats?.totalOffers ?? 0;

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
