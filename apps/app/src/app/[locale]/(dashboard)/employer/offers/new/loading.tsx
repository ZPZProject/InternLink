import { Skeleton } from "@v1/ui/skeleton";

export default function NewOfferLoading() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Skeleton className="h-4 w-40" />
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-full max-w-md" />
      </div>
      <Skeleton className="h-64 w-full rounded-lg" />
    </div>
  );
}
