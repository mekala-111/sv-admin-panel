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

/** Links a connected YouTube channel to an event, creating the youtube_streams row (Live Stream tab on the event page). */
export async function linkYoutubeStreamAction(eventId: string, formData: FormData) {
  const youtubeChannelId = String(formData.get("youtubeChannelId") ?? "").trim();
  if (!youtubeChannelId) {
    redirect(`/events/${eventId}?tab=Live Stream&error=${encodeURIComponent("Select a YouTube channel first.")}`);
  }
  const youtubeVideoId = String(formData.get("youtubeVideoId") ?? "").trim();
  const youtubeLiveUrl = String(formData.get("youtubeLiveUrl") ?? "").trim();
  const youtubeLiveKey = String(formData.get("youtubeLiveKey") ?? "").trim();

  try {
    await api.post("/youtube/streams", {
      eventId,
      youtubeChannelId,
      ...(youtubeVideoId ? { youtubeVideoId } : {}),
      ...(youtubeLiveUrl ? { youtubeLiveUrl } : {}),
      ...(youtubeLiveKey ? { youtubeLiveKey } : {}),
    });
  } catch (error) {
    const message = error instanceof ApiError ? error.message : "Failed to link YouTube stream.";
    redirect(`/events/${eventId}?tab=Live Stream&error=${encodeURIComponent(message)}`);
  }

  revalidatePath(`/events/${eventId}`);
  redirect(`/events/${eventId}?tab=Live Stream`);
}
