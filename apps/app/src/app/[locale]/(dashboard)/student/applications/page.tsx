import { ApplicationList } from "@/components/applications/application-list";
import { ApplicationsHeader } from "@/components/applications/applications-header";
import { ApplicationsStats } from "@/components/applications/applications-stats";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";

export default function StudentApplicationsPage() {
  prefetch(trpc.applications.getStats.queryOptions());
  prefetch(trpc.applications.myList.queryOptions({ limit: 50, offset: 0 }));

  return (
    <HydrateClient>
      <div className="space-y-6">
        <ApplicationsHeader />
        <ApplicationsStats />
        <ApplicationList />
      </div>
    </HydrateClient>
  );
}
