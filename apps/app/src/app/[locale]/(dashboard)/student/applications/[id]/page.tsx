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
import { formatISO } from "date-fns";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ApplicationDocumentsPanel } from "@/components/documents/application-documents-panel";
import { ApplicationEvaluation } from "@/components/student/application-evaluation";
import { caller } from "@/trpc/server";

type Props = { params: Promise<{ id: string }> };

export default async function StudentApplicationDetailPage({ params }: Props) {
  const { id } = await params;
  const t = await getI18n();

  const profile = await caller.profile.me();
  if (profile?.role !== "student") {
    redirect("/");
  }

  const application = await caller.applications.byId({ id }).catch(() => null);
  const evaluation = await caller.evaluations
    .byApplication({ application_id: id })
    .catch(() => null);

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
        <Link href="/student/applications">
          {t("studentApplicationDetail.backLink")}
        </Link>
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
              ? `Applied ${formatISO(application.applied_at, { representation: "date" })}`
              : null}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild variant="outline" size="sm">
            <Link href={`/offers/${offer.id}`}>
              {t("studentApplicationDetail.viewOffer")}
            </Link>
          </Button>
        </CardContent>
      </Card>

      <ApplicationDocumentsPanel applicationId={id} canUpload={canUpload} />
      <ApplicationEvaluation evaluation={evaluation} />
    </div>
  );
}
