import { NextRequest, NextResponse } from "next/server";
import { apiLogin, AUTH_COOKIE, REFRESH_COOKIE, USER_COOKIE } from "@/lib/api";
import { adminAbsoluteUrl } from "@/lib/admin-origin";
import { cookieSecureFlag } from "@/lib/session-cookies";

const ADMIN_BASE = process.env.NEXT_PUBLIC_ADMIN_BASE_URL || process.env.ADMIN_BASE_URL || "";

function loginRedirect(req: NextRequest, query: string) {
  return NextResponse.redirect(adminAbsoluteUrl(`/login?${query}`, req), 303);
}

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const email = String(form.get("email") ?? "").trim();
  const password = String(form.get("password") ?? "");
  const remember = form.get("remember") === "on";

  if (!email || !password) return loginRedirect(req, "error=1");

  try {
    const { data } = await apiLogin(email, password);
    if (data.user.role !== "SUPER_ADMIN" && data.user.role !== "ADMIN") {
      return loginRedirect(req, "error=role");
    }

    const res = NextResponse.redirect(adminAbsoluteUrl("/dashboard", req), 303);
    const maxAge = remember ? 60 * 60 * 24 * 30 : 60 * 60 * 24 * 7;
    const cookieOpts = {
      httpOnly: true,
      sameSite: "lax" as const,
      path: "/",
      secure: cookieSecureFlag(ADMIN_BASE),
      maxAge,
    };
    res.cookies.set(AUTH_COOKIE, data.accessToken, cookieOpts);
    res.cookies.set(REFRESH_COOKIE, data.refreshToken, cookieOpts);
    res.cookies.set(USER_COOKIE, JSON.stringify(data.user), cookieOpts);
    return res;
  } catch (err) {
    const message = err instanceof Error ? err.message : "";
    if (/fetch failed|ECONNREFUSED|API 5\d\d/i.test(message)) {
      return loginRedirect(req, "error=api");
    }
    return loginRedirect(req, "error=1");
  }
}
