"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { apiFetch, apiLogin, AUTH_COOKIE, REFRESH_COOKIE, USER_COOKIE } from "./api";
import { cookieSecureFlag } from "./session-cookies";

const ADMIN_BASE = process.env.NEXT_PUBLIC_ADMIN_BASE_URL || process.env.ADMIN_BASE_URL || "";

function rethrowRedirect(err: unknown) {
  if (
    typeof err === "object" &&
    err !== null &&
    "digest" in err &&
    typeof (err as { digest?: string }).digest === "string" &&
    (err as { digest: string }).digest.startsWith("NEXT_REDIRECT")
  ) {
    throw err;
  }
}

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const remember = formData.get("remember") === "on";

  if (!email || !password) redirect("/login?error=1");

  try {
    const { data } = await apiLogin(email, password);
    if (data.user.role !== "SUPER_ADMIN" && data.user.role !== "ADMIN") {
      redirect("/login?error=role");
    }
    const store = await cookies();
    // Always persist session cookies so refresh can renew the 15m access JWT.
    const maxAge = remember ? 60 * 60 * 24 * 30 : 60 * 60 * 24 * 7;
    const cookieOpts = {
      httpOnly: true,
      sameSite: "lax" as const,
      path: "/",
      secure: cookieSecureFlag(ADMIN_BASE),
      maxAge,
    };
    store.set(AUTH_COOKIE, data.accessToken, cookieOpts);
    store.set(REFRESH_COOKIE, data.refreshToken, cookieOpts);
    store.set(USER_COOKIE, JSON.stringify(data.user), cookieOpts);
  } catch (err) {
    rethrowRedirect(err);
    redirect("/login?error=1");
  }
  redirect("/dashboard");
}

export async function logoutAction() {
  const store = await cookies();
  const refresh = store.get(REFRESH_COOKIE)?.value;
  if (refresh) {
    try {
      await apiFetch("/auth/logout", {
        method: "POST",
        auth: false,
        body: JSON.stringify({ refreshToken: refresh }),
      });
    } catch {
      /* ignore */
    }
  }
  store.delete(AUTH_COOKIE);
  store.delete(REFRESH_COOKIE);
  store.delete(USER_COOKIE);
  redirect("/login");
}

export async function forgotPasswordAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) redirect("/login?step=forgot&error=1");
  try {
    await apiFetch("/auth/forgot-password", {
      method: "POST",
      auth: false,
      body: JSON.stringify({ email }),
    });
  } catch {
    /* still redirect — don't leak existence */
  }
  redirect(`/login?step=otp&email=${encodeURIComponent(email)}`);
}

export async function resetPasswordAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const code = String(formData.get("code") ?? "").trim();
  const newPassword = String(formData.get("password") ?? "");
  if (!email || !code || !newPassword) redirect("/login?step=reset&error=1");
  try {
    await apiFetch("/auth/reset-password", {
      method: "POST",
      auth: false,
      body: JSON.stringify({ email, code, newPassword }),
    });
  } catch (err) {
    rethrowRedirect(err);
    redirect("/login?step=reset&error=1");
  }
  redirect("/login?reset=1");
}
