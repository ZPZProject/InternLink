"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { Button } from "@v1/ui/button";
import Link from "next/link";

import { useTRPC } from "@/trpc/react";

export function EmployerOffersHeader() {
  const trpc = useTRPC();
  const { data: membership } = useSuspenseQuery(
    trpc.company.myMembership.queryOptions(),
  );

  const approved = membership?.company.approval_status === "approved";

  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">My offers</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Manage internship listings for your company.
        </p>
      </div>
      {approved ? (
        <Button asChild>
          <Link href="/employer/offers/new">New offer</Link>
        </Button>
      ) : (
        <Button type="button" disabled>
          New offer
        </Button>
      )}
    </div>
  );
}
