import { SignOutButton } from "@/components/auth/sign-out-button";
import { AppShell } from "@/components/shell/app-shell";
import { caller } from "@/trpc/server";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await caller.profile.me();

  if (!profile.is_active) {
    return (
      <div className="bg-muted/30 flex min-h-screen flex-col items-center justify-center gap-4 p-6">
        <p className="text-muted-foreground max-w-md text-center">
          Your account is inactive. Contact an administrator if this is a
          mistake.
        </p>
        <SignOutButton />
      </div>
    );
  }

  return <AppShell profile={profile}>{children}</AppShell>;
}
