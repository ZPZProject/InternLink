"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { Card } from "@v1/ui/card";
import { useI18n } from "@/locales/client";
import { RoleBadge } from "@/components/role-badge";
import { useTRPC } from "@/trpc/react";

export function WelcomeHeader() {
  const t = useI18n();
  const trpc = useTRPC();
  const { data: profile } = useSuspenseQuery(trpc.profile.me.queryOptions());
  const { data: homeStats } = useSuspenseQuery(
    trpc.profile.homeStats.queryOptions(),
  );

  const displayName = profile.first_name
    ? `${profile.first_name} ${profile.last_name ?? ""}`.trim()
    : profile.email ?? "User";

  const roleMessageKeys = {
    student: "welcomeHeader.roleMessage.student",
    employer: "welcomeHeader.roleMessage.employer",
    supervisor: "welcomeHeader.roleMessage.supervisor",
    admin: "welcomeHeader.roleMessage.admin",
  } as const;

  const messageKey =
    roleMessageKeys[profile.role as keyof typeof roleMessageKeys] ??
    "welcomeHeader.roleMessage.fallback";

  return (
    <Card className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            {t("welcomeHeader.greeting", { name: displayName })}
          </h1>
          <p className="text-muted-foreground text-sm">{t(messageKey)}</p>
        </div>
        <div className="flex items-center gap-2">
          <RoleBadge role={profile.role} />
        </div>
      </div>
      {!homeStats.onboardingComplete && profile.role === "student" && (
        <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/50 rounded-md border border-amber-200 dark:border-amber-800">
          <p className="text-sm text-amber-800 dark:text-amber-200">
            {t("welcomeHeader.studentOnboardingBanner")}{" "}
            <a href="/student/onboarding" className="font-medium underline">
              {t("welcomeHeader.studentOnboardingLink")}
            </a>
          </p>
        </div>
      )}
      {!homeStats.hasCompany && profile.role === "employer" && (
        <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/50 rounded-md border border-amber-200 dark:border-amber-800">
          <p className="text-sm text-amber-800 dark:text-amber-200">
            {t("welcomeHeader.employerOnboardingBanner")}{" "}
            <a href="/employer/onboarding" className="font-medium underline">
              {t("welcomeHeader.employerOnboardingLink")}
            </a>
          </p>
        </div>
      )}
      {!homeStats.hasSchool && profile.role === "supervisor" && (
        <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/50 rounded-md border border-amber-200 dark:border-amber-800">
          <p className="text-sm text-amber-800 dark:text-amber-200">
            {t("welcomeHeader.supervisorOnboardingBanner")}{" "}
            <a href="/supervisor/onboarding" className="font-medium underline">
              {t("welcomeHeader.supervisorOnboardingLink")}
            </a>
          </p>
        </div>
      )}
    </Card>
  );
}
