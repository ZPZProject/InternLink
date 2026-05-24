import { Skeleton } from "@v1/ui/skeleton";

export default function SupervisorReviewsLoading() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-56 max-w-full" />
      <Skeleton className="h-4 w-80 max-w-full" />
      <Skeleton className="h-40 w-full rounded-lg" />
    </div>
  );
}
