"use client";

import { usePathname } from "next/navigation";
import { useI18n } from "@/locales/client";

type TitleKey =
  | "pageTitle.home"
  | "pageTitle.offers"
  | "pageTitle.applications"
  | "pageTitle.myOffers"
  | "pageTitle.newOffer"
  | "pageTitle.employerOnboarding"
  | "pageTitle.studentOnboarding"
  | "pageTitle.supervisorOnboarding"
  | "pageTitle.supervisorReviews"
  | "pageTitle.supervisorReviewDetail"
  | "pageTitle.supervisorEvaluations"
  | "pageTitle.adminUsers"
  | "pageTitle.offerDetail"
  | "pageTitle.editOffer"
  | "pageTitle.employerApplications"
  | "pageTitle.applicationDetail";

const EXACT_TITLES: ReadonlyArray<readonly [string | RegExp, TitleKey]> = [
  ["/home", "pageTitle.home"],
  ["/offers", "pageTitle.offers"],
  ["/student/applications", "pageTitle.applications"],
  [/^\/student\/applications\/[^/]+$/, "pageTitle.applicationDetail"],
  ["/employer/offers/new", "pageTitle.newOffer"],
  ["/employer/offers", "pageTitle.myOffers"],
  ["/employer/onboarding", "pageTitle.employerOnboarding"],
  ["/student/onboarding", "pageTitle.studentOnboarding"],
  ["/supervisor/onboarding", "pageTitle.supervisorOnboarding"],
  ["/supervisor/reviews", "pageTitle.supervisorReviews"],
  [/^\/supervisor\/reviews\/[^/]+$/, "pageTitle.supervisorReviewDetail"],
  ["/supervisor/evaluations", "pageTitle.supervisorEvaluations"],
  ["/admin/users", "pageTitle.adminUsers"],
  [/^\/offers\/[^/]+$/, "pageTitle.offerDetail"],
  [/^\/employer\/offers\/[^/]+\/edit$/, "pageTitle.editOffer"],
  [
    /^\/employer\/offers\/[^/]+\/applications$/,
    "pageTitle.employerApplications",
  ],
];

function titleKeyForPath(path: string): TitleKey | null {
  const normalized =
    path === "" ? "/" : path.startsWith("/") ? path : `/${path}`;
  for (const [matcher, key] of EXACT_TITLES) {
    if (typeof matcher === "string") {
      if (matcher === normalized) return key;
    } else if (matcher.test(normalized)) {
      return key;
    }
  }
  return null;
}

export function ShellPageTitle() {
  const t = useI18n();
  const pathname = usePathname() ?? "/";
  const key = titleKeyForPath(pathname);

  const title = key
    ? t(key)
    : (pathname
        .split("/")
        .filter(Boolean)
        .at(-1)
        ?.split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ") ?? "Home");

  return <h1 className="text-lg font-semibold tracking-tight">{title}</h1>;
}
