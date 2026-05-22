import { caller } from "@/trpc/server";
import { DocumentReviewTable } from "@/components/supervisor/document-review-table";

export default async function SupervisorReviewsPage() {
  const queue = await caller.documents.reviewQueue();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Document Reviews
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Review and approve internship documents submitted by students.
        </p>
      </div>

      <DocumentReviewTable items={queue} />
    </div>
  );
}
