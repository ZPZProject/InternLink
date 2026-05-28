"use client";

import { Button } from "@v1/ui/button";
import { Icons } from "@v1/ui/icons";
import Link from "next/link";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useI18n } from "@/locales/client";
import { useTRPC } from "@/trpc/react";

export function QuickActions() {
  const t = useI18n();
  const trpc = useTRPC();
  const { data: homeStats } = useSuspenseQuery(
    trpc.profile.homeStats.queryOptions(),
  );

  if (homeStats.role === "student") {
    return (
      <div className="flex flex-wrap gap-3">
        <Button asChild>
          <Link href="/offers">
            <Icons.Briefcase className="mr-2 h-4 w-4" />
            {t("quickActions.student.browseOffers")}
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/student/applications">
            <Icons.FileText className="mr-2 h-4 w-4" />
            {t("quickActions.student.myApplications")}
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
            {t("quickActions.employer.postOffer")}
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/employer/offers">
            <Icons.Briefcase className="mr-2 h-4 w-4" />
            {t("quickActions.employer.myOffers")}
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
            {homeStats.hasSchool
              ? t("quickActions.supervisor.manageSchool")
              : t("quickActions.supervisor.registerSchool")}
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/offers">
            <Icons.Briefcase className="mr-2 h-4 w-4" />
            {t("quickActions.supervisor.browseOffers")}
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
            {t("quickActions.admin.manageUsers")}
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/offers">
            <Icons.Briefcase className="mr-2 h-4 w-4" />
            {t("quickActions.admin.browseOffers")}
          </Link>
        </Button>
      </div>
    );
  }

  return null;
}
