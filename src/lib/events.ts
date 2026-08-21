"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { api, ApiError } from "./api";

function errorRedirect(to: string, message: string): never {
  redirect(`${to}?error=${encodeURIComponent(message)}`);
}

export async function publishEventAction(id: string, formData: FormData) {
  void formData;
  try {
    await api.post(`/events/${id}/publish`);
  } catch (error) {
    const message = error instanceof ApiError ? error.message : "Failed to publish event.";
    errorRedirect(`/events/${id}`, message);
  }
  revalidatePath("/events");
  revalidatePath(`/events/${id}`);
  redirect(`/events/${id}`);
}

export async function unpublishEventAction(id: string, formData: FormData) {
  void formData;
  try {
    await api.post(`/events/${id}/unpublish`);
  } catch (error) {
    const message = error instanceof ApiError ? error.message : "Failed to unpublish event.";
    errorRedirect(`/events/${id}`, message);
  }
  revalidatePath("/events");
  revalidatePath(`/events/${id}`);
  redirect(`/events/${id}`);
}

export async function cancelEventAction(id: string, formData: FormData) {
  void formData;
  try {
    await api.delete(`/events/${id}`);
  } catch (error) {
    const message = error instanceof ApiError ? error.message : "Failed to cancel event.";
    errorRedirect(`/events/${id}`, message);
  }
  revalidatePath("/events");
  revalidatePath(`/events/${id}`);
  redirect(`/events/${id}`);
}
