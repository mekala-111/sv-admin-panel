import { cookies } from "next/headers";

const API_URL = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || "http://localhost:4000/api";

export const AUTH_COOKIE = "sv_admin_access";
export const REFRESH_COOKIE = "sv_admin_refresh";
export const USER_COOKIE = "sv_admin_user";

type ApiEnvelope<T> = {
  success: boolean;
  data: T;
  meta?: Record<string, unknown>;
  error?: { code: string; message: string };
};

export type AdminSessionUser = {
  id: string;
  name: string;
  email: string;
  role: string;
};

export async function getAccessToken(): Promise<string | null> {
  const store = await cookies();
  return store.get(AUTH_COOKIE)?.value ?? null;
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit & { auth?: boolean } = {}
): Promise<{ data: T; meta?: Record<string, unknown> }> {
  const { auth = true, headers, ...rest } = options;
  const h = new Headers(headers);
  h.set("Content-Type", "application/json");

  if (auth) {
    const token = await getAccessToken();
    if (token) h.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(`${API_URL}${path.startsWith("/") ? path : `/${path}`}`, {
    ...rest,
    headers: h,
    cache: "no-store",
  });

  const json = (await res.json().catch(() => ({}))) as ApiEnvelope<T>;
  if (!res.ok || json.success === false) {
    throw new Error(json.error?.message || `API ${res.status}: ${path}`);
  }
  return { data: json.data, meta: json.meta };
}

export async function apiLogin(email: string, password: string) {
  return apiFetch<{
    user: { id: string; name: string; email: string; role: string };
    accessToken: string;
    refreshToken: string;
  }>("/auth/login", {
    method: "POST",
    auth: false,
    body: JSON.stringify({ email, password }),
  });
}

export function formatINR(amount: number | string | null | undefined) {
  const n = typeof amount === "string" ? Number(amount) : amount ?? 0;
  if (Number.isNaN(n)) return "₹0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

export function mapVendorStatus(s?: string): "Active" | "Pending" | "Suspended" {
  if (s === "ACTIVE") return "Active";
  if (s === "SUSPENDED") return "Suspended";
  return "Pending";
}

export function mapEventStatus(s?: string): "Live" | "Completed" | "Upcoming" | "Cancelled" {
  if (s === "LIVE") return "Live";
  if (s === "COMPLETED") return "Completed";
  if (s === "CANCELLED" || s === "EXPIRED") return "Cancelled";
  return "Upcoming";
}

export function mapPaymentStatus(s?: string): "Successful" | "Pending" | "Failed" | "Refunded" {
  if (s === "SUCCESS") return "Successful";
  if (s === "FAILED") return "Failed";
  if (s === "REFUNDED") return "Refunded";
  return "Pending";
}

export function fmtDate(d?: string | Date | null) {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
