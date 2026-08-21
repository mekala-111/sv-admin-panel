/** Generic key-value platform settings fetchers for the admin panel. No keys are seeded by default. */

import { api, ApiError } from "@/lib/api";

export interface Setting {
  key: string;
  value: unknown;
  updatedAt: string;
}

export async function fetchSettings(): Promise<Setting[]> {
  return api.get<Setting[]>("/settings");
}

export async function fetchSetting(key: string): Promise<Setting | null> {
  try {
    return await api.get<Setting>(`/settings/${key}`);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}
