import { HydrateClient, prefetch, trpc } from "@/trpc/server";
import { WelcomeHeader } from "@/components/home/welcome-header";
import { StatsCards } from "@/components/home/stats-cards";
import { QuickActions } from "@/components/home/quick-actions";

export default function HomePage() {
  prefetch(trpc.profile.me.queryOptions());
  prefetch(trpc.profile.homeStats.queryOptions());

  return (
    <HydrateClient>
      <div className="space-y-6">
        <WelcomeHeader />
        <QuickActions />
        <StatsCards />
      </div>
    </HydrateClient>
  );
}
