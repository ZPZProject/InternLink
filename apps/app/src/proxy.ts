import {
  createAuthMiddleware,
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

const protectedPaths: ProtectedPath[] = [
  // home
  {
    path: "/home",
    test: (user) => user !== null,
    onFail: (request) => NextResponse.redirect(new URL("/login", request.url)),
  },
  // login/register
  {
    path: ["/login", "/register"],
    test: (user) => user === null,
    onFail: (request) => NextResponse.redirect(new URL("/home", request.url)),
  },
];

export const proxy = await createAuthMiddleware(protectedPaths, I18nMiddleware);

export const config = {
  matcher: [
    "/((?!_next/static|api|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
