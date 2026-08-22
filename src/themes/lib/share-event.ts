/** Resolve a fetchable absolute URL for share image assets. */
export function absoluteShareImageUrl(url) {
  if (!url || typeof url !== "string") return null;
  if (/^(https?:|data:|blob:)/i.test(url)) return url;
  if (typeof window === "undefined") return url;
  return new URL(url, window.location.origin).href;
}

/** Pick the best image to attach when sharing an event. */
export function resolveEventShareImageUrl(event, fallbackUrl = null) {
  const candidate =
    event?.whatsappImage ||
    event?.coverImage ||
    event?.invitationCard ||
    event?.customImage ||
    fallbackUrl;
  return absoluteShareImageUrl(candidate);
}

export function buildEventShareText({
  url,
  title,
  coupleLine,
  tagline,
  dateLine,
  timeLine,
  placeLine,
}) {
  const lines = [
    url,
    "",
    coupleLine ? `🌸 ${coupleLine} 🌸` : null,
    "",
    tagline || title || "You're invited to celebrate with us!",
    dateLine ? `📅 ${dateLine}` : null,
    timeLine ? `⏰ ${timeLine}` : null,
    placeLine || null,
    "",
    `💍 View invitation:\n${url}`,
  ].filter(Boolean);
  return lines.join("\n");
}

/**
 * Share event with image + link when the device supports it.
 * Falls back to WhatsApp text share, then plain Web Share text.
 */
export async function shareEventWithImage({
  url,
  text,
  imageUrl,
  title,
  fileName = "event-invite.png",
}) {
  const message = text || url;
  const openWhatsApp = () => {
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
  };

  const absoluteImage = absoluteShareImageUrl(imageUrl);

  if (absoluteImage) {
    try {
      const res = await fetch(absoluteImage);
      if (res.ok) {
        const blob = await res.blob();
        const type = blob.type && blob.type.startsWith("image/") ? blob.type : "image/png";
        const file = new File([blob], fileName, { type });
        if (navigator.canShare?.({ files: [file] })) {
          await navigator.share({ files: [file], text: message, title: title || undefined });
          return;
        }
      }
    } catch (err) {
      if (err?.name === "AbortError") return;
    }
  }

  if (typeof navigator.share === "function") {
    try {
      await navigator.share({ text: message, url, title: title || undefined });
      return;
    } catch (err) {
      if (err?.name === "AbortError") return;
    }
  }

  openWhatsApp();
}
