/** Platform staff users + permission matrix fetchers for the admin panel. */

import { api } from "@/lib/api";

export type StaffRole = "SUPER_ADMIN" | "ADMIN" | "VENDOR" | "CUSTOMER";
export type UserStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED" | "PENDING";

export interface AdminStaffUser {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: StaffRole;
  status: UserStatus;
  emailVerified: boolean;
  phoneVerified: boolean;
  lastLogin: string | null;
  createdAt: string;
  updatedAt: string;
}

export async function fetchAdminUsers(params: { page?: number } = {}) {
  const { page = 1 } = params;
  const { items, meta } = await api.getList<AdminStaffUser>("/admin/users", { params: { page, limit: 50 } });
  return { items, page: meta.page, totalPages: meta.totalPages, total: meta.total };
}

export interface Permission {
  id: string;
  code: string;
  module: string;
  description: string;
}

export interface RolePermission {
  id: string;
  role: string;
  permissionId: string;
  permission: Permission | null;
}

export async function fetchPermissions(): Promise<Permission[]> {
  return api.get<Permission[]>("/admin/permissions");
}

export async function fetchRolePermissions(role: string): Promise<RolePermission[]> {
  return api.get<RolePermission[]>(`/admin/permissions/role/${role}`);
}
