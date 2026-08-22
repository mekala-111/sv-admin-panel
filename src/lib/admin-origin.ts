import type { NextRequest } from "next/server";

/**
 * Absolute public origin for redirects (login → dashboard, proxy guards).
 * Prefer NEXT_PUBLIC_ADMIN_BASE_URL so reverse-proxy internal hosts
 * (e.g. 127.0.0.1:3456) never leak into Location headers.
 */
export function adminPublicOrigin(req?: NextRequest): string {
  const configured = (
    process.env.NEXT_PUBLIC_ADMIN_BASE_URL ||
    process.env.ADMIN_BASE_URL ||
    ""
  ).replace(/\/$/, "");
  if (configured) return configured;

  if (req) {
    const proto = req.headers.get("x-forwarded-proto");
    const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
    if (host) {
      const scheme = proto || (host.includes("localhost") || host.startsWith("127.") ? "http" : "https");
      return `${scheme}://${host}`;
    }
    try {
      return new URL(req.url).origin;
    } catch {
      /* fall through */
    }
  }

  return "http://localhost:3000";
}

export function adminAbsoluteUrl(path: string, req?: NextRequest): URL {
  const origin = adminPublicOrigin(req);
  return new URL(path.startsWith("/") ? path : `/${path}`, origin);
}
