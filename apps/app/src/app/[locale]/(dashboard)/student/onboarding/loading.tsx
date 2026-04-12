import { Skeleton } from "@v1/ui/skeleton";

export default function StudentOnboardingLoading() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-64 max-w-full" />
      <Skeleton className="h-40 w-full max-w-lg rounded-lg" />
    </div>
  );
}
