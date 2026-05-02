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
import { notFound, redirect } from "next/navigation";
import { ApplicationDocumentsPanel } from "@/components/documents/application-documents-panel";
import { caller } from "@/trpc/server";

type Props = { params: Promise<{ id: string }> };

export default async function StudentApplicationDetailPage({ params }: Props) {
  const { id } = await params;

  const profile = await caller.profile.me();
  if (profile?.role !== "student") {
    redirect("/");
  }

  const application = await caller.applications.byId({ id }).catch(() => null);

  if (!application) {
    notFound();
  }

  if (application.student_profile_id !== profile.id) {
    notFound();
  }

  const offer = application.internship_offers as {
    id: string;
    title: string;
    companies: { name: string };
  };
  const canUpload = application.status === "accepted";

  return (
    <div className="space-y-6">
      <Button asChild variant="link" size="sm">
        <Link href="/student/applications">← Back to applications</Link>
      </Button>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle className="text-xl">{offer.title}</CardTitle>
            <Badge variant="secondary">{offer.companies.name}</Badge>
            <Badge
              variant={
                application.status === "accepted"
                  ? "blue"
                  : application.status === "pending"
                    ? "amber"
                    : application.status === "rejected"
                      ? "destructive"
                      : "secondary"
              }
            >
              {application.status}
            </Badge>
          </div>
          <CardDescription>
            {application.applied_at
              ? `Applied ${new Date(application.applied_at).toLocaleDateString()}`
              : null}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild variant="outline" size="sm">
            <Link href={`/offers/${offer.id}`}>View offer</Link>
          </Button>
        </CardContent>
      </Card>

      <ApplicationDocumentsPanel applicationId={id} canUpload={canUpload} />
    </div>
  );
}
