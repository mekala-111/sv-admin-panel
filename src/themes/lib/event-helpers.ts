const FALLBACK_COVER = "/uploads/Portfolio.png";

export function asEventList(data: unknown) {
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object") {
    const obj = data as { items?: unknown; events?: unknown };
    if (Array.isArray(obj.items)) return obj.items;
    if (Array.isArray(obj.events)) return obj.events;
  }
  return [];
}

export function coverSrc(url: unknown) {
  if (!url || typeof url !== "string") return FALLBACK_COVER;
  return url;
}

export function formatEventDate(value: unknown) {
  if (typeof value !== "string" && typeof value !== "number" && !(value instanceof Date)) {
    return null;
  }
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return {
    day: String(d.getDate()).padStart(2, "0"),
    month: d.toLocaleString("en-US", { month: "short" }).toUpperCase(),
    full: d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
  };
}

export function formatEventDateTime(dateValue: unknown, timeValue: unknown) {
  const datePart = formatEventDate(dateValue)?.full;
  if (!timeValue) return datePart || "Date TBA";
  if (typeof timeValue !== "string" && typeof timeValue !== "number" && !(timeValue instanceof Date)) {
    return datePart || "Date TBA";
  }
  const t = new Date(timeValue);
  if (Number.isNaN(t.getTime())) return datePart || "Date TBA";
  const time = t.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  return datePart ? `${datePart} · ${time}` : time;
}

export function youtubeEmbedUrl(youtube?: { videoId?: string; liveUrl?: string } | null) {
  if (!youtube) return null;
  const params = "autoplay=1&rel=0&modestbranding=1&playsinline=1";
  const id = youtube.videoId || extractIdFromUrl(youtube.liveUrl);
  if (id) return `https://www.youtube.com/embed/${id}?${params}`;
  return null;
}

function extractIdFromUrl(liveUrl: unknown) {
  if (!liveUrl || typeof liveUrl !== "string") return null;
  try {
    const u = new URL(liveUrl);
    const v = u.searchParams.get("v");
    if (v) return v;
    const parts = u.pathname.split("/").filter(Boolean);
    const liveIdx = parts.indexOf("live");
    if (liveIdx >= 0 && parts[liveIdx + 1]) return parts[liveIdx + 1];
    if (parts[0] === "embed" && parts[1]) return parts[1];
    if (parts[0] === "shorts" && parts[1]) return parts[1];
    if (u.hostname.includes("youtu.be") && parts[0]) return parts[0];
  } catch {
    /* ignore */
  }
  return null;
}

export function cacheUnlockedEvent(slug: string, payload: unknown) {
  if (typeof window === "undefined" || !slug || !payload) return;
  try {
    sessionStorage.setItem(`sv_unlocked_${slug}`, JSON.stringify(payload));
  } catch {
    /* ignore quota */
  }
}

export function readUnlockedEvent(slug: string) {
  if (typeof window === "undefined" || !slug) return null;
  try {
    const raw = sessionStorage.getItem(`sv_unlocked_${slug}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function planFeatureList(plan?: {
  features?: unknown;
  eventLimit?: number;
  hoursLimit?: number;
  viewerLimit?: number;
  storageGb?: number;
} | null) {
  const features = plan?.features;
  if (Array.isArray(features)) return features.map(String);
  if (features && typeof features === "object") {
    return Object.entries(features).map(([key, value]) => {
      if (typeof value === "boolean") return value ? key : null;
      return `${key}: ${value}`;
    }).filter(Boolean);
  }
  const extras: string[] = [];
  if (plan?.eventLimit != null) {
    extras.push(plan.eventLimit < 0 ? "Unlimited events" : `${plan.eventLimit} events`);
  }
  if (plan?.hoursLimit != null) {
    extras.push(plan.hoursLimit < 0 ? "Unlimited hours" : `${plan.hoursLimit} hours`);
  }
  if (plan?.viewerLimit != null) {
    extras.push(plan.viewerLimit < 0 ? "Unlimited viewers" : `${plan.viewerLimit} viewers`);
  }
  if (plan?.storageGb != null) extras.push(`${plan.storageGb} GB storage`);
  return extras;
}
