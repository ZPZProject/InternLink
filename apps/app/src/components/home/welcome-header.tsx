"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { Card } from "@v1/ui/card";
import { RoleBadge } from "@/components/role-badge";
import { useTRPC } from "@/trpc/react";

export function WelcomeHeader() {
  const trpc = useTRPC();
  const { data: profile } = useSuspenseQuery(trpc.profile.me.queryOptions());
  const { data: homeStats } = useSuspenseQuery(trpc.profile.homeStats.queryOptions());

  const displayName = profile.first_name
    ? `${profile.first_name} ${profile.last_name ?? ""}`.trim()
    : profile.email ?? "User";

  const roleMessages = {
    student: "Find your perfect internship opportunity",
    employer: "Manage your internship offers",
    supervisor: "Oversee student internships",
    admin: "Manage the platform",
  };

  const message = roleMessages[profile.role] ?? "Welcome";

  return (
    <Card className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            Welcome back, {displayName}
          </h1>
          <p className="text-muted-foreground text-sm">{message}</p>
        </div>
        <div className="flex items-center gap-2">
          <RoleBadge role={profile.role} />
        </div>
      </div>
      {!homeStats.onboardingComplete && profile.role === "student" && (
        <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/50 rounded-md border border-amber-200 dark:border-amber-800">
          <p className="text-sm text-amber-800 dark:text-amber-200">
            Complete your profile to apply for internships.{" "}
            <a href="/student/onboarding" className="font-medium underline">
              Complete onboarding
            </a>
          </p>
        </div>
      )}
      {!homeStats.hasCompany && profile.role === "employer" && (
        <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/50 rounded-md border border-amber-200 dark:border-amber-800">
          <p className="text-sm text-amber-800 dark:text-amber-200">
            Register your company to post internship offers.{" "}
            <a href="/employer/onboarding" className="font-medium underline">
              Register company
            </a>
          </p>
        </div>
      )}
      {!homeStats.hasSchool && profile.role === "supervisor" && (
        <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/50 rounded-md border border-amber-200 dark:border-amber-800">
          <p className="text-sm text-amber-800 dark:text-amber-200">
            Register your school to supervise students.{" "}
            <a href="/supervisor/onboarding" className="font-medium underline">
              Register school
            </a>
          </p>
        </div>
      )}
    </Card>
  );
}
