export default function EmployerOffersLoading() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="bg-muted h-8 w-40 animate-pulse rounded-md" />
          <div className="bg-muted h-4 w-72 max-w-full animate-pulse rounded-md" />
        </div>
        <div className="bg-muted h-9 w-28 animate-pulse rounded-md" />
      </div>
      <div className="space-y-3">
        <div className="bg-muted h-28 animate-pulse rounded-lg" />
        <div className="bg-muted h-28 animate-pulse rounded-lg" />
      </div>
    </div>
  );
}
