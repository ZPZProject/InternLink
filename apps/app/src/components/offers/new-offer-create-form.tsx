"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { OfferForm } from "@/components/offers/offer-form";
import { useTRPC } from "@/trpc/react";

export function NewOfferCreateForm() {
  const trpc = useTRPC();
  const router = useRouter();
  const { data: membership } = useSuspenseQuery(
    trpc.company.myMembership.queryOptions(),
  );

  const allowed = membership?.company.approval_status === "approved";

  useEffect(() => {
    if (!allowed) {
      router.replace("/employer/offers");
    }
  }, [allowed, router]);

  if (!allowed) {
    return <p className="text-muted-foreground text-sm">Redirecting…</p>;
  }

  return <OfferForm mode="create" />;
}
