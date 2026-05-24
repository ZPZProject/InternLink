import { AppShell } from "@/components/shell/app-shell";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  prefetch(trpc.profile.me.queryOptions());

  return (
    <HydrateClient>
      <AppShell>{children}</AppShell>
    </HydrateClient>
  );
}
