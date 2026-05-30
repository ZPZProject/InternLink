"use client";

import type { RouterOutputs } from "@v1/api";
import { useQuery } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@v1/ui/avatar";
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
import { Skeleton } from "@v1/ui/skeleton";
import { toast } from "@v1/ui/sonner";
import { formatISO } from "date-fns";
import { ChevronDown, Users } from "lucide-react";
import { useState } from "react";
import { FileTypeIcon } from "@/components/documents/file-type-icon";
import { RichTextHtml } from "@/components/editor/rich-text-html";
import { useI18n } from "@/locales/client";
import { useTRPC } from "@/trpc/react";
import { cn } from "@v1/ui/cn";
import { AcceptRejectApplicationActions } from "./accept-reject-application-actions";

type CvDocument = {
  id: string;
  file_name: string;
  file_size_bytes: number;
  mime_type: string;
  uploaded_at: string;
};

type EmployerApplicationItem =
  RouterOutputs["applications"]["byOffer"]["items"][number] & {
    cv: CvDocument | null;
  };

const statusVariant: Record<
  string,
  "blue" | "destructive" | "amber" | "secondary"
> = {
  pending: "amber",
  accepted: "blue",
  rejected: "destructive",
  withdrawn: "secondary",
};

function ApplicationCvDownload({ cv }: { cv: CvDocument }) {
  const t = useI18n();
  const trpc = useTRPC();

  const signedUrl = useQuery(
    trpc.documents.employerGetSignedReadUrl.queryOptions(
      { document_id: cv.id },
      { enabled: false },
    ),
  );

  const handleDownload = async () => {
    const result = await signedUrl.refetch();
    if (result.data?.signedUrl) {
      window.open(result.data.signedUrl, "_blank");
    } else {
      toast.error(t("employerApplicationList.cvDownloadError"));
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-md border bg-muted/30 px-3 py-2">
      <FileTypeIcon mimeType={cv.mime_type} className="size-4 shrink-0" />
      <span className="min-w-0 flex-1 truncate text-sm">{cv.file_name}</span>
      <span className="text-muted-foreground text-xs">
        {(cv.file_size_bytes / 1024).toFixed(1)} KB
      </span>
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={handleDownload}
        disabled={signedUrl.isFetching}
      >
        {t("employerApplicationList.downloadCv")}
      </Button>
    </div>
  );
}

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

function EmployerApplicationCard({
  app,
  offerId,
}: {
  app: EmployerApplicationItem;
  offerId: string;
}) {
  const t = useI18n();
  const [open, setOpen] = useState(app.status === "pending");

  const student = app.student_profiles;
  const profile = student.profiles;
  const firstName = profile.first_name ?? "";
  const lastName = profile.last_name ?? "";
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

  const statusLabelKey = {
    pending: "employerApplicationList.status.pending",
    accepted: "employerApplicationList.status.accepted",
    rejected: "employerApplicationList.status.rejected",
    withdrawn: "employerApplicationList.status.withdrawn",
  } as const;

  const statusKey = app.status as keyof typeof statusLabelKey;
  const statusLabel =
    statusKey in statusLabelKey ? t(statusLabelKey[statusKey]) : app.status;

  const motivationLetter = app.motivation_letter?.trim() ?? "";

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <Avatar className="size-10 shrink-0">
            <AvatarImage src={profile.avatar_url ?? undefined} />
            <AvatarFallback className="text-xs font-medium">
              {initials || "?"}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <button
              type="button"
              className="flex w-full items-start justify-between gap-2 text-left"
              onClick={() => setOpen((value) => !value)}
              aria-expanded={open}
              aria-label={
                open
                  ? t("employerApplicationList.collapseApplication", {
                      name: fullName,
                    })
                  : t("employerApplicationList.expandApplication", {
                      name: fullName,
                    })
              }
            >
              <div className="min-w-0">
                <p className="font-medium text-sm leading-snug">{fullName}</p>
                {profile.email ? (
                  <a
                    href={`mailto:${profile.email}`}
                    onClick={(event) => event.stopPropagation()}
                    className="text-muted-foreground hover:text-foreground text-xs mt-0.5 block truncate"
                  >
                    {profile.email}
                  </a>
                ) : null}
                {meta.length > 0 && (
                  <p className="text-muted-foreground text-xs mt-0.5">
                    {meta.join(" · ")}
                  </p>
                )}
                {app.applied_at ? (
                  <p className="text-muted-foreground text-xs mt-1">
                    {t("employerApplicationList.appliedOn", {
                      date: formatISO(app.applied_at, {
                        representation: "date",
                      }),
                    })}
                  </p>
                ) : null}
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <Badge variant={statusVariant[app.status] ?? "secondary"}>
                  {statusLabel}
                </Badge>
                <ChevronDown
                  className={cn(
                    "text-muted-foreground size-4 transition-transform",
                    open && "rotate-180",
                  )}
                  aria-hidden
                />
              </div>
            </button>

            {open ? (
              <div className="mt-4 space-y-4 border-t pt-4">
                {app.reviewed_at ? (
                  <p className="text-xs text-muted-foreground">
                    {t("employerApplicationList.reviewedOn", {
                      date: formatISO(app.reviewed_at, {
                        representation: "date",
                      }),
                    })}
                  </p>
                ) : null}

                <div className="space-y-2">
                  <p className="text-xs font-medium">
                    {t("employerApplicationList.motivationLabel")}
                  </p>
                  {motivationLetter ? (
                    <RichTextHtml
                      html={motivationLetter}
                      className="rounded-md border bg-muted/20 px-3 py-2 text-foreground"
                    />
                  ) : (
                    <p className="text-muted-foreground text-xs italic">
                      {t("employerApplicationList.noMotivation")}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-medium">
                    {t("employerApplicationList.cvLabel")}
                  </p>
                  {app.cv ? (
                    <ApplicationCvDownload cv={app.cv} />
                  ) : (
                    <p className="text-muted-foreground text-xs italic">
                      {t("employerApplicationList.noCv")}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t">
                  {app.status === "pending" ? (
                    <AcceptRejectApplicationActions
                      applicationId={app.id}
                      initialReason={app.employer_rejection_reason}
                      offerId={offerId}
                    />
                  ) : app.employer_rejection_reason ? (
                    <p className="text-xs text-muted-foreground">
                      <span className="font-medium">
                        {t("employerApplicationList.rejectionReasonLabel")}
                      </span>{" "}
                      {app.employer_rejection_reason}
                    </p>
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>
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

  if (isLoading) {
    return (
      <ul className="space-y-3">
        {Array.from({ length: 3 }, (_, i) => (
          <li key={`skeleton-${i}`}>
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
      {(data.items as EmployerApplicationItem[]).map((app) => (
        <li key={app.id}>
          <EmployerApplicationCard app={app} offerId={offerId} />
        </li>
      ))}
    </ul>
  );
}
