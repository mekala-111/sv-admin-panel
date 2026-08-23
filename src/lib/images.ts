// Maps design "image slot" ids to the real uploaded assets that were dropped
// into the Claude Design prototype (extracted from .image-slots.state.json).
// Slots not listed here render the striped placeholder instead.
const REAL_IMAGES: Record<string, string> = {
  "settings-logo": "/images/settings-logo.webp",
  "profile-photo": "/images/profile-photo.webp",
  "admin-avatar": "/images/admin-avatar.webp",
  "th-1": "/images/th-1.webp",
  "th-2": "/images/th-2.webp",
  "th-3": "/images/th-3.webp",
  "th-4": "/images/th-4.webp",
  "th-5": "/images/th-5.webp",
  "th-6": "/images/th-6.webp",
  "th-7": "/images/th-7.webp",
  "th-8": "/images/th-8.webp",
  "ln-1": "/images/ln-1.webp",
  "ln-2": "/images/ln-2.webp",
  "ln-3": "/images/ln-3.webp",
  "ln-4": "/images/ln-4.webp",
};

export function realImageFor(slotId: string): string | null {
  return REAL_IMAGES[slotId] ?? null;
}

export const realImageFor = realImageFor;
export const svLiveLogo = "/images/sv-live-logo.png";
export const svLiveLogo = svLiveLogo;
