/**
 * Backend list endpoints (events, payments, wallet tx, recordings) only return raw
 * vendorId/customerId foreign keys — no nested vendor/customer objects. Admin tables need
 * human-readable names, so these build id -> display-name maps for a single extra request each.
 * Capped at 100 (the backend's max page size) — fine at this platform's scale, not a
 * general-purpose solution for a vendor/customer base beyond that.
 */

import { api } from "@/lib/api";

export async function fetchVendorNameMap(): Promise<Map<string, string>> {
  const { items } = await api.getList<{ id: string; companyName: string }>("/vendors", {
    params: { page: 1, limit: 100 },
  });
  return new Map(items.map((v) => [v.id, v.companyName]));
}

export async function fetchCustomerNameMap(): Promise<Map<string, string>> {
  const { items } = await api.getList<{ id: string; name: string }>("/customers", {
    params: { page: 1, limit: 100 },
  });
  return new Map(items.map((c) => [c.id, c.name]));
}
