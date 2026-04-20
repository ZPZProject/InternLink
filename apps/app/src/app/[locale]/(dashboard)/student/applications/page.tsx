import { ApplicationList } from "@/components/applications/application-list";

export default function StudentApplicationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">My applications</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Track the status of your internship applications.
        </p>
      </div>
      <ApplicationList />
    </div>
  );
}