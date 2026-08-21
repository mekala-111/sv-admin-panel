"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { api, ApiError } from "./api";
import type { Event } from "./hooks/useAdminEvents";

function errorRedirect(to: string, message: string): never {
  redirect(`${to}?error=${encodeURIComponent(message)}`);
}

function str(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

function bool(formData: FormData, key: string): boolean {
  return formData.get(key) === "on";
}

/** Reads a single file field into a data: URL (no S3 configured on the backend yet). Returns undefined when no file was chosen, so callers can omit the key and leave an existing value untouched on update. */
async function fileToDataUrl(
  value: FormDataEntryValue | null,
  maxBytes: number,
  fieldLabel: string,
  redirectTo: string
): Promise<string | undefined> {
  if (!(value instanceof File) || value.size === 0) return undefined;
  if (value.size > maxBytes) {
    errorRedirect(redirectTo, `${fieldLabel} exceeds the maximum size of ${Math.round(maxBytes / 1024)}KB.`);
  }
  const buffer = Buffer.from(await value.arrayBuffer());
  return `data:${value.type || "image/jpeg"};base64,${buffer.toString("base64")}`;
}

/** Reads a multi-file field into data: URLs. Returns [] when nothing was chosen. `existingCount` accounts for images already on the event (edit form), so the cap applies to the combined total. */
async function filesToDataUrls(
  values: FormDataEntryValue[],
  maxBytesEach: number,
  maxCount: number,
  fieldLabel: string,
  redirectTo: string,
  existingCount = 0
): Promise<string[]> {
  const files = values.filter((v): v is File => v instanceof File && v.size > 0);
  if (existingCount + files.length > maxCount) {
    errorRedirect(redirectTo, `You can have at most ${maxCount} ${fieldLabel.toLowerCase()} images in total.`);
  }
  const urls: string[] = [];
  for (const file of files) {
    if (file.size > maxBytesEach) {
      errorRedirect(
        redirectTo,
        `${fieldLabel} image "${file.name}" exceeds the maximum size of ${Math.round(maxBytesEach / 1024 / 1024)}MB.`
      );
    }
    const buffer = Buffer.from(await file.arrayBuffer());
    urls.push(`data:${file.type || "image/jpeg"};base64,${buffer.toString("base64")}`);
  }
  return urls;
}

/** The edit form round-trips the event's current gallery via a hidden JSON field so newly uploaded images can be appended rather than replacing the array (the backend PATCH overwrites galleryImages wholesale). */
function readExistingGallery(formData: FormData): string[] {
  const raw = str(formData, "existingGalleryImages");
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === "string") : [];
  } catch {
    return [];
  }
}

const MAX_LOGO_BYTES = 500 * 1024;
const MAX_COVER_BYTES = 4 * 1024 * 1024;
const MAX_GALLERY_BYTES = 4 * 1024 * 1024;
const MAX_GALLERY_COUNT = 10;

/** Shared field parsing for create/update — returns the partial event payload plus the raw YouTube fields (handled separately, via /youtube/streams). */
async function parseEventForm(formData: FormData, redirectTo: string) {
  const eventType = str(formData, "eventType");
  const description = str(formData, "description");
  const eventDate = str(formData, "eventDate");
  const startTime = str(formData, "startTime");
  const endTime = str(formData, "endTime");
  const timezone = str(formData, "timezone");
  const location = str(formData, "location");
  const googleMapsUrl = str(formData, "googleMapsUrl");
  const pageTitle = str(formData, "pageTitle");
  const metaTitle = str(formData, "metaTitle");
  const metaDescription = str(formData, "metaDescription");
  const liveTiming = str(formData, "liveTiming");
  const themeId = str(formData, "themeId");
  const teaserUrl = str(formData, "teaserUrl");
  const scrollMessage = str(formData, "scrollMessage");
  const remarks1 = str(formData, "remarks1");
  const remarks2 = str(formData, "remarks2");
  const fontFamily = str(formData, "fontFamily");
  const fontColor = str(formData, "fontColor");
  const whatsappNumber = str(formData, "whatsappNumber");
  const accessPin = str(formData, "accessPin");

  const coverImage = await fileToDataUrl(formData.get("coverImage"), MAX_COVER_BYTES, "Cover image", redirectTo);
  const logoImage = await fileToDataUrl(formData.get("logoImage"), MAX_LOGO_BYTES, "Logo", redirectTo);
  const customImage = await fileToDataUrl(formData.get("customImage"), MAX_LOGO_BYTES, "Custom image", redirectTo);
  const whatsappImage = await fileToDataUrl(formData.get("whatsappImage"), MAX_LOGO_BYTES, "WhatsApp image", redirectTo);
  const existingGallery = readExistingGallery(formData);
  const newGalleryImages = await filesToDataUrls(
    formData.getAll("galleryImages"),
    MAX_GALLERY_BYTES,
    MAX_GALLERY_COUNT,
    "Gallery",
    redirectTo,
    existingGallery.length
  );
  const galleryImages = [...existingGallery, ...newGalleryImages];

  return {
    payload: {
      ...(eventType ? { eventType } : {}),
      ...(description ? { description } : {}),
      ...(eventDate ? { eventDate } : {}),
      ...(startTime ? { startTime } : {}),
      ...(endTime ? { endTime } : {}),
      ...(timezone ? { timezone } : {}),
      ...(location ? { location } : {}),
      ...(googleMapsUrl ? { googleMapsUrl } : {}),
      ...(pageTitle ? { pageTitle } : {}),
      ...(metaTitle ? { metaTitle } : {}),
      ...(metaDescription ? { metaDescription } : {}),
      ...(liveTiming ? { liveTiming } : {}),
      ...(themeId ? { themeId } : {}),
      ...(teaserUrl ? { teaserUrl } : {}),
      ...(scrollMessage ? { scrollMessage } : {}),
      ...(coverImage ? { coverImage } : {}),
      ...(logoImage ? { logoImage } : {}),
      ...(customImage ? { customImage } : {}),
      ...(whatsappImage ? { whatsappImage } : {}),
      ...(galleryImages.length ? { galleryImages } : {}),
      showWatchLive: bool(formData, "showWatchLive"),
      showSocialShare: bool(formData, "showSocialShare"),
      ...(remarks1 ? { remarks1 } : {}),
      ...(remarks2 ? { remarks2 } : {}),
      ...(fontFamily ? { fontFamily } : {}),
      ...(fontColor ? { fontColor } : {}),
      ...(accessPin ? { accessPin } : {}),
      ...(whatsappNumber ? { whatsappNumber } : {}),
      whatsappEnabled: bool(formData, "whatsappEnabled"),
      isPublic: bool(formData, "isPublic"),
    },
    youtube: {
      youtubeChannelId: str(formData, "youtubeChannelId"),
      youtubeVideoId: str(formData, "youtubeVideoId"),
      youtubeLiveUrl: str(formData, "youtubeLiveUrl"),
      youtubeLiveKey: str(formData, "youtubeLiveKey"),
    },
  };
}

