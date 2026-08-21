"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { api, ApiError } from "./api";
import type { Theme } from "./hooks/useAdminThemes";

function errorRedirect(to: string, message: string): never {
  redirect(`${to}?error=${encodeURIComponent(message)}`);
}

function str(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

function parseConfig(raw: string, redirectTo: string): Record<string, unknown> {
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    errorRedirect(redirectTo, "Config must be valid JSON.");
  }
}

export async function createThemeAction(formData: FormData) {
  const name = str(formData, "name");
  if (name.length < 2) errorRedirect("/themes/0/edit", "Theme name must be at least 2 characters.");

  const categoryId = str(formData, "categoryId");
  const status = str(formData, "status") || "DRAFT";
  const config = parseConfig(str(formData, "config"), "/themes/0/edit");

  let theme: Theme;
  try {
    theme = await api.post<Theme>("/themes", {
      name,
      ...(categoryId ? { categoryId } : {}),
      status,
      config,
    });
  } catch (error) {
    const message = error instanceof ApiError ? error.message : "Failed to create theme.";
    errorRedirect("/themes/0/edit", message);
  }

  revalidatePath("/themes");
  redirect(`/themes/${theme.id}/edit`);
}

export async function updateThemeAction(id: string, formData: FormData) {
  const name = str(formData, "name");
  if (name.length < 2) errorRedirect(`/themes/${id}/edit`, "Theme name must be at least 2 characters.");

  const categoryId = str(formData, "categoryId");
  const status = str(formData, "status");
  const configRaw = str(formData, "config");

  try {
    await api.patch(`/themes/${id}`, {
      name,
      ...(categoryId ? { categoryId } : {}),
      ...(status ? { status } : {}),
      ...(configRaw ? { config: parseConfig(configRaw, `/themes/${id}/edit`) } : {}),
    });
  } catch (error) {
    const message = error instanceof ApiError ? error.message : "Failed to update theme.";
    errorRedirect(`/themes/${id}/edit`, message);
  }

  revalidatePath("/themes");
  revalidatePath(`/themes/${id}/edit`);
  redirect(`/themes/${id}/edit`);
}

export async function assignThemeToVendorAction(themeId: string, formData: FormData) {
  const vendorId = str(formData, "vendorId");
  if (!vendorId) errorRedirect("/themes/assignments", "Select a vendor first.");

  const isEnabled = formData.get("isEnabled") === "on";
  const isDefault = formData.get("isDefault") === "on";

  try {
    await api.post(`/themes/${themeId}/assign-vendor`, { vendorId, isEnabled, isDefault });
  } catch (error) {
    const message = error instanceof ApiError ? error.message : "Failed to assign theme.";
    errorRedirect("/themes/assignments", message);
  }

  revalidatePath("/themes/assignments");
  redirect("/themes/assignments");
}

export async function duplicateThemeAction(id: string, formData: FormData) {
  void formData;
  let theme: Theme;
  try {
    theme = await api.post<Theme>(`/themes/${id}/duplicate`);
  } catch (error) {
    const message = error instanceof ApiError ? error.message : "Failed to duplicate theme.";
    errorRedirect("/themes", message);
  }

  revalidatePath("/themes");
  redirect(`/themes/${theme.id}/edit`);
}

export async function createThemeCategoryAction(formData: FormData) {
  const name = str(formData, "name");
  if (name.length < 2) errorRedirect("/themes/categories", "Category name must be at least 2 characters.");

  try {
    await api.post("/themes/categories", { name });
  } catch (error) {
    const message = error instanceof ApiError ? error.message : "Failed to create category.";
    errorRedirect("/themes/categories", message);
  }

  revalidatePath("/themes/categories");
  redirect("/themes/categories");
}
