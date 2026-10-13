/** Resolve a fetchable absolute URL for share image assets. */
export function absoluteShareImageUrl(url: unknown) {
  if (!url || typeof url !== "string") return null;
  if (/^(https?:|data:|blob:)/i.test(url)) return url;
  if (typeof window === "undefined") return url;
  return new URL(url, window.location.origin).href;
}

/** Pick the best image to attach when sharing an event. */
export function resolveEventShareImageUrl(
  event?: {
    whatsappImage?: string;
    coverImage?: string;
    invitationCard?: string;
    customImage?: string;
  } | null,
  fallbackUrl: string | null = null,
) {
  const candidate =
    event?.whatsappImage ||
    event?.coverImage ||
    event?.invitationCard ||
    event?.customImage ||
    fallbackUrl;
  return absoluteShareImageUrl(candidate);
}

function isMobileShareClient() {
  if (typeof navigator === "undefined") return false;
  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent || "");
}

export function buildEventShareText({
  url,
  title,
  coupleLine,
  tagline,
  dateLine,
  timeLine,
  placeLine,
}: {
  url: string;
  title?: string;
  coupleLine?: string;
  tagline?: string;
  dateLine?: string;
  timeLine?: string;
  placeLine?: string;
}) {
  // No leading URL — desktop Chrome "Copy" after a file share prepends a local
  // WebShare path and glues it onto whatever starts the text.
  const lines = [
    coupleLine ? `🌸 ${coupleLine} 🌸` : null,
    tagline || title || "You're invited to celebrate with us!",
    dateLine ? `📅 ${dateLine}` : null,
    timeLine ? `⏰ ${timeLine}` : null,
    placeLine ? `📍 ${placeLine}` : null,
    "",
    `💍 View invitation:\n${url}`,
  ].filter((line) => line != null && line !== "");
  return lines.join("\n");
}

async function copyShareText(message: string) {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(message);
    return true;
  }
  try {
    const ta = document.createElement("textarea");
    ta.value = message;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

/**
 * Share event with image + link when the device supports it.
 * Desktop Chromium file+text shares pollute "Copy" with a local file path —
 * so files are only attached on mobile.
 */
export async function shareEventWithImage({
  url,
  text,
  imageUrl,
  title,
  fileName = "event-invite.png",
}: {
  url: string;
  text?: string;
  imageUrl?: string | null;
  title?: string;
  fileName?: string;
}) {
  const message = text || url;
  const openWhatsApp = () => {
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
  };

  const absoluteImage = absoluteShareImageUrl(imageUrl);
  const allowFileShare = isMobileShareClient();

  if (allowFileShare && absoluteImage) {
    try {
      const res = await fetch(absoluteImage);
      if (res.ok) {
        const blob = await res.blob();
        const type = blob.type && blob.type.startsWith("image/") ? blob.type : "image/png";
        const file = new File([blob], fileName, { type });
        if (navigator.canShare?.({ files: [file] })) {
          // Text only — URL is already inside message. Passing both can duplicate.
          await navigator.share({ files: [file], text: message, title: title || undefined });
          return;
        }
      }
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
    }
  }

  if (typeof navigator.share === "function") {
    try {
      // Prefer text-only payload so "Copy" stays clean on desktop Chrome.
      await navigator.share({ text: message, title: title || undefined });
      return;
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
    }
  }

  const copied = await copyShareText(message);
  if (copied) return;

  openWhatsApp();
}
