import { InactiveAccountScreen } from "@/components/auth/inactive-account-screen";
import { AppShell } from "@/components/shell/app-shell";
import { caller } from "@/trpc/server";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await caller.profile.me();

  if (!profile.is_active) {
    return <InactiveAccountScreen />;
  }

  return <AppShell profile={profile}>{children}</AppShell>;
}
