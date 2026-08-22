"use server";

import { redirect } from "next/navigation";
import {
  approveEventCreationPayment,
  rejectEventCreationPayment,
  upsertSetting,
} from "./db";

export async function savePaymentSettingsAction(formData: FormData) {
  const payeeName = String(formData.get("payeeName") ?? "").trim();
  const qrImage = String(formData.get("qrImage") ?? "").trim();
  const instructions = String(formData.get("instructions") ?? "").trim();

  try {
    await upsertSetting("payment.payeeName", payeeName);
    if (qrImage) await upsertSetting("payment.qrImage", qrImage);
    await upsertSetting("payment.instructions", instructions);
  } catch {
    redirect("/settings?section=Payment&error=1");
  }
  redirect("/settings?section=Payment&saved=1");
}

export async function approvePaymentAction(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();
  if (!id) redirect("/payments?tab=Pending");
  try {
    await approveEventCreationPayment(id);
  } catch {
    redirect("/payments?tab=Pending&error=approve");
  }
  redirect("/payments?tab=Successful");
}

export async function rejectPaymentAction(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();
  const reason = String(formData.get("reason") ?? "").trim();
  if (!id) redirect("/payments?tab=Pending");
  try {
    await rejectEventCreationPayment(id, reason || undefined);
  } catch {
    redirect("/payments?tab=Pending&error=reject");
  }
  redirect("/payments?tab=Failed");
}
