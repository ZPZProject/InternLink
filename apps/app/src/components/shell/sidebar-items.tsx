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
import { useI18n } from "@/locales/client";
import { useMounted } from "@/hooks/use-mounted";
import { useTRPC } from "@/trpc/react";

type Profile = Tables<"profiles">;

type NavItem = { href: string; labelKey: string };

const SHARED_LINKS: NavItem[] = [
  { href: "/home", labelKey: "nav.home" },
  { href: "/offers", labelKey: "nav.offers" },
];

const STUDENT_LINKS: NavItem[] = [
  ...SHARED_LINKS,
  { href: "/student/applications", labelKey: "nav.applications" },
];

const EMPLOYER_LINKS: NavItem[] = [
  ...SHARED_LINKS,
  { href: "/employer/offers", labelKey: "nav.myOffers" },
];

const SUPERVISOR_LINKS: NavItem[] = [
  ...SHARED_LINKS,
  { href: "/supervisor/reviews", labelKey: "nav.reviews" },
  { href: "/supervisor/evaluations", labelKey: "nav.evaluations" },
  { href: "/supervisor/onboarding", labelKey: "nav.mySchool" },
];

const ADMIN_LINKS: NavItem[] = [
  ...SHARED_LINKS,
  { href: "/admin/users", labelKey: "nav.users" },
];

function navForRole(role: Profile["role"]): NavItem[] {
  if (role === "student") return STUDENT_LINKS;
  if (role === "employer") return EMPLOYER_LINKS;
  if (role === "supervisor") return SUPERVISOR_LINKS;
  if (role === "admin") return ADMIN_LINKS;
  return SHARED_LINKS;
}

const SidebarItems = () => {
  const t = useI18n();
  const pathname = usePathname();
  const trpc = useTRPC();
  const { data: profile } = useQuery(trpc.profile.me.queryOptions());
  const mounted = useMounted();

  if (!mounted) {
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
        <SidebarMenuItem key={item.href}>
          <SidebarMenuButton asChild isActive={pathname.startsWith(item.href)}>
            <Link href={item.href}>{t(item.labelKey as Parameters<typeof t>[0])}</Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
};

export default SidebarItems;
