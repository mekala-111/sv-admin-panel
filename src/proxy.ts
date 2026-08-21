import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ACCESS_TOKEN_COOKIE = "admin_access_token";
const REFRESH_TOKEN_COOKIE = "admin_refresh_token";

const PUBLIC_PATHS = ["/login"];

export function proxy(request: NextRequest) {
  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;
  const hasValidAuth = !!accessToken && !!refreshToken;

  const { pathname } = request.nextUrl;
  const isPublic = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  if (!isPublic && pathname !== "/" && !hasValidAuth) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if ((pathname === "/login" || pathname === "/") && hasValidAuth) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
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
