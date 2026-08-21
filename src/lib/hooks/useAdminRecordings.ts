/** Recording fetchers for the admin panel. */

import { api } from "@/lib/api";

export interface Recording {
  id: string;
  eventId: string;
  vendorId: string;
  youtubeVideoId: string | null;
  fileUrl: string | null;
  thumbnailUrl: string | null;
  sizeBytes: number;
  durationSec: number;
  status: string;
  createdAt: string;
}

export async function fetchRecordings(params: { page?: number; eventId?: string } = {}) {
  const { page = 1, eventId } = params;
  const query: Record<string, string | number> = { page, limit: 20 };
  if (eventId) query.eventId = eventId;

  const { items, meta } = await api.getList<Recording>("/recordings", { params: query });
  return { items, page: meta.page, totalPages: meta.totalPages, total: meta.total };
}

export function formatBytes(bytes: number): string {
  if (!bytes) return "0 GB";
  const gb = bytes / 1024 ** 3;
  return gb >= 1 ? `${gb.toFixed(1)} GB` : `${(bytes / 1024 ** 2).toFixed(0)} MB`;
}
