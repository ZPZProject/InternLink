export default function OffersLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="bg-muted h-8 w-64 max-w-full animate-pulse rounded-md" />
        <div className="bg-muted h-4 w-96 max-w-full animate-pulse rounded-md" />
      </div>
      <div className="bg-muted h-10 w-full max-w-md animate-pulse rounded-md" />
      <div className="space-y-3">
        <div className="bg-muted h-24 animate-pulse rounded-lg" />
        <div className="bg-muted h-24 animate-pulse rounded-lg" />
      </div>
    </div>
  );
}
