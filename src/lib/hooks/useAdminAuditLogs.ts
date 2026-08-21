/** Audit log fetchers for the admin panel. */

import { api } from "@/lib/api";

export interface AuditLog {
  id: string;
  userId: string;
  role: string | null;
  action: string;
  module: string;
  entityType: string | null;
  entityId: string | null;
  oldData: Record<string, unknown> | null;
  newData: Record<string, unknown> | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}

export async function fetchAuditLogs(params: { page?: number; module?: string; userId?: string } = {}) {
  const { page = 1, module, userId } = params;
  const query: Record<string, string | number> = { page, limit: 50 };
  if (module) query.module = module;
  if (userId) query.userId = userId;

  const { items, meta } = await api.getList<AuditLog>("/admin/audit-logs", { params: query });
  return { items, page: meta.page, totalPages: meta.totalPages, total: meta.total };
}
