import { createServerClient } from "@supabase/ssr";
import type { NextRequest, NextResponse } from "next/server";
import type { User } from "../types";

export interface ProtectedPath {
  /**
   * Path to protect.
   * It matches request pathname against this path using native js regex.
   *
   * Can be a string, array of strings, RegExp or array of RegExp.
   */
  path: string | RegExp | (string | RegExp)[];
  /**
   * Test function to determine if user is allowed to access the path.
   *
   * Gets supabase user object as argument and should return a boolean or Promise<boolean>.
   */
  test: (user: User | null) => boolean | Promise<boolean>;
  /**
   * Function called when user is not allowed to access the path.
   *
   * You can redirect user to login page here.
   */
  onFail: (request: NextRequest) => NextResponse;
  onPass?: (request: NextRequest) => NextResponse;
}

export const updateSession = async (
  request: NextRequest,
  response: NextResponse,
) => {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }

          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  // This is to ensure the session is updated
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { response, user };
};

export const createAuthMiddleware = async (
  protectedPaths: ProtectedPath[],
  I18nMiddleware?: (request: NextRequest) => NextResponse<unknown>,
) => {
  const regexpProtectedPaths = protectedPaths.map((config) => ({
    match: Array.isArray(config.path)
      ? config.path.map((p) => (typeof p === "string" ? new RegExp(p) : p))
      : typeof config.path === "string"
        ? new RegExp(config.path)
        : config.path,
    ...config,
  }));

  return async function middleware(
    request: NextRequest,
    response: NextResponse,
  ) {
    const { user, response: updatedResponse } = await updateSession(
      request,
      I18nMiddleware ? I18nMiddleware(request) : response,
    );

    const matchingPath = regexpProtectedPaths.find(({ match }) =>
      Array.isArray(match)
        ? match.some((m) => m.test(request.nextUrl.pathname))
        : match.test(request.nextUrl.pathname),
    );

    if (matchingPath) {
      const allowed = await matchingPath.test(user);

      if (!allowed) {
        return matchingPath.onFail(request);
      }

      if (matchingPath.onPass) {
        return matchingPath.onPass(request);
      }
    }

    return updatedResponse;
  };
};