/** Best-effort: the event already exists by this point, so a YouTube wiring failure shouldn't lose it. */
async function linkYoutubeIfProvided(
  eventId: string,
  youtube: { youtubeChannelId: string; youtubeVideoId: string; youtubeLiveUrl: string; youtubeLiveKey: string }
) {
  if (!youtube.youtubeChannelId) return;
  try {
    await api.post("/youtube/streams", {
      eventId,
      youtubeChannelId: youtube.youtubeChannelId,
      ...(youtube.youtubeVideoId ? { youtubeVideoId: youtube.youtubeVideoId } : {}),
      ...(youtube.youtubeLiveUrl ? { youtubeLiveUrl: youtube.youtubeLiveUrl } : {}),
      ...(youtube.youtubeLiveKey ? { youtubeLiveKey: youtube.youtubeLiveKey } : {}),
    });
  } catch {
    // Swallow — the event itself was saved fine; the Live Stream tab lets them retry linking.
  }
}

export async function createEventAction(formData: FormData) {
  const eventName = str(formData, "eventName");
  if (eventName.length < 2) errorRedirect("/events/create", "Event name must be at least 2 characters.");

  const vendorId = str(formData, "vendorId");
  if (!vendorId) errorRedirect("/events/create", "Select a vendor for this event.");

  const customerId = str(formData, "customerId");
  const { payload, youtube } = await parseEventForm(formData, "/events/create");

  let event: Event;
  try {
    event = await api.post<Event>("/events", {
      vendorId,
      ...(customerId ? { customerId } : {}),
      eventName,
      ...payload,
    });
  } catch (error) {
    const message = error instanceof ApiError ? error.message : "Failed to create event.";
    errorRedirect("/events/create", message);
  }

  await linkYoutubeIfProvided(event.id, youtube);

  revalidatePath("/events");
  redirect(`/events/${event.id}`);
}

export async function updateEventAction(id: string, formData: FormData) {
  const eventName = str(formData, "eventName");
  if (eventName.length < 2) errorRedirect(`/events/${id}/edit`, "Event name must be at least 2 characters.");

  const status = str(formData, "status");
  const { payload, youtube } = await parseEventForm(formData, `/events/${id}/edit`);

  try {
    await api.patch(`/events/${id}`, {
      eventName,
      ...(status ? { status } : {}),
      ...payload,
    });
  } catch (error) {
    const message = error instanceof ApiError ? error.message : "Failed to update event.";
    errorRedirect(`/events/${id}/edit`, message);
  }

  await linkYoutubeIfProvided(id, youtube);

  revalidatePath("/events");
  revalidatePath(`/events/${id}`);
  redirect(`/events/${id}`);
}

export async function setEventThemeConfigAction(eventId: string, formData: FormData) {
  const themeId = str(formData, "themeId");
  if (!themeId) errorRedirect(`/events/${eventId}?tab=Settings`, "Select a theme first.");

  const primaryColor = str(formData, "primaryColor");
  const secondaryColor = str(formData, "secondaryColor");
  const accentColor = str(formData, "accentColor");

  try {
    await api.put(`/events/${eventId}/theme-config`, {
      themeId,
      ...(primaryColor ? { primaryColor } : {}),
      ...(secondaryColor ? { secondaryColor } : {}),
      ...(accentColor ? { accentColor } : {}),
    });
  } catch (error) {
    const message = error instanceof ApiError ? error.message : "Failed to update theme.";
    errorRedirect(`/events/${eventId}?tab=Settings`, message);
  }

  revalidatePath(`/events/${eventId}`);
  redirect(`/events/${eventId}?tab=Settings`);
}

export async function setEventAccessAction(eventId: string, formData: FormData) {
  const accessType = str(formData, "accessType") || "PUBLIC";
  const password = str(formData, "password");
  const isEnabled = bool(formData, "isEnabled");

  if (accessType === "PRIVATE" && !password) {
    errorRedirect(`/events/${eventId}?tab=Settings`, "A password is required for private access.");
  }

  try {
    await api.put(`/events/${eventId}/access`, {
      accessType,
      isEnabled,
      ...(password ? { password } : {}),
    });
  } catch (error) {
    const message = error instanceof ApiError ? error.message : "Failed to update access settings.";
    errorRedirect(`/events/${eventId}?tab=Settings`, message);
  }

  revalidatePath(`/events/${eventId}`);
  redirect(`/events/${eventId}?tab=Settings`);
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
