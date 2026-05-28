"use client";

import { useQuery } from "@tanstack/react-query";
import { Avatar, AvatarFallback } from "@v1/ui/avatar";
import { Badge } from "@v1/ui/badge";
import { Card, CardContent } from "@v1/ui/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@v1/ui/empty";
import { Skeleton } from "@v1/ui/skeleton";
import { formatISO } from "date-fns";
import { Users } from "lucide-react";
import { useI18n } from "@/locales/client";
import { useTRPC } from "@/trpc/react";
import { AcceptRejectApplicationActions } from "./accept-reject-application-actions";

const statusVariant: Record<
  string,
  "blue" | "destructive" | "amber" | "secondary"
> = {
  pending: "amber",
  accepted: "blue",
  rejected: "destructive",
  withdrawn: "secondary",
};

function ApplicationCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <Skeleton className="size-10 rounded-full shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-56" />
            <Skeleton className="h-3 w-32" />
          </div>
          <Skeleton className="h-6 w-16 rounded-full shrink-0" />
        </div>
      </CardContent>
    </Card>
  );
}

export function EmployerApplicationList({ offerId }: { offerId: string }) {
  const t = useI18n();
  const trpc = useTRPC();
  const { data, isLoading } = useQuery(
    trpc.applications.byOffer.queryOptions({ offer_id: offerId }),
  );

  const statusLabelKey = {
    pending: "employerApplicationList.status.pending",
    accepted: "employerApplicationList.status.accepted",
    rejected: "employerApplicationList.status.rejected",
    withdrawn: "employerApplicationList.status.withdrawn",
  } as const;

  if (isLoading) {
    return (
      <ul className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholders
          <li key={i}>
            <ApplicationCardSkeleton />
          </li>
        ))}
      </ul>
    );
  }

  if (!data || data.items.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Users className="size-5" />
          </EmptyMedia>
          <EmptyTitle>{t("employerApplicationList.emptyTitle")}</EmptyTitle>
          <EmptyDescription>
            {t("employerApplicationList.emptyDescription")}
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent />
      </Empty>
    );
  }

  return (
    <ul className="space-y-3">
      {data.items.map((app) => {
        const student = app.student_profiles;
        const firstName = student.profiles.first_name ?? "";
        const lastName = student.profiles.last_name ?? "";
        const fullName =
          [firstName, lastName].filter(Boolean).join(" ") ||
          t("employerApplicationList.fallbackStudent");
        const initials = [firstName[0], lastName[0]]
          .filter(Boolean)
          .join("")
          .toUpperCase();

        const meta: string[] = [];
        if (student.major) meta.push(student.major);
        if (student.year_of_study)
          meta.push(
            t("employerApplicationList.yearLabel", {
              n: student.year_of_study,
            }),
          );
        if (student.index_number)
          meta.push(
            t("employerApplicationList.indexLabel", {
              n: student.index_number,
            }),
          );

        const statusKey = app.status as keyof typeof statusLabelKey;
        const statusLabel =
          statusKey in statusLabelKey
            ? t(statusLabelKey[statusKey])
            : app.status;

        return (
          <li key={app.id}>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <Avatar className="size-10 shrink-0">
                    <AvatarFallback className="text-xs font-medium">
                      {initials || "?"}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="font-medium text-sm leading-snug">
                          {fullName}
                        </p>
                        {meta.length > 0 && (
                          <p className="text-muted-foreground text-xs mt-0.5">
                            {meta.join(" · ")}
                          </p>
                        )}
                      </div>
                      <Badge
                        variant={statusVariant[app.status] ?? "secondary"}
                        className="shrink-0"
                      >
                        {statusLabel}
                      </Badge>
                    </div>

                    {app.applied_at && (
                      <p className="text-xs text-muted-foreground mt-2">
                        {t("employerApplicationList.appliedOn", {
                          date: formatISO(app.applied_at, {
                            representation: "date",
                          }),
                        })}
                      </p>
                    )}

                    <div className="mt-3 pt-3 border-t">
                      {app.status === "pending" ? (
                        <AcceptRejectApplicationActions
                          applicationId={app.id}
                          initialReason={app.employer_rejection_reason}
                          offerId={offerId}
                        />
                      ) : app.employer_rejection_reason ? (
                        <p className="text-xs text-muted-foreground">
                          <span className="font-medium">
                            {t(
                              "employerApplicationList.rejectionReasonLabel",
                            )}
                          </span>{" "}
                          {app.employer_rejection_reason}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </li>
        );
      })}
    </ul>
  );
}
