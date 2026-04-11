import { Skeleton } from "@v1/ui/skeleton";

export default function HomeLoading() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-4 w-full max-w-md" />
      <Skeleton className="h-4 w-40" />
    </div>
  );
}
