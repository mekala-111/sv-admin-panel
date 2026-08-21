"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { api, ApiError } from "./api";

export async function syncYoutubeAction(eventId: string, formData: FormData) {
  void formData;
  try {
    await api.post("/youtube/sync", undefined, { params: { eventId } });
  } catch (error) {
    const message = error instanceof ApiError ? error.message : "Failed to refresh stream status.";
    redirect(`/youtube?error=${encodeURIComponent(message)}`);
  }
  revalidatePath("/youtube");
  redirect("/youtube?tab=Event Streams");
}
