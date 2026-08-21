/** Theme catalog fetchers for the admin panel. */

import { api, ApiError } from "@/lib/api";

export interface ThemeCategory {
  id: string;
  name: string;
  slug: string;
}

export interface Theme {
  id: string;
  name: string;
  slug: string;
  categoryId: string | null;
  previewImage: string | null;
  config: Record<string, unknown>;
  status: "ACTIVE" | "INACTIVE" | "DRAFT";
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface VendorThemeAssignment {
  id: string;
  vendorId: string;
  themeId: string;
  isEnabled: boolean;
  isDefault: boolean;
  theme: Theme;
}

export async function fetchThemes(): Promise<Theme[]> {
  return api.get<Theme[]>("/themes");
}

export async function fetchThemeDetail(id: string): Promise<Theme | null> {
  try {
    return await api.get<Theme>(`/themes/${id}`);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

export async function fetchThemeCategories(): Promise<ThemeCategory[]> {
  return api.get<ThemeCategory[]>("/themes/categories");
}

export async function fetchVendorAssignedThemes(vendorId: string): Promise<VendorThemeAssignment[]> {
  return api.get<VendorThemeAssignment[]>(`/themes/vendor-assigned/${vendorId}`);
}
