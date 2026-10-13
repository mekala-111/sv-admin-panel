"use server";

import { redirect } from "next/navigation";
import { apiCall } from "@/lib/api";
import { getThemeTemplate, type ThemeConfig } from "@/lib/theme-templates";

/** Keeps the `{ data }` shape these actions were written against. */
async function apiFetch<T = unknown>(path: string, init: RequestInit = {}): Promise<{ data: T }> {
  return { data: await apiCall<T>(path, init) };
}

function rethrowRedirect(err: unknown) {
  if (
    typeof err === "object" &&
    err !== null &&
    "digest" in err &&
    typeof (err as { digest?: string }).digest === "string" &&
    (err as { digest: string }).digest.startsWith("NEXT_REDIRECT")
  ) {
    throw err;
  }
}

function parseConfigFromForm(formData: FormData, templateId: string): ThemeConfig {
  const template = getThemeTemplate(templateId);
  const fallback = template?.config;
  if (!fallback) throw new Error("Unknown template");

  const raw = String(formData.get("config") ?? "").trim();
  if (!raw) return fallback;

  try {
    const parsed = JSON.parse(raw) as ThemeConfig;
    return {
      ...fallback,
      ...parsed,
      fontFamily: parsed.fontFamily || fallback.fontFamily,
      colors: { ...fallback.colors, ...(parsed.colors ?? {}) },
      sections: { ...fallback.sections, ...(parsed.sections ?? {}) },
      defaults: { ...(fallback.defaults ?? {}), ...(parsed.defaults ?? {}) },
      fields: parsed.fields?.length ? parsed.fields : fallback.fields,
      customSections: parsed.customSections ?? fallback.customSections ?? [],
      backgroundImage: parsed.backgroundImage ?? fallback.backgroundImage,
      layout: parsed.layout || fallback.layout,
    };
  } catch {
    return fallback;
  }
}

export async function createThemeAction(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const templateId = String(formData.get("template") ?? "wedding-theme-traditional").trim();
  const previewImageInput = String(formData.get("previewImage") ?? "").trim();
  const categoryId = String(formData.get("categoryId") ?? "").trim() || undefined;

  const template = getThemeTemplate(templateId);
  if (!template || name.length < 2) redirect("/themes/new?error=1");

  const config = parseConfigFromForm(formData, templateId);

  try {
    const { data } = await apiFetch<{ id: string }>("/themes", {
      method: "POST",
      body: JSON.stringify({
        name,
        categoryId,
        previewImage: previewImageInput || template.previewImage,
        status: "ACTIVE",
        config,
        assignToAllVendors: true,
      }),
    });
    redirect(`/themes/${data.id}/edit?created=1`);
  } catch (err) {
    rethrowRedirect(err);
    redirect("/themes/new?error=1");
  }
}

export async function updateThemeAction(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const templateId = String(formData.get("template") ?? "wedding-theme-traditional").trim();
  const previewImageInput = String(formData.get("previewImage") ?? "").trim();
  const categoryId = String(formData.get("categoryId") ?? "").trim() || undefined;
  const status = String(formData.get("status") ?? "ACTIVE").trim().toUpperCase();

  const template = getThemeTemplate(templateId);
  if (!id || !template || name.length < 2) redirect("/themes");

  const config = parseConfigFromForm(formData, templateId);

  try {
    await apiFetch(`/themes/${id}`, {
      method: "PATCH",
      body: JSON.stringify({
        name,
        categoryId,
        previewImage: previewImageInput || template.previewImage,
        status: status === "DRAFT" ? "DRAFT" : status === "INACTIVE" ? "INACTIVE" : "ACTIVE",
        config,
      }),
    });
  } catch (err) {
    rethrowRedirect(err);
    redirect(`/themes/${id}/edit?error=1`);
  }
  redirect(`/themes/${id}/edit?saved=1`);
}

export async function setVendorThemeAssignmentAction(formData: FormData) {
  const themeId = String(formData.get("themeId") ?? "").trim();
  const vendorId = String(formData.get("vendorId") ?? "").trim();
  const enabled = formData.get("enabled") === "on" || formData.get("enabled") === "true";

  if (!themeId || !vendorId) redirect("/themes/assignments?error=1");

  try {
    await apiFetch(`/themes/${themeId}/assign-vendor`, {
      method: "POST",
      body: JSON.stringify({ vendorId, isEnabled: enabled }),
    });
  } catch (err) {
    rethrowRedirect(err);
    redirect("/themes/assignments?error=1");
  }
  redirect("/themes/assignments?saved=1");
}

/** Save all theme toggles for one vendor in a single request cycle. */
export async function saveVendorThemeAssignmentsAction(formData: FormData) {
  const vendorId = String(formData.get("vendorId") ?? "").trim();
  const themeIdsRaw = String(formData.get("themeIds") ?? "").trim();
  const selected = new Set(
    themeIdsRaw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
  );
  const allThemeIds = String(formData.get("allThemeIds") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (!vendorId) redirect("/themes/assignments?error=1");

  try {
    await Promise.all(
      allThemeIds.map((themeId) =>
        apiFetch(`/themes/${themeId}/assign-vendor`, {
          method: "POST",
          body: JSON.stringify({ vendorId, isEnabled: selected.has(themeId) }),
        })
      )
    );
  } catch (err) {
    rethrowRedirect(err);
    redirect("/themes/assignments?error=1");
  }
  redirect("/themes/assignments?saved=1");
}

export async function duplicateThemeAction(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();
  if (!id) redirect("/themes");
  try {
    const { data } = await apiFetch<{ id: string }>(`/themes/${id}/duplicate`, {
      method: "POST",
      body: JSON.stringify({}),
    });
    redirect(`/themes/${data.id}/edit`);
  } catch (err) {
    rethrowRedirect(err);
    redirect(`/themes/${id}/edit?error=1`);
  }
}

/** Push an existing theme to every active vendor. */
export async function assignThemeToAllVendorsAction(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();
  if (!id) redirect("/themes");
  try {
    await apiFetch(`/themes/${id}/assign-all-vendors`, { method: "POST", body: JSON.stringify({}) });
  } catch (err) {
    rethrowRedirect(err);
    redirect(`/themes/${id}/edit?error=1`);
  }
  redirect(`/themes/${id}/edit?assigned=1`);
}
