"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useI18n } from "@/locales/client";
import { useTRPC } from "@/trpc/react";

export function EmployerOffersMembershipHints() {
  const t = useI18n();
  const trpc = useTRPC();
  const { data: membership } = useSuspenseQuery(
    trpc.company.myMembership.queryOptions(),
  );

  if (membership) {
    return null;
  }

  return (
    <p className="text-muted-foreground text-sm">
      {t("membershipHints.incomplete", {
        link: (
          <Link
            key="link"
            className="text-primary underline"
            href="/employer/onboarding"
          >
            {t("membershipHints.link")}
          </Link>
        ),
      })}
    </p>
  );
}
