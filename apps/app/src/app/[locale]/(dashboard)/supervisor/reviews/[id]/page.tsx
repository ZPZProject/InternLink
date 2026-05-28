import { getI18n } from "@/locales/server";
import { Badge } from "@v1/ui/badge";
import { Button } from "@v1/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@v1/ui/card";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DocumentPreviewList } from "@/components/supervisor/document-preview-list";
import { caller } from "@/trpc/server";

type Props = { params: Promise<{ id: string }> };

export default async function SupervisorReviewDetailPage({ params }: Props) {
  const { id } = await params;
  const t = await getI18n();

  const application = await caller.applications.byId({ id }).catch(() => null);

  if (!application) {
    notFound();
  }

  const documents = await caller.documents.listByApplicationSupervisor({
    application_id: id,
  });

  const offer = application.internship_offers;
  const student = application.student_profiles;

  const pendingCount = documents.filter(
    (d) => d.review_status === "pending",
  ).length;

  return (
    <div className="space-y-6">
      <Button asChild variant="link" size="sm">
        <Link href="/supervisor/reviews">{t("reviewDetail.backLink")}</Link>
      </Button>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle className="text-xl">{offer.title}</CardTitle>
            <Badge variant="secondary">{offer.companies.name}</Badge>
          </div>
          <CardDescription>
            {t("reviewDetail.studentLabel")} {student.profiles.first_name}{" "}
            {student.profiles.last_name}
            {student.index_number ? ` (${student.index_number})` : ""}
            {student.major ? ` — ${student.major}` : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            {student.profiles.email}
            {pendingCount > 0
              ? ` — ${t("reviewDetail.pendingDocs", { n: pendingCount })}`
              : ` — ${t("reviewDetail.allReviewed")}`}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {documents.map((doc) => (
          <DocumentPreviewList key={doc.id} document={doc} applicationId={id} />
        ))}
        {documents.length === 0 && (
          <p className="text-sm text-muted-foreground">
            {t("reviewDetail.noDocuments")}
          </p>
        )}
      </div>
    </div>
  );
}
