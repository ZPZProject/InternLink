"use client";

import { Button } from "@v1/ui/button";
import { Icons } from "@v1/ui/icons";
import Link from "next/link";
import { useI18n } from "@/locales/client";

type StatusFilter = "all" | "pending" | "accepted" | "rejected" | "withdrawn";

export function ApplicationsHeader({
  total,
  status,
  onStatusChange,
  isEmployer,
  offerTitle,
}: {
  total?: number;
  status?: StatusFilter;
  onStatusChange?: (status: StatusFilter) => void;
  isEmployer?: boolean;
  offerTitle?: string;
}) {
  const t = useI18n();

  const statusFilters: { value: StatusFilter; labelKey: string }[] = [
    { value: "all", labelKey: "applicationsHeader.filter.all" },
    { value: "pending", labelKey: "applicationsHeader.filter.pending" },
    { value: "accepted", labelKey: "applicationsHeader.filter.accepted" },
    { value: "rejected", labelKey: "applicationsHeader.filter.rejected" },
    { value: "withdrawn", labelKey: "applicationsHeader.filter.withdrawn" },
  ];

  if (isEmployer) {
    return (
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {t("applicationsHeader.employer.title", {
              offerTitle: offerTitle ?? "Offer",
            })}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {total !== undefined
              ? t("applicationsHeader.employer.subtitleWithTotal", { total })
              : t("applicationsHeader.employer.subtitleDefault")}
          </p>
        </div>

        <Button asChild variant="outline" size="sm">
          <Link href="/employer/offers">{t("employerApplications.backLink")}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
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

      {onStatusChange && (
        <div className="flex flex-wrap gap-2">
          {statusFilters.map((filter) => (
            <Button
              key={filter.value}
              variant={status === filter.value ? "default" : "outline"}
              size="sm"
              onClick={() => onStatusChange(filter.value)}
            >
              {t(filter.labelKey as Parameters<typeof t>[0])}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
