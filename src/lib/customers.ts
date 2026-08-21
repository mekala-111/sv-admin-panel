"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { api, ApiError } from "./api";

function errorRedirect(to: string, message: string): never {
  redirect(`${to}?error=${encodeURIComponent(message)}`);
}

export async function setCustomerStatusAction(id: string, status: "ACTIVE" | "INACTIVE" | "SUSPENDED", formData: FormData) {
  void formData;
  try {
    await api.patch(`/customers/${id}`, { status });
  } catch (error) {
    const message = error instanceof ApiError ? error.message : "Failed to update customer status.";
    errorRedirect(`/customers/${id}`, message);
  }

  revalidatePath("/customers");
  revalidatePath(`/customers/${id}`);
  redirect(`/customers/${id}`);
}
