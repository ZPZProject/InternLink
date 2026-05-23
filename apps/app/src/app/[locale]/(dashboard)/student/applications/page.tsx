import { ApplicationList } from "@/components/applications/application-list";
import { ApplicationsHeader } from "@/components/applications/applications-header";
import { ApplicationsStats } from "@/components/applications/applications-stats";
import { HydrateClient } from "@/trpc/server";

export default function StudentApplicationsPage() {
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