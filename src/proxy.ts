import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC = ["/login"];

/** Guest pages load CSS/images from /public/themes/{slug}/ — must not require admin login. */
function isPublicThemeAsset(pathname: string): boolean {
  if (!pathname.startsWith("/themes/")) return false;

  const rest = pathname.slice("/themes/".length);
  if (!rest || rest === "new" || rest.startsWith("assignments") || rest.startsWith("categories")) {
    return false;
  }

  // Admin theme editor routes use UUIDs, e.g. /themes/{id}/edit
  if (/^[0-9a-f-]{36}(\/|$)/i.test(rest)) return false;

  return /\.(css|svg|png|jpe?g|webp|gif|mp3|woff2?|ttf|ico|js)$/i.test(pathname);
}

export function proxy(request: NextRequest) {
  const authed = request.cookies.has("sv_admin_access");
  const { pathname } = request.nextUrl;

  if (pathname === "/") {
    return NextResponse.redirect(new URL(authed ? "/dashboard" : "/login", request.url));
  }

  if (isPublicThemeAsset(pathname)) {
    return NextResponse.next();
  }

  const isPublic = PUBLIC.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  if (!isPublic && !authed) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (pathname === "/login" && authed) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/login", "/dashboard/:path*", "/vendors/:path*", "/customers/:path*", "/events/:path*", "/themes/:path*", "/youtube/:path*", "/recordings/:path*", "/payments/:path*", "/wallet/:path*", "/pricing/:path*", "/analytics/:path*", "/reports/:path*", "/notifications/:path*", "/support/:path*", "/users-roles/:path*", "/settings/:path*", "/audit-logs/:path*", "/profile/:path*"],
};
