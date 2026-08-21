/** Event fetchers for the admin panel (platform-wide, not vendor-scoped). */

import { api, ApiError } from "@/lib/api";

export type EventStatus = "DRAFT" | "UPCOMING" | "LIVE" | "COMPLETED" | "CANCELLED" | "EXPIRED";

export interface Event {
  id: string;
  vendorId: string;
  customerId: string | null;
  eventCode: string;
  eventSlug: string;
  eventName: string;
  eventType: string | null;
  description: string | null;
  eventDate: string | null;
  startTime: string | null;
  endTime: string | null;
  timezone: string;
  location: string | null;
  googleMapsUrl: string | null;
  coverImage: string | null;
  pageTitle: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  liveTiming: string | null;
  status: EventStatus;
  themeId: string | null;
  youtubeChannelId: string | null;
  youtubeVideoId: string | null;
  youtubeLiveUrl: string | null;
  teaserUrl: string | null;
  scrollMessage: string | null;
  galleryImages: string[];
  logoImage: string | null;
  customImage: string | null;
  whatsappImage: string | null;
  showWatchLive: boolean;
  showSocialShare: boolean;
  remarks1: string | null;
  remarks2: string | null;
  fontFamily: string | null;
  fontColor: string | null;
  accessPin: string | null;
  whatsappNumber: string | null;
  whatsappEnabled: boolean;
  isPublic: boolean;
  isPublished: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface EventThemeConfig {
  id: string;
  eventId: string;
  themeId: string;
  primaryColor: string | null;
  secondaryColor: string | null;
  accentColor: string | null;
  logo: string | null;
  coverImage: string | null;
  pageTitle: string | null;
  description: string | null;
  liveTiming: string | null;
  customConfig: Record<string, unknown> | null;
}

export interface EventAccess {
  id: string;
  eventId: string;
  accessType: "PUBLIC" | "PRIVATE";
  isEnabled: boolean;
}

export interface YoutubeStream {
  id: string;
  eventId: string;
  youtubeChannelId: string;
  youtubeVideoId: string | null;
  youtubeLiveUrl: string | null;
  status: "CONNECTED" | "SCHEDULED" | "LIVE" | "ENDED" | "ERROR";
  scheduledAt: string | null;
  startedAt: string | null;
  endedAt: string | null;
}

export interface EventDetail extends Event {
  themeConfig: EventThemeConfig | null;
  media: unknown[];
  access: EventAccess | null;
  youtubeStreams: YoutubeStream[];
}

export async function fetchEvents(params: {
  page?: number;
  limit?: number;
  status?: EventStatus | "";
  customerId?: string;
} = {}) {
  const { page = 1, limit = 20, status, customerId } = params;
  const query: Record<string, string | number> = { page, limit };
  if (status) query.status = status;
  if (customerId) query.customerId = customerId;

  const { items, meta } = await api.getList<Event>("/events", { params: query });
  return { items, page: meta.page, totalPages: meta.totalPages, total: meta.total };
}

/**
 * The backend's list endpoint has no vendorId filter (admin scope is always unscoped) —
 * this fetches a page of events and filters client-side, which is fine at this platform's
 * scale but isn't a substitute for real server-side filtering if the event volume grows.
 */
export async function fetchEventsByVendor(vendorId: string, limit = 100): Promise<Event[]> {
  const { items } = await api.getList<Event>("/events", { params: { page: 1, limit } });
  return items.filter((e) => e.vendorId === vendorId);
}

/** Returns null when the event doesn't exist. */
export async function fetchEventDetail(id: string): Promise<EventDetail | null> {
  try {
    return await api.get<EventDetail>(`/events/${id}`);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}
