import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE, USER_COOKIE } from "@/lib/cookies";
import { attachRefreshedSessionCookies } from "@/lib/session-cookies";

const PUBLIC_PATHS = ["/login"];
const ADMIN_BASE = process.env.NEXT_PUBLIC_ADMIN_BASE_URL || process.env.ADMIN_BASE_URL || "";

export async function proxy(request: NextRequest) {
  // The access token lives 15 minutes; the refresh token is what keeps the session alive.
  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;
  const hasValidAuth = !!refreshToken;

  const { pathname } = request.nextUrl;

  // api.ts sends rejected sessions here; drop the stale cookies so /login doesn't bounce back to /dashboard.
  if (pathname === "/login" && request.nextUrl.searchParams.get("error") === "session") {
    const res = NextResponse.next();
    res.cookies.delete(ACCESS_TOKEN_COOKIE);
    res.cookies.delete(REFRESH_TOKEN_COOKIE);
    res.cookies.delete(USER_COOKIE);
    return res;
  }
  const isPublic = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  if (!isPublic && pathname !== "/" && !hasValidAuth) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if ((pathname === "/login" || pathname === "/") && hasValidAuth) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (!hasValidAuth) return NextResponse.next();

  // Swap an expired/expiring access token for a fresh pair before the page renders.
  return attachRefreshedSessionCookies(
    request,
    NextResponse.next(),
    { access: ACCESS_TOKEN_COOKIE, refresh: REFRESH_TOKEN_COOKIE },
    ADMIN_BASE
  );
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/dashboard/:path*",
    "/vendors/:path*",
    "/customers/:path*",
    "/events/:path*",
    "/themes/:path*",
    "/youtube/:path*",
    "/recordings/:path*",
    "/payments/:path*",
    "/wallet/:path*",
    "/pricing/:path*",
    "/analytics/:path*",
    "/reports/:path*",
    "/notifications/:path*",
    "/support/:path*",
    "/users-roles/:path*",
    "/settings/:path*",
    "/audit-logs/:path*",
    "/profile/:path*",
  ],
};
