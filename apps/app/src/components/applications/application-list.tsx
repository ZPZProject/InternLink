"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { Avatar, AvatarFallback } from "@v1/ui/avatar";
import { Badge } from "@v1/ui/badge";
import { Button } from "@v1/ui/button";
import { Card, CardContent } from "@v1/ui/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@v1/ui/empty";
import { formatISO } from "date-fns";
import { Briefcase, MapPin } from "lucide-react";
import Link from "next/link";
import { useI18n } from "@/locales/client";
import { useTRPC } from "@/trpc/react";

const statusVariant: Record<
  string,
  "blue" | "destructive" | "amber" | "secondary"
> = {
  pending: "amber",
  accepted: "blue",
  rejected: "destructive",
  withdrawn: "secondary",
};

type StatusFilter = "all" | "pending" | "accepted" | "rejected" | "withdrawn";

export function ApplicationList({ status = "all" }: { status?: StatusFilter }) {
  const t = useI18n();
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(
    trpc.applications.myList.queryOptions({ limit: 50, offset: 0 }),
  );

  const filteredItems =
    status === "all"
      ? data.items
      : data.items.filter((app) => app.status === status);

  const statusLabelKey = {
    pending: "applicationList.status.pending",
    accepted: "applicationList.status.accepted",
    rejected: "applicationList.status.rejected",
    withdrawn: "applicationList.status.withdrawn",
  } as const;

  if (!filteredItems.length) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Briefcase className="size-5" />
          </EmptyMedia>
          <EmptyTitle>
            {status === "all"
              ? t("applicationList.emptyAll.title")
              : t("applicationList.emptyFiltered.title", {
                  status: status in statusLabelKey
                    ? t(statusLabelKey[status as keyof typeof statusLabelKey])
                    : status,
                })}
          </EmptyTitle>
          <EmptyDescription>
            {status === "all"
              ? t("applicationList.emptyAll.description")
              : t("applicationList.emptyFiltered.description", {
                  status: status in statusLabelKey
                    ? t(statusLabelKey[status as keyof typeof statusLabelKey])
                    : status,
                })}
          </EmptyDescription>
        </EmptyHeader>
        {status === "all" && (
          <EmptyContent>
            <Button asChild>
              <Link href="/offers">{t("applicationList.browseOffersBtn")}</Link>
            </Button>
          </EmptyContent>
        )}
      </Empty>
    );
  }

  return (
    <ul className="space-y-3">
      {filteredItems.map((app) => {
        const offer = app.internship_offers;
        const companyName = offer.companies.name;
        const initials = companyName
          .split(" ")
          .slice(0, 2)
          .map((w) => w[0])
          .join("")
          .toUpperCase();

        const statusKey = app.status as keyof typeof statusLabelKey;
        const statusLabel = statusKey in statusLabelKey
          ? t(statusLabelKey[statusKey])
          : app.status;

        return (
          <li key={app.id}>
            <Card className="transition-colors hover:bg-muted/30">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <Avatar className="size-10 shrink-0 rounded-lg">
                    <AvatarFallback className="rounded-lg text-xs font-medium">
                      {initials}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-medium text-sm leading-snug truncate">
                          {offer.title}
                        </p>
                        <p className="text-muted-foreground text-xs mt-0.5">
                          {companyName}
                        </p>
                      </div>
                      <Badge
                        variant={statusVariant[app.status] ?? "secondary"}
                        className="shrink-0"
                      >
                        {statusLabel}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 mt-2">
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="size-3" />
                        {offer.location}
                      </span>
                      {app.applied_at && (
                        <span className="text-xs text-muted-foreground">
                          {t("applicationList.appliedOn", {
                            date: formatISO(app.applied_at, {
                              representation: "date",
                            }),
                          })}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-3 pt-3 border-t">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/student/applications/${app.id}`}>
                      {t("applicationList.viewApplicationBtn")}
                    </Link>
                  </Button>
                  <Button asChild variant="ghost" size="sm">
                    <Link href={`/offers/${offer.id}`}>
                      {t("applicationList.viewOfferBtn")}
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </li>
        );
      })}
    </ul>
  );
}
