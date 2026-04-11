import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import type { Client, User } from "../types";
import type { Database } from "../types/db";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

/** Auth user merged with `profiles` row. `role` is the app role from `profiles`, not Supabase JWT `role`. */
export type UserWithProfile = Omit<User, "role"> & Profile;

export type UpdateSessionResult = {
  response: NextResponse;
  supabase: Client;
  auth: UserWithProfile | null;
};

export type ProtectedPathFailContext = {
  supabase: Client;
  auth: UserWithProfile | null;
};

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
   */
  test: (
    ctx: ProtectedPathFailContext,
    request: NextRequest,
  ) => boolean | Promise<boolean>;
  /**
   * Called when `test` returns false.
   */
  onFail: (
    request: NextRequest,
    ctx: ProtectedPathFailContext,
  ) => NextResponse | Promise<NextResponse>;
  onPass?: (
    request: NextRequest,
    ctx: ProtectedPathFailContext,
  ) => NextResponse | Promise<NextResponse>;
}

async function getProfileByUserId(
  supabase: Client,
  userId: string,
): Promise<Profile | null> {
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error || !profile) return null;
  return profile;
}

export const updateSession = async (
  request: NextRequest,
  response: NextResponse,
): Promise<UpdateSessionResult> => {
  const supabase = createServerClient<Database>(
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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const profile = user ? await getProfileByUserId(supabase, user.id) : null;
  const auth =
    user && profile
      ? ({ ...user, ...profile } as UserWithProfile)
      : null;

  return { response, supabase, auth };
};

/** Whether this profile has a `company_members` row (employer linked to a company). */
export async function getEmployerHasCompanyMembership(
  supabase: Client,
  profileId: string,
): Promise<boolean> {
  const { data, error } = await supabase
    .from("company_members")
    .select("profile_id")
    .eq("profile_id", profileId)
    .maybeSingle();

  if (error) {
    return false;
  }
  return data !== null;
}

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

  return async function middleware(request: NextRequest) {
    const forward = NextResponse.next();

    const {
      auth,
      response: updatedResponse,
      supabase,
    } = await updateSession(
      request,
      I18nMiddleware ? I18nMiddleware(request) : forward,
    );

    const matchingPath = regexpProtectedPaths.find(({ match }) =>
      Array.isArray(match)
        ? match.some((m) => m.test(request.nextUrl.pathname))
        : match.test(request.nextUrl.pathname),
    );

    if (matchingPath) {
      const failCtx: ProtectedPathFailContext = { supabase, auth };
      const allowed = await matchingPath.test(failCtx, request);

      if (!allowed) {
        return await Promise.resolve(matchingPath.onFail(request, failCtx));
      }

      if (matchingPath.onPass) {
        return await Promise.resolve(matchingPath.onPass(request, failCtx));
      }
    }

    return updatedResponse;
  };
};
