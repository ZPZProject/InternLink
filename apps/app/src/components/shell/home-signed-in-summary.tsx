"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import Link from "next/link";

import { RoleBadge } from "@/components/role-badge";
import { useTRPC } from "@/trpc/react";

export function HomeSignedInSummary() {
  const trpc = useTRPC();
  const { data: profile } = useSuspenseQuery(trpc.profile.me.queryOptions());

  return (
    <>
      <p className="text-muted-foreground text-sm">
        You are signed in as{" "}
        <span className="text-foreground font-medium">
          {profile.email ?? profile.id}
        </span>
        .
      </p>
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground text-sm">Role:</span>
        <RoleBadge role={profile.role} />
      </div>
      <p className="text-sm">
        <Link className="text-primary underline" href="/offers">
          Browse internship offers
        </Link>
      </p>
    </>
  );
}
