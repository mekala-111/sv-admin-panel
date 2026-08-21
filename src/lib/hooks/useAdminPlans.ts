/** Plan fetchers for the admin panel. */

import { api } from "@/lib/api";

export interface Plan {
  id: string;
  name: string;
  code: string;
  price: number;
  currency: string;
  billingPeriod: string;
  eventLimit: number;
  hoursLimit: number;
  storageGb: number;
  viewerLimit: number;
  features: Record<string, unknown>;
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
  updatedAt: string;
}

export async function fetchPlans(status?: "ACTIVE" | "INACTIVE"): Promise<Plan[]> {
  return api.get<Plan[]>("/plans", { params: status ? { status } : {} });
}
