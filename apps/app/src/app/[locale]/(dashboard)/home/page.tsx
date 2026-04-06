import { RoleBadge } from "@/components/role-badge";
import { caller } from "@/trpc/server";

export default async function HomePage() {
  const profile = await caller.profile.me();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">Home</h1>
      <p className="text-muted-foreground text-sm">
        You are signed in as{" "}
        <span className="text-foreground font-medium">
          {profile.email ?? profile.id}
        </span>
        .
      </p>
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground text-sm">Role:</span>
        <RoleBadge role={profile.role} />
      </div>
    </div>
  );
}
