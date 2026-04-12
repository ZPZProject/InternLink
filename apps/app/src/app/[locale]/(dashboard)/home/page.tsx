import { HomeSignedInSummary } from "@/components/shell/home-signed-in-summary";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";

export default function HomePage() {
  prefetch(trpc.profile.me.queryOptions());

  return (
    <HydrateClient>
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold tracking-tight">Home</h1>
        <HomeSignedInSummary />
      </div>
    </HydrateClient>
  );
}
