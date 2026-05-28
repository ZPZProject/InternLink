"use client";

import { useQuery } from "@tanstack/react-query";
import { Badge } from "@v1/ui/badge";
import { Button } from "@v1/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@v1/ui/card";
import { Skeleton } from "@v1/ui/skeleton";
import Link from "next/link";
import { useI18n } from "@/locales/client";
import { useTRPC } from "@/trpc/react";
import { DocumentPreviewList } from "./document-preview-list";

export function ReviewDetailContent({
  applicationId,
}: {
  applicationId: string;
}) {
  const t = useI18n();
  const trpc = useTRPC();

  const { data: application } = useQuery(
    trpc.applications.byId.queryOptions({ id: applicationId }),
  );

  const { data: documents, isLoading } = useQuery(
    trpc.documents.listByApplicationSupervisor.queryOptions({
      application_id: applicationId,
    }),
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  const pendingCount = (documents ?? []).filter(
    (d) => d.review_status === "pending",
  ).length;

  const offer = application?.internship_offers;
  const student = application?.student_profiles;

  return (
    <div className="space-y-6">
      <Button asChild variant="link" size="sm">
        <Link href="/supervisor/reviews">{t("reviewDetail.backLink")}</Link>
      </Button>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle className="text-xl">{offer?.title}</CardTitle>
            {offer && (
              <Badge variant="secondary">{offer.companies.name}</Badge>
            )}
          </div>
          <CardDescription>
            {t("reviewDetail.studentLabel")} {student?.profiles.first_name}{" "}
            {student?.profiles.last_name}
            {student?.index_number ? ` (${student.index_number})` : ""}
            {student?.major ? ` — ${student.major}` : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            {student?.profiles.email}
            {pendingCount > 0
              ? ` — ${t("reviewDetail.pendingDocs", { n: pendingCount })}`
              : ` — ${t("reviewDetail.allReviewed")}`}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {(documents ?? []).map((doc) => (
          <DocumentPreviewList key={doc.id} document={doc} applicationId={applicationId} />
        ))}
        {!documents?.length && (
          <p className="text-sm text-muted-foreground">
            {t("reviewDetail.noDocuments")}
          </p>
        )}
      </div>
    </div>
  );
}
