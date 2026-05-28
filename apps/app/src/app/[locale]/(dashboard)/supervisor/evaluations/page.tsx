import { EvaluationList } from "@/components/supervisor/evaluation-list";
import { getI18n } from "@/locales/server";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";

export default async function SupervisorEvaluationsPage() {
  const t = await getI18n();
  prefetch(trpc.evaluations.listCompletable.queryOptions());

  return (
    <HydrateClient>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {t("supervisorEvaluations.title")}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {t("supervisorEvaluations.subtitle")}
          </p>
        </div>

        <EvaluationList />
      </div>
    </HydrateClient>
  );
}
