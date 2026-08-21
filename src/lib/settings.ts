"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { api, ApiError } from "./api";

function errorRedirect(to: string, message: string): never {
  redirect(`${to}?error=${encodeURIComponent(message)}`);
}

export async function updateSettingAction(formData: FormData) {
  const key = String(formData.get("key") ?? "").trim();
  const rawValue = String(formData.get("value") ?? "");
  if (!key) errorRedirect("/settings", "Setting key is required.");

  // Values are stored as JSON (Mixed) — accept plain strings too, so a bare "true" or "90" isn't required to be quoted.
  let value: unknown = rawValue;
  try {
    value = JSON.parse(rawValue);
  } catch {
    // not valid JSON — keep as a plain string
  }

  try {
    await api.put(`/settings/${encodeURIComponent(key)}`, { value });
  } catch (error) {
    const message = error instanceof ApiError ? error.message : "Failed to save setting.";
    errorRedirect("/settings", message);
  }

  revalidatePath("/settings");
  redirect("/settings");
}
