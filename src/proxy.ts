import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { adminAbsoluteUrl } from "@/lib/admin-origin";
import { attachRefreshedSessionCookies } from "@/lib/session-cookies";

const PUBLIC = ["/login", "/preview"];
const ADMIN_BASE =
  process.env.NEXT_PUBLIC_ADMIN_BASE_URL || process.env.ADMIN_BASE_URL || "";

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

export async function proxy(request: NextRequest) {
  const access = request.cookies.get("sv_admin_access")?.value;
  const refresh = request.cookies.get("sv_admin_refresh")?.value;
  const authed = Boolean(access || refresh);
  const { pathname } = request.nextUrl;

  if (pathname === "/") {
    return NextResponse.redirect(adminAbsoluteUrl(authed ? "/dashboard" : "/login", request));
  }

  if (isPublicThemeAsset(pathname)) {
    return NextResponse.next();
  }

  const isPublic = PUBLIC.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  if (!isPublic && !authed) {
    return NextResponse.redirect(adminAbsoluteUrl("/login", request));
  }
  if (pathname === "/login" && authed) {
    return NextResponse.redirect(adminAbsoluteUrl("/dashboard", request));
  }

  const res = NextResponse.next();
  if (refresh) {
    return attachRefreshedSessionCookies(
      request,
      res,
      { access: "sv_admin_access", refresh: "sv_admin_refresh" },
      ADMIN_BASE
    );
  }
  return res;
}

export const config = {
  matcher: ["/", "/login", "/preview/:path*", "/dashboard/:path*", "/vendors/:path*", "/customers/:path*", "/events/:path*", "/themes/:path*", "/youtube/:path*", "/recordings/:path*", "/payments/:path*", "/wallet/:path*", "/pricing/:path*", "/analytics/:path*", "/reports/:path*", "/notifications/:path*", "/support/:path*", "/users-roles/:path*", "/settings/:path*", "/audit-logs/:path*", "/profile/:path*"],
};
