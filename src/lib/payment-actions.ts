"use server";

import { redirect } from "next/navigation";
import { api } from "./api";

async function upsertSetting(key: string, value: string) {
  await api.put(`/settings/${encodeURIComponent(key)}`, { value });
}

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
