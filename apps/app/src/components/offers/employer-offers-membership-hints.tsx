"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import Link from "next/link";

import { useTRPC } from "@/trpc/react";

export function EmployerOffersMembershipHints() {
  const trpc = useTRPC();
  const { data: membership } = useSuspenseQuery(
    trpc.company.myMembership.queryOptions(),
  );

  if (membership) {
    return null;
  }

  return (
    <p className="text-muted-foreground text-sm">
      Complete{" "}
      <Link className="text-primary underline" href="/employer/onboarding">
        company onboarding
      </Link>{" "}
      first.
    </p>
  );
}
