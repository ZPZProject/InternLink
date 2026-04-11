/** Shown while a dashboard child route segment is pending (inset under the shell). */
export default function DashboardLoading() {
  return (
    <div className="space-y-4">
      <div className="bg-muted h-8 w-48 max-w-full animate-pulse rounded-md" />
      <div className="bg-muted h-24 w-full animate-pulse rounded-lg" />
      <div className="bg-muted h-24 w-full animate-pulse rounded-lg" />
    </div>
  );
}
