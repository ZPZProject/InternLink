"use client";

import { Button } from "@v1/ui/button";
import { Icons } from "@v1/ui/icons";
import Link from "next/link";
import { useI18n } from "@/locales/client";

export function StudentHeader({ total }: { total?: number }) {
  const t = useI18n();
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {t("applicationsHeader.student.title")}
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {total !== undefined
            ? t("applicationsHeader.student.subtitleWithTotal", { total })
            : t("applicationsHeader.student.subtitleDefault")}
        </p>
      </div>

      <Button asChild variant="outline">
        <Link href="/offers">
          <Icons.Briefcase className="mr-2 h-4 w-4" />
          {t("applicationsHeader.student.browseOffersBtn")}
        </Link>
      </Button>
    </div>
  );
}

export function StudentOnboardingHeader({
  isComplete,
}: {
  isComplete: boolean;
}) {
  const t = useI18n();
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">
        {isComplete
          ? t("studentProfileComplete.title")
          : t("studentOnboardingForm.schoolLabel")}
      </h1>
      <p className="text-muted-foreground mt-1 text-sm">
        {isComplete
          ? t("studentProfileComplete.description")
          : t("studentOnboardingForm.majorLabel")}
      </p>
    </div>
  );
}
