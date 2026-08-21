/** Admin dashboard overview & platform analytics fetchers. */

import { api } from "@/lib/api";

export interface AdminOverview {
  vendors: number;
  customers: number;
  events: number;
  liveEvents: number;
  pendingVendors: number;
}

export interface AdminAnalytics {
  vendors: number;
  customers: number;
  events: number;
  liveEvents: number;
  revenue: number;
  successfulPayments: number;
}

export async function fetchAdminOverview(): Promise<AdminOverview> {
  return api.get<AdminOverview>("/admin/overview");
}

/** Note: the backend endpoint takes no query params — it always returns all-time platform totals. */
export async function fetchAdminAnalytics(): Promise<AdminAnalytics> {
  return api.get<AdminAnalytics>("/admin/analytics");
}
