/** Notification fetchers for the admin panel (the logged-in admin's own notifications). */

import { api } from "@/lib/api";

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  data: Record<string, unknown> | null;
  isRead: boolean;
  createdAt: string;
}

/** Uses the paginated meta.total under an unreadOnly filter rather than a dedicated count endpoint. */
export async function fetchUnreadNotificationCount(): Promise<number> {
  const { meta } = await api.getList<Notification>("/notifications", {
    params: { page: 1, limit: 1, unreadOnly: true },
  });
  return meta.total;
}

export async function fetchNotifications(params: { page?: number; limit?: number; unreadOnly?: boolean } = {}) {
  const { page = 1, limit = 20, unreadOnly } = params;
  const { items, meta } = await api.getList<Notification>("/notifications", {
    params: { page, limit, ...(unreadOnly ? { unreadOnly: true } : {}) },
  });
  return { items, page: meta.page, totalPages: meta.totalPages, total: meta.total };
}
