"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { api, ApiError } from "./api";

function errorRedirect(to: string, message: string): never {
  redirect(`${to}?error=${encodeURIComponent(message)}`);
}

/** Grant/revoke are SUPER_ADMIN only server-side — the backend 403s an ADMIN caller, surfaced as an error redirect. */
export async function grantPermissionAction(role: string, permissionCode: string, formData: FormData) {
  void formData;
  try {
    await api.post(`/admin/permissions/role/${role}/grant`, { permissionCode });
  } catch (error) {
    const message = error instanceof ApiError ? error.message : "Failed to grant permission.";
    errorRedirect("/users-roles", message);
  }

  revalidatePath("/users-roles");
  redirect(`/users-roles?role=${role}`);
}

export async function revokePermissionAction(role: string, permissionCode: string, formData: FormData) {
  void formData;
  try {
    await api.post(`/admin/permissions/role/${role}/revoke`, { permissionCode });
  } catch (error) {
    const message = error instanceof ApiError ? error.message : "Failed to revoke permission.";
    errorRedirect("/users-roles", message);
  }

  revalidatePath("/users-roles");
  redirect(`/users-roles?role=${role}`);
}
