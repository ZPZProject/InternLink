export default function NewOfferLoading() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="bg-muted h-4 w-40 animate-pulse rounded-md" />
      <div className="space-y-2">
        <div className="bg-muted h-8 w-48 animate-pulse rounded-md" />
        <div className="bg-muted h-4 w-full max-w-md animate-pulse rounded-md" />
      </div>
      <div className="bg-muted h-64 animate-pulse rounded-lg" />
    </div>
  );
}
