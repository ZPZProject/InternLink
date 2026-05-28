"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@v1/ui/card";
import { Icons } from "@v1/ui/icons";
import { useI18n } from "@/locales/client";
import { useTRPC } from "@/trpc/react";

export function StatsCards() {
  const t = useI18n();
  const trpc = useTRPC();
  const { data: homeStats } = useSuspenseQuery(
    trpc.profile.homeStats.queryOptions(),
  );

  if (homeStats.role === "student") {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("statsCards.student.totalApplications")}
            </CardTitle>
            <Icons.User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {homeStats.stats.totalApplications}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("statsCards.student.pending")}
            </CardTitle>
            <Icons.Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {homeStats.stats.pendingApplications}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("statsCards.student.accepted")}
            </CardTitle>
            <Icons.Check className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {homeStats.stats.acceptedApplications}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (homeStats.role === "employer") {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("statsCards.employer.totalOffers")}
            </CardTitle>
            <Icons.Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{homeStats.stats.totalOffers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("statsCards.employer.activeOffers")}
            </CardTitle>
            <Icons.Check className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {homeStats.stats.activeOffers}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("statsCards.employer.applications")}
            </CardTitle>
            <Icons.User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {homeStats.stats.totalApplications}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (homeStats.role === "supervisor") {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("statsCards.supervisor.schoolStatus")}
            </CardTitle>
            <Icons.Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {homeStats.hasSchool ? (
              <div className="space-y-1">
                <p className="text-sm font-medium">
                  {(homeStats.school as { name: string })?.name ?? "School"}
                </p>
                <p className="text-xs text-muted-foreground capitalize">
                  {(homeStats.school as { approval_status: string })
                    ?.approval_status ?? "Unknown"}
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                {t("statsCards.supervisor.noSchool")}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (homeStats.role === "admin") {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("statsCards.admin.totalUsers")}
            </CardTitle>
            <Icons.User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{homeStats.stats.totalUsers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("statsCards.admin.pendingCompanies")}
            </CardTitle>
            <Icons.Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {homeStats.stats.pendingCompanies}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("statsCards.admin.pendingSchools")}
            </CardTitle>
            <Icons.Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {homeStats.stats.pendingSchools}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}
