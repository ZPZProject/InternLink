"use client";

import { useQuery } from "@tanstack/react-query";
import type { Tables } from "@v1/supabase/types";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
} from "@v1/ui/sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMounted } from "@/hooks/use-mounted";
import { useTRPC } from "@/trpc/react";

type Profile = Tables<"profiles">;

type NavItem = { href: string; label: string };

const SHARED_LINKS: NavItem[] = [
  { href: "/home", label: "Home" },
  { href: "/offers", label: "Offers" },
];

const STUDENT_LINKS: NavItem[] = [
  ...SHARED_LINKS,
  { href: "/student/applications", label: "Applications" },
];

const EMPLOYER_LINKS: NavItem[] = [
  ...SHARED_LINKS,
  { href: "/employer/offers", label: "My offers" },
];

const SUPERVISOR_LINKS: NavItem[] = [
  ...SHARED_LINKS,
  { href: "/supervisor/reviews", label: "Reviews" },
  { href: "/supervisor/evaluations", label: "Evaluations" },
  { href: "/supervisor/onboarding", label: "My school" },
];

const ADMIN_LINKS: NavItem[] = [
  ...SHARED_LINKS,
  { href: "/admin/users", label: "Users" },
];

function navForRole(role: Profile["role"]): NavItem[] {
  if (role === "student") {
    return STUDENT_LINKS;
  }
  if (role === "employer") {
    return EMPLOYER_LINKS;
  }
  if (role === "supervisor") {
    return SUPERVISOR_LINKS;
  }
  if (role === "admin") {
    return ADMIN_LINKS;
  }
  return SHARED_LINKS;
}

const SidebarItems = () => {
  const pathname = usePathname();
  const trpc = useTRPC();
  const { data: profile } = useQuery(trpc.profile.me.queryOptions());
  const mounted = useMounted();

  if (!mounted) {
    // Return nothing until the component is mounted because the SidebarMenuSkeleton is using Math.random() to generate the width which is not safe to use in a server component
    return null;
  }

  if (!profile) {
    return (
      <SidebarMenu>
        <SidebarMenuSkeleton />
        <SidebarMenuSkeleton />
        <SidebarMenuSkeleton />
      </SidebarMenu>
    );
  }

  const items = navForRole(profile.role);

  return (
    <SidebarMenu>
      {items.map((item) => (
        <SidebarMenuItem key={item.label}>
          <SidebarMenuButton asChild isActive={pathname.startsWith(item.href)}>
            <Link href={item.href}>{item.label}</Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
};

export default SidebarItems;
