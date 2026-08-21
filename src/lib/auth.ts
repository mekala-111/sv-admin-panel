"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { api, type AuthResponse } from "./api";
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE, USER_COOKIE } from "./cookies";

export type AdminRole = "ADMIN" | "SUPER_ADMIN";

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
};

export async function login(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const remember = formData.get("remember") === "on";

  if (!email.includes("@") || !password) {
    redirect("/login?error=1");
  }

  // `redirect()` interrupts execution by throwing — it must never be called inside
  // this try block, or the catch below would swallow a successful login as an error.
  let response: AuthResponse;
  try {
    response = await api.post<AuthResponse>("/auth/login", { email, password });

    if (!response.accessToken || !response.refreshToken) {
      throw new Error("Backend did not return tokens");
    }
    if (response.user.role !== "ADMIN" && response.user.role !== "SUPER_ADMIN") {
      throw new Error("Not an admin account");
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Login failed. Please try again.";
    console.error("Login error:", errorMessage);
    redirect("/login?error=1");
  }

  const store = await cookies();
  const cookieOptions = {
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    ...(remember ? { maxAge: 60 * 60 * 24 * 30 } : {}),
  };

  store.set(ACCESS_TOKEN_COOKIE, response.accessToken, cookieOptions);
  store.set(REFRESH_TOKEN_COOKIE, response.refreshToken, cookieOptions);

  store.set(
    USER_COOKIE,
    JSON.stringify({
      id: response.user.id,
      name: response.user.name,
      email: response.user.email,
      role: response.user.role,
    }),
    {
      httpOnly: false, // Accessible to client-side (Topbar/Sidebar avatar)
      sameSite: "lax",
      path: "/",
      secure: process.env.NODE_ENV === "production",
      ...(remember ? { maxAge: 60 * 60 * 24 * 30 } : {}),
    }
  );

  redirect("/dashboard");
}

export async function logout() {
  const store = await cookies();

  try {
    const refreshToken = store.get(REFRESH_TOKEN_COOKIE)?.value;
    if (refreshToken) {
      await api.post("/auth/logout", { refreshToken });
    }
  } catch (error) {
    console.error("Logout API call failed:", error);
  }

  store.delete(ACCESS_TOKEN_COOKIE);
  store.delete(REFRESH_TOKEN_COOKIE);
  store.delete(USER_COOKIE);

  redirect("/login");
}

/** Get the current admin user from the (non-httpOnly) user cookie set at login. */
export async function getAdminUser(): Promise<AdminUser | null> {
  const store = await cookies();
  const userCookie = store.get(USER_COOKIE)?.value;
  if (!userCookie) return null;

  try {
    return JSON.parse(userCookie) as AdminUser;
  } catch {
    return null;
  }
}
