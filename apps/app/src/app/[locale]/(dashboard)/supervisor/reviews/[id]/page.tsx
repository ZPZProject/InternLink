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
import { ReviewActionBar } from "@/components/supervisor/review-action-bar";
import { caller } from "@/trpc/server";

type Props = { params: Promise<{ id: string }> };

export default async function SupervisorReviewDetailPage({ params }: Props) {
  const { id } = await params;

  const application = await caller.applications.byId({ id }).catch(() => null);

  if (!application) {
    notFound();
  }

  const documents = await caller.documents.listByApplicationSupervisor({
    application_id: id,
  });

  const offer = application.internship_offers as {
    id: string;
    title: string;
    companies: { name: string };
  };

  const student = application.student_profiles as {
    id: string;
    index_number: string | null;
    major: string | null;
    year_of_study: number | null;
    profiles: { first_name: string | null; last_name: string | null; email: string | null };
  };

  const pendingCount = documents.filter((d) => d.review_status === "pending").length;

  return (
    <div className="space-y-6">
      <Button asChild variant="link" size="sm">
        <Link href="/supervisor/reviews">← Back to review queue</Link>
      </Button>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle className="text-xl">{offer.title}</CardTitle>
            <Badge variant="secondary">{offer.companies.name}</Badge>
          </div>
          <CardDescription>
            Student: {student.profiles.first_name} {student.profiles.last_name}
            {student.index_number ? ` (${student.index_number})` : ""}
            {student.major ? ` — ${student.major}` : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            {student.profiles.email}
            {pendingCount > 0
              ? ` — ${pendingCount} document(s) pending review`
              : " — All documents reviewed"}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {documents.map((doc) => (
          <DocumentPreviewList key={doc.id} document={doc} applicationId={id} />
        ))}
        {documents.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No documents have been uploaded for this application.
          </p>
        )}
      </div>
    </div>
  );
}
