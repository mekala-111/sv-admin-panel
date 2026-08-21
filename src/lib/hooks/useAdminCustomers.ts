/** Customer fetchers for the admin panel (platform-wide, not vendor-scoped). */

import { api, ApiError } from "@/lib/api";

export type CustomerStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED";

export interface Customer {
  id: string;
  userId: string;
  vendorId: string;
  customerCode: string;
  name: string;
  phone: string | null;
  email: string | null;
  status: CustomerStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerListItem extends Customer {
  eventsCount: number;
}

export async function fetchCustomers(params: {
  page?: number;
  search?: string;
  status?: CustomerStatus | "";
} = {}) {
  const { page = 1, search, status } = params;
  const query: Record<string, string | number> = { page, limit: 20 };
  if (search) query.search = search;
  if (status) query.status = status;

  const { items, meta } = await api.getList<CustomerListItem>("/customers", { params: query });
  return { items, page: meta.page, totalPages: meta.totalPages, total: meta.total };
}

/** Returns null when the customer doesn't exist. */
export async function fetchCustomerDetail(id: string): Promise<Customer | null> {
  try {
    return await api.get<Customer>(`/customers/${id}`);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

/** No server-side vendorId filter exists on this endpoint — filtered client-side, fine at this platform's scale. */
export async function fetchCustomersByVendor(vendorId: string, limit = 100): Promise<CustomerListItem[]> {
  const { items } = await api.getList<CustomerListItem>("/customers", { params: { page: 1, limit } });
  return items.filter((c) => c.vendorId === vendorId);
}
