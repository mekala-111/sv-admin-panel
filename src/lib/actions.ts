"use server";

import { redirect } from "next/navigation";
import { createNotification, createVendor } from "./db";

export async function createVendorAction(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const company = String(formData.get("company") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();

  if (!name || !company || !email) {
    throw new Error("Vendor name, company, and email are required.");
  }

  const vendor = createVendor({ name, company, email });
  redirect(`/vendors/${vendor.id}`);
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

  createNotification({ title, message, audience, type });
  redirect("/notifications");
}
