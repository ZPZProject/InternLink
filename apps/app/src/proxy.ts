import {
  createAuthMiddleware,
  getEmployerHasCompanyMembership,
  type ProtectedPath,
} from "@v1/supabase/middleware";
import { NextResponse } from "next/server";
import { createI18nMiddleware } from "next-international/middleware";
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from "./locales";

const I18nMiddleware = createI18nMiddleware({
  locales: SUPPORTED_LOCALES,
  defaultLocale: DEFAULT_LOCALE,
  urlMappingStrategy: "rewrite",
});

/** Paths that use the dashboard layout and require login; employers need a company (or onboarding). */
const dashboardPathPatterns: (string | RegExp)[] = [
  /\/home(\/|\?|$)/,
  /\/(en|pl)\/home(\/|\?|$)/,
  /\/offers(\/|$)/,
  /\/(en|pl)\/offers(\/|$)/,
];

const protectedPaths: ProtectedPath[] = [
  {
    path: ["/login", "/register"],
    test: (ctx, _request) => ctx.auth === null,
    onFail: (request, _ctx) =>
      NextResponse.redirect(new URL("/home", request.url)),
  },
  {
    path: dashboardPathPatterns,
    test: async (ctx, _request) => {
      if (!ctx.auth) return false;
      if (ctx.auth.role !== "employer") return true;
      return getEmployerHasCompanyMembership(ctx.supabase, ctx.auth.id);
    },
    onFail: (request, { auth }) => {
      if (!auth) {
        return NextResponse.redirect(new URL("/login", request.url));
      }
      return NextResponse.redirect(
        new URL("/employer/onboarding", request.url),
      );
    },
  },
  {
    path: /\/employer(\/|$)/,
    test: async (ctx, request) => {
      if (!ctx.auth) return false;
      if (ctx.auth.role !== "employer") return false;
      if (request.nextUrl.pathname.includes("/employer/onboarding")) {
        return true;
      }
      return getEmployerHasCompanyMembership(ctx.supabase, ctx.auth.id);
    },
    onFail: (request, { auth }) => {
      if (!auth) {
        return NextResponse.redirect(new URL("/login", request.url));
      }
      if (auth.role !== "employer") {
        return NextResponse.redirect(new URL("/home", request.url));
      }
      return NextResponse.redirect(
        new URL("/employer/onboarding", request.url),
      );
    },
  },
];

export const proxy = await createAuthMiddleware(protectedPaths, I18nMiddleware);

export const config = {
  matcher: [
    "/((?!_next/static|api|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
