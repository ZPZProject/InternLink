import { EvaluationList } from "@/components/supervisor/evaluation-list";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";

export default async function SupervisorEvaluationsPage() {
  await prefetch(trpc.evaluations.listCompletable.queryOptions());

  return (
    <HydrateClient>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Evaluations</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Review approved internship documents and submit final supervisor
            evaluations.
          </p>
        </div>

        <EvaluationList />
      </div>
    </HydrateClient>
  );
}
