"use server";

import { redirect } from "next/navigation";
import { createVendor, createNotification, updateVendor, setVendorStatus } from "./db";

function parseFee(formData: FormData, key: string) {
  const value = Number(formData.get(key) ?? 0);
  return Number.isFinite(value) ? Math.max(0, value) : 0;
}

export async function createVendorAction(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const company = String(formData.get("company") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const password = String(formData.get("password") ?? "").trim() || `Welcome${Date.now()}!`;
  const liveEventCreationFee = parseFee(formData, "liveEventCreationFee");
  const invitationCreationFee = parseFee(formData, "invitationCreationFee");
  const initialWalletCredit = parseFee(formData, "initialWalletCredit");

  if (!name || !company || !email) {
    throw new Error("Vendor name, company, and email are required.");
  }

  const vendor = await createVendor({
    name,
    company,
    email,
    password,
    phone: phone || undefined,
    address: address || undefined,
    liveEventCreationFee,
    invitationCreationFee,
    initialWalletCredit,
  });
  redirect(`/vendors/${vendor.id}`);
}

export async function updateVendorAction(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();
  const companyName = String(formData.get("company") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const liveEventCreationFee = parseFee(formData, "liveEventCreationFee");
  const invitationCreationFee = parseFee(formData, "invitationCreationFee");

  if (!id || !companyName || !email) {
    redirect(`/vendors/${id || ""}/edit?error=1`);
  }

  try {
    await updateVendor(id, {
      companyName,
      email,
      phone: phone || undefined,
      address: address || undefined,
      liveEventCreationFee,
      invitationCreationFee,
    });
  } catch {
    redirect(`/vendors/${id}/edit?error=1`);
  }
  redirect(`/vendors/${id}`);
}

export async function suspendVendorAction(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();
  if (!id) redirect("/vendors");
  try {
    await setVendorStatus(id, "SUSPENDED");
  } catch {
    redirect(`/vendors/${id}?error=suspend`);
  }
  redirect(`/vendors/${id}`);
}

export async function activateVendorAction(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();
  if (!id) redirect("/vendors");
  try {
    await setVendorStatus(id, "ACTIVE");
  } catch {
    redirect(`/vendors/${id}?error=activate`);
  }
  redirect(`/vendors/${id}`);
}

export async function createNotificationAction(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();
  const audience = String(formData.get("audience") ?? "All Vendors");
  const type = String(formData.get("type") ?? "System") as
    | "System"
    | "Payments"
    | "Streaming"
    | "Vendors"
    | "Customers";

  if (!title || !message) {
    throw new Error("Notification title and message are required.");
  }

  await createNotification({ title, message, audience, type });
  redirect("/notifications");
}
