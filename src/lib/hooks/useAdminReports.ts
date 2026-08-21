/** Report fetchers for the admin panel. */

import { api } from "@/lib/api";

export interface EventsSummaryRow {
  status: "DRAFT" | "UPCOMING" | "LIVE" | "COMPLETED" | "CANCELLED" | "EXPIRED";
  count: number;
}

export interface RevenueSummary {
  totalRevenue: number;
  successfulPayments: number;
}

export interface TopVendorRow {
  vendorId: string;
  companyName: string | undefined;
  eventCount: number;
}

export async function fetchEventsSummary(): Promise<EventsSummaryRow[]> {
  return api.get<EventsSummaryRow[]>("/reports/events-summary");
}

export async function fetchRevenueSummary(): Promise<RevenueSummary> {
  return api.get<RevenueSummary>("/reports/revenue-summary");
}

export async function fetchTopVendors(): Promise<TopVendorRow[]> {
  return api.get<TopVendorRow[]>("/reports/top-vendors");
}
