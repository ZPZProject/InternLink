"use client";

import { usePathname } from "next/navigation";

const EXACT_TITLES: ReadonlyArray<readonly [string | RegExp, string]> = [
  ["/home", "Home"],
  ["/offers", "Offers"],
  ["/applications", "Applications"],
  ["/employer/offers", "My offers"],
  ["/employer/offers/new", "New offer"],
  ["/employer/onboarding", "Onboarding"],
  ["/student/onboarding", "Onboarding"],
  ["/supervisor/onboarding", "My school"],
  ["/users", "Users"],
  [/^\/offers\/[^/]+$/, "Offer"],
  [/^\/employer\/offers\/[^/]+\/edit$/, "Edit offer"],
];

function titleForPath(path: string): string {
  const normalized =
    path === "" ? "/" : path.startsWith("/") ? path : `/${path}`;
  for (const [matcher, title] of EXACT_TITLES) {
    if (typeof matcher === "string") {
      if (matcher === normalized) {
        return title;
      }
    } else if (matcher.test(normalized)) {
      return title;
    }
  }
  const segments = normalized.split("/").filter(Boolean);
  const last = segments.at(-1);
  if (!last) {
    return "Home";
  }
  return last
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function ShellPageTitle() {
  const pathname = usePathname() ?? "/";
  const pageTitle = titleForPath(pathname);

  return <h1 className="text-lg font-semibold tracking-tight">{pageTitle}</h1>;
}
