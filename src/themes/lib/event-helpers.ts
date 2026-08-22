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

/** YYYY-MM-DD from eventDate (ISO string, date-only, or Date). */
export function toDateOnly(value: unknown): string | null {
  if (value == null || value === "") return null;
  if (typeof value === "string") {
    const m = value.trim().match(/^(\d{4}-\d{2}-\d{2})/);
    if (m) return m[1];
  }
  const d = value instanceof Date ? value : new Date(value as string | number);
  if (Number.isNaN(d.getTime())) return null;
  const y = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${mo}-${day}`;
}

/** Parse "11:30", "11:30:00", "11:30 am", "6:00 PM IST" → HH:mm:ss */
export function parseTimeToHms(timeRaw: string): string | null {
  const m = timeRaw.trim().match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?(?:\s*([AaPp][Mm]))?/);
  if (!m) return null;
  let h = Number(m[1]);
  const min = Number(m[2]);
  const sec = m[3] != null ? Number(m[3]) : 0;
  const ampm = m[4]?.toUpperCase();
  if (ampm === "PM" && h < 12) h += 12;
  if (ampm === "AM" && h === 12) h = 0;
  if (Number.isNaN(h) || Number.isNaN(min) || h > 23 || min > 59 || sec > 59) return null;
  return `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

/**
 * Countdown target from Theme Content fields: Event date + Event time.
 * Falls back to startTime, then eventDate at midnight (local).
 */
export function resolveCountdownTarget(event?: {
  eventDate?: string | Date | null;
  eventTime?: string | null;
  startTime?: string | Date | null;
} | null): string | null {
  if (!event) return null;

  const datePart = toDateOnly(event.eventDate);
  const timeRaw = typeof event.eventTime === "string" ? event.eventTime.trim() : "";
  if (datePart && timeRaw) {
    const timePart = parseTimeToHms(timeRaw);
    if (timePart) return `${datePart}T${timePart}`;
  }

  if (datePart && !timeRaw) {
    // Prefer startTime's clock if we only have a date field.
    if (event.startTime) {
      const st = new Date(event.startTime);
      if (!Number.isNaN(st.getTime())) {
        const h = String(st.getHours()).padStart(2, "0");
        const min = String(st.getMinutes()).padStart(2, "0");
        const sec = String(st.getSeconds()).padStart(2, "0");
        return `${datePart}T${h}:${min}:${sec}`;
      }
    }
    return `${datePart}T00:00:00`;
  }

  if (event.startTime) {
    const st = new Date(event.startTime);
    if (!Number.isNaN(st.getTime())) return st.toISOString();
  }

  return null;
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
  const params = "autoplay=0&rel=0&modestbranding=1&playsinline=1";
  // Prefer liveUrl so a stale/wrong videoId (e.g. old teaser) cannot override the live stream.
  const id = extractIdFromUrl(youtube.liveUrl) || youtube.videoId || null;
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
