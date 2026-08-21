"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { api, ApiError } from "./api";
import type { Vendor } from "./hooks/useAdminVendors";

function errorRedirect(to: string, message: string): never {
  redirect(`${to}?error=${encodeURIComponent(message)}`);
}

function str(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

export async function createVendorAction(formData: FormData) {
  const name = str(formData, "name");
  const email = str(formData, "email");
  const password = str(formData, "password");
  const companyName = str(formData, "company");

  if (!name || !email || !companyName) {
    errorRedirect("/vendors/create", "Vendor name, company, and email are required.");
  }
  if (password.length < 8) {
    errorRedirect("/vendors/create", "Password must be at least 8 characters.");
  }

  const phone = str(formData, "phone");
  const address = str(formData, "address");
  const planId = str(formData, "planId");
  const whatsappNumber = str(formData, "whatsappNumber");
  const eventCreationFee = str(formData, "eventCreationFee");
  const initialWalletCredit = str(formData, "initialWalletCredit");

  let vendor: Vendor;
  try {
    vendor = await api.post<Vendor>("/vendors", {
      name,
      email,
      password,
      companyName,
      ...(phone ? { phone } : {}),
      ...(address ? { address } : {}),
      ...(planId ? { planId } : {}),
      ...(whatsappNumber ? { whatsappNumber } : {}),
      ...(eventCreationFee ? { eventCreationFee: Number(eventCreationFee) } : {}),
      ...(initialWalletCredit ? { initialWalletCredit: Number(initialWalletCredit) } : {}),
    });
  } catch (error) {
    const message = error instanceof ApiError ? error.message : "Failed to create vendor.";
    errorRedirect("/vendors/create", message);
  }

  revalidatePath("/vendors");
  redirect(`/vendors/${vendor.id}`);
}

export async function updateVendorAction(id: string, formData: FormData) {
  const companyName = str(formData, "companyName");
  if (companyName.length < 2) errorRedirect(`/vendors/${id}/edit`, "Company name must be at least 2 characters.");

  const email = str(formData, "email");
  const phone = str(formData, "phone");
  const address = str(formData, "address");
  const whatsappNumber = str(formData, "whatsappNumber");
  const eventCreationFee = str(formData, "eventCreationFee");

  try {
    await api.patch(`/vendors/${id}`, {
      companyName,
      email: email || undefined,
      phone: phone || undefined,
      address: address || undefined,
      whatsappNumber: whatsappNumber || undefined,
      ...(eventCreationFee ? { eventCreationFee: Number(eventCreationFee) } : {}),
    });
  } catch (error) {
    const message = error instanceof ApiError ? error.message : "Failed to update vendor.";
    errorRedirect(`/vendors/${id}/edit`, message);
  }

  revalidatePath("/vendors");
  revalidatePath(`/vendors/${id}`);
  redirect(`/vendors/${id}`);
}

export async function setVendorStatusAction(
  id: string,
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED" | "PENDING_APPROVAL",
  formData: FormData
) {
  void formData;
  try {
    await api.patch(`/vendors/${id}`, { status });
  } catch (error) {
    const message = error instanceof ApiError ? error.message : "Failed to update vendor status.";
    errorRedirect(`/vendors/${id}`, message);
  }

  revalidatePath("/vendors");
  revalidatePath(`/vendors/${id}`);
  redirect(`/vendors/${id}`);
}

/** The backend soft-deletes: sets status to INACTIVE rather than removing the record. */
export async function deleteVendorAction(id: string, formData: FormData) {
  void formData;
  try {
    await api.delete(`/vendors/${id}`);
  } catch (error) {
    const message = error instanceof ApiError ? error.message : "Failed to remove vendor.";
    errorRedirect(`/vendors/${id}`, message);
  }

  revalidatePath("/vendors");
  redirect("/vendors");
}
