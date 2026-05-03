"use client";

import { Button } from "@v1/ui/button";
import { Icons } from "@v1/ui/icons";
import Link from "next/link";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/react";

export function QuickActions() {
  const trpc = useTRPC();
  const { data: homeStats } = useSuspenseQuery(trpc.profile.homeStats.queryOptions());

  if (homeStats.role === "student") {
    return (
      <div className="flex flex-wrap gap-3">
        <Button asChild>
          <Link href="/offers">
            <Icons.Briefcase className="mr-2 h-4 w-4" />
            Browse Offers
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/student/applications">
            <Icons.FileText className="mr-2 h-4 w-4" />
            My Applications
          </Link>
        </Button>
      </div>
    );
  }

  if (homeStats.role === "employer") {
    return (
      <div className="flex flex-wrap gap-3">
        <Button asChild>
          <Link href="/employer/offers/new">
            <Icons.Plus className="mr-2 h-4 w-4" />
            Post New Offer
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/employer/offers">
            <Icons.Briefcase className="mr-2 h-4 w-4" />
            My Offers
          </Link>
        </Button>
      </div>
    );
  }

  if (homeStats.role === "supervisor") {
    return (
      <div className="flex flex-wrap gap-3">
        <Button asChild>
          <Link href="/supervisor/onboarding">
            <Icons.Building className="mr-2 h-4 w-4" />
            {homeStats.hasSchool ? "Manage School" : "Register School"}
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/offers">
            <Icons.Briefcase className="mr-2 h-4 w-4" />
            Browse Offers
          </Link>
        </Button>
      </div>
    );
  }

  if (homeStats.role === "admin") {
    return (
      <div className="flex flex-wrap gap-3">
        <Button asChild>
          <Link href="/users">
            <Icons.User className="mr-2 h-4 w-4" />
            Manage Users
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/offers">
            <Icons.Briefcase className="mr-2 h-4 w-4" />
            Browse Offers
          </Link>
        </Button>
      </div>
    );
  }

  return null;
}
