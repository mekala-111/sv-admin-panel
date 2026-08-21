/** Vendor fetchers for the admin panel (full CRUD scope, unlike vendor self-service). */

import { api, ApiError } from "@/lib/api";

export type VendorStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED" | "PENDING_APPROVAL";

export interface VendorBranding {
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  logo?: string;
  favicon?: string;
  customDomain?: string;
  supportEmail?: string;
}

export interface Vendor {
  id: string;
  userId: string;
  companyName: string;
  vendorCode: string;
  logo: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  status: VendorStatus;
  planId: string | null;
  eventCreationFee: number;
  whatsappNumber: string | null;
  whatsappEnabled: boolean;
  branding: VendorBranding;
  createdAt: string;
  updatedAt: string;
}

export async function fetchVendors(params: { page?: number; search?: string } = {}) {
  const { page = 1, search } = params;
  const query: Record<string, string | number> = { page, limit: 20 };
  if (search) query.search = search;

  const { items, meta } = await api.getList<Vendor>("/vendors", { params: query });
  return { items, page: meta.page, totalPages: meta.totalPages, total: meta.total };
}

/** Returns null when the vendor doesn't exist. */
export async function fetchVendorDetail(id: string): Promise<Vendor | null> {
  try {
    return await api.get<Vendor>(`/vendors/${id}`);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}
