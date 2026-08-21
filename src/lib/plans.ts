"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { api, ApiError } from "./api";

function errorRedirect(to: string, message: string): never {
  redirect(`${to}?error=${encodeURIComponent(message)}`);
}

function str(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

export async function createPlanAction(formData: FormData) {
  const name = str(formData, "name");
  const code = str(formData, "code");
  if (!name || !code) errorRedirect("/pricing", "Plan name and code are required.");

  const price = Number(str(formData, "price")) || 0;
  const eventLimit = Number(str(formData, "eventLimit")) || 0;
  const hoursLimit = Number(str(formData, "hoursLimit")) || 0;
  const storageGb = Number(str(formData, "storageGb")) || 0;
  const viewerLimit = Number(str(formData, "viewerLimit")) || 0;

  try {
    await api.post("/plans", {
      name,
      code,
      price,
      eventLimit,
      hoursLimit,
      storageGb,
      viewerLimit,
      status: "ACTIVE",
    });
  } catch (error) {
    const message = error instanceof ApiError ? error.message : "Failed to create plan.";
    errorRedirect("/pricing", message);
  }

  revalidatePath("/pricing");
  redirect("/pricing");
}

export async function updatePlanAction(id: string, formData: FormData) {
  const price = str(formData, "price");
  const eventLimit = str(formData, "eventLimit");
  const hoursLimit = str(formData, "hoursLimit");
  const storageGb = str(formData, "storageGb");
  const viewerLimit = str(formData, "viewerLimit");
  const status = str(formData, "status");

  try {
    await api.patch(`/plans/${id}`, {
      ...(price ? { price: Number(price) } : {}),
      ...(eventLimit ? { eventLimit: Number(eventLimit) } : {}),
      ...(hoursLimit ? { hoursLimit: Number(hoursLimit) } : {}),
      ...(storageGb ? { storageGb: Number(storageGb) } : {}),
      ...(viewerLimit ? { viewerLimit: Number(viewerLimit) } : {}),
      ...(status ? { status } : {}),
    });
  } catch (error) {
    const message = error instanceof ApiError ? error.message : "Failed to update plan.";
    errorRedirect("/pricing", message);
  }

  revalidatePath("/pricing");
  redirect("/pricing");
}

export async function assignPlanToVendorAction(planId: string, formData: FormData) {
  const vendorId = str(formData, "vendorId");
  if (!vendorId) errorRedirect("/pricing", "Select a vendor first.");

  try {
    await api.post(`/plans/${planId}/assign-vendor`, { vendorId });
  } catch (error) {
    const message = error instanceof ApiError ? error.message : "Failed to assign plan.";
    errorRedirect("/pricing", message);
  }

  revalidatePath("/pricing");
  redirect("/pricing");
}
