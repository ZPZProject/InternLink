import type { Tables } from "@v1/supabase/types";
import Link from "next/link";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { RoleBadge } from "@/components/role-badge";

type Profile = Tables<"profiles">;

type NavItem =
  | { kind: "link"; href: string; label: string }
  | { kind: "soon"; label: string };

function navForRole(role: Profile["role"]): NavItem[] {
  const home: NavItem = { kind: "link", href: "/home", label: "Home" };
  if (role === "student") {
    return [home, { kind: "soon", label: "Applications (soon)" }];
  }
  if (role === "employer") {
    return [home, { kind: "soon", label: "My offers (soon)" }];
  }
  if (role === "supervisor") {
    return [home, { kind: "soon", label: "Reviews (soon)" }];
  }
  if (role === "admin") {
    return [home, { kind: "soon", label: "Users (soon)" }];
  }
  return [home];
}

export function AppShell({
  profile,
  children,
}: {
  profile: Profile;
  children: React.ReactNode;
}) {
  const items = navForRole(profile.role);
  const display =
    [profile.first_name, profile.last_name].filter(Boolean).join(" ") ||
    profile.email ||
    "Account";

  return (
    <div className="bg-background min-h-screen">
      <header className="border-border flex h-14 items-center gap-4 border-b px-4">
        <Link className="font-semibold" href="/home">
          InternLink
        </Link>
        <nav className="text-muted-foreground flex flex-1 items-center gap-4 text-sm">
          {items.map((item) =>
            item.kind === "link" ? (
              <Link
                key={item.label}
                className="hover:text-foreground"
                href={item.href}
              >
                {item.label}
              </Link>
            ) : (
              <span key={item.label} className="cursor-default opacity-50">
                {item.label}
              </span>
            ),
          )}
        </nav>
        <div className="flex items-center gap-3">
          <span className="text-muted-foreground hidden max-w-[160px] truncate text-sm sm:inline">
            {display}
          </span>
          <RoleBadge role={profile.role} />
          <SignOutButton />
        </div>
      </header>
      <main className="mx-auto max-w-4xl p-6">{children}</main>
    </div>
  );
}
