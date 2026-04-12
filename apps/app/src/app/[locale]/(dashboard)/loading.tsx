import { Skeleton } from "@v1/ui/skeleton";

/** Shown while a dashboard child route segment is pending (inset under the shell). */
export default function DashboardLoading() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-48 max-w-full" />
      <Skeleton className="h-24 w-full rounded-lg" />
      <Skeleton className="h-24 w-full rounded-lg" />
    </div>
  );
}
