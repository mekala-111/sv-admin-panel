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

export async function approvePaymentAction(id: string, formData: FormData) {
  void formData;
  try {
    await api.post(`/payments/${id}/approve`);
  } catch (error) {
    const message = error instanceof ApiError ? error.message : "Failed to approve payment.";
    errorRedirect("/payments", message);
  }

  revalidatePath("/payments");
  redirect("/payments");
}

export async function rejectPaymentAction(id: string, formData: FormData) {
  const reason = str(formData, "reason");
  try {
    await api.post(`/payments/${id}/reject`, reason ? { reason } : undefined);
  } catch (error) {
    const message = error instanceof ApiError ? error.message : "Failed to reject payment.";
    errorRedirect("/payments", message);
  }

  revalidatePath("/payments");
  redirect("/payments");
}

export async function creditWalletAction(vendorId: string, formData: FormData) {
  const amount = Number(str(formData, "amount"));
  if (!(amount > 0)) errorRedirect(`/vendors/${vendorId}?tab=Wallet`, "Enter an amount greater than 0.");

  const description = str(formData, "description");

  try {
    await api.post(`/payments/vendors/${vendorId}/credit-wallet`, {
      amount,
      ...(description ? { description } : {}),
    });
  } catch (error) {
    const message = error instanceof ApiError ? error.message : "Failed to credit wallet.";
    errorRedirect(`/vendors/${vendorId}?tab=Wallet`, message);
  }

  revalidatePath(`/vendors/${vendorId}`);
  redirect(`/vendors/${vendorId}?tab=Wallet`);
}
