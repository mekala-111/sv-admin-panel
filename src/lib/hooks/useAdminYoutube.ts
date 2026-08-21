/** YouTube channel/stream fetchers for the admin panel (cross-vendor view). */

import { api, ApiError } from "@/lib/api";

export interface AdminYoutubeChannel {
  id: string;
  channelId: string;
  channelName: string | null;
  status: "CONNECTED" | "DISCONNECTED" | "ERROR" | "TOKEN_EXPIRED";
  tokenExpiry: string | null;
  vendorId: string;
  vendorName: string | null;
  streamsCount: number;
  liveStreamsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdminYoutubeStreamListItem {
  id: string;
  eventId: string;
  youtubeChannelId: string;
  youtubeVideoId: string | null;
  youtubeLiveUrl: string | null;
  status: "CONNECTED" | "SCHEDULED" | "LIVE" | "ENDED" | "ERROR";
  scheduledAt: string | null;
  startedAt: string | null;
  endedAt: string | null;
  createdAt: string;
  updatedAt: string;
  event: { id: string; eventName: string; eventSlug: string } | null;
  vendorName: string | null;
  customerName: string | null;
  channelName: string | null;
}

export async function fetchYoutubeChannels(): Promise<AdminYoutubeChannel[]> {
  return api.get<AdminYoutubeChannel[]>("/youtube/channels");
}

export async function fetchYoutubeChannelDetail(id: string): Promise<AdminYoutubeChannel | null> {
  try {
    return await api.get<AdminYoutubeChannel>(`/youtube/channels/${id}`);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

export async function fetchYoutubeStreams(): Promise<AdminYoutubeStreamListItem[]> {
  return api.get<AdminYoutubeStreamListItem[]>("/youtube/streams");
}

export async function fetchYoutubeStreamDetail(id: string): Promise<AdminYoutubeStreamListItem | null> {
  try {
    return await api.get<AdminYoutubeStreamListItem>(`/youtube/streams/${id}`);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}
