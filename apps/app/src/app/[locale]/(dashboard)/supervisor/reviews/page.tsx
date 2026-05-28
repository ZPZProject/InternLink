import { getI18n } from "@/locales/server";
import { caller } from "@/trpc/server";
import { DocumentReviewTable } from "@/components/supervisor/document-review-table";

export default async function SupervisorReviewsPage() {
  const t = await getI18n();
  const queue = await caller.documents.reviewQueue();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {t("supervisorReviews.title")}
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {t("supervisorReviews.subtitle")}
        </p>
      </div>

      <DocumentReviewTable items={queue} />
    </div>
  );
}
