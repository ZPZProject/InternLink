"use client";

import { Button } from "@v1/ui/button";
import { Icons } from "@v1/ui/icons";
import Link from "next/link";

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
  const statusFilters: { value: StatusFilter; label: string }[] = [
    { value: "all", label: "All" },
    { value: "pending", label: "Pending" },
    { value: "accepted", label: "Accepted" },
    { value: "rejected", label: "Rejected" },
    { value: "withdrawn", label: "Withdrawn" },
  ];

  if (isEmployer) {
    return (
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Applications for {offerTitle || "Offer"}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {total !== undefined
              ? `${total} application${total !== 1 ? "s" : ""} received`
              : "Track applications for this offer."}
          </p>
        </div>

        <Button asChild variant="outline" size="sm">
          <Link href="/employer/offers">← Back to offers</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            My Applications
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {total !== undefined
              ? `You have ${total} application${total !== 1 ? "s" : ""}.`
              : "Track the status of your internship applications."}
          </p>
        </div>

        <Button asChild variant="outline">
          <Link href="/offers">
            <Icons.Briefcase className="mr-2 h-4 w-4" />
            Browse Offers
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
              {filter.label}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
