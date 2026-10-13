/** Section toggles: theme.config.sections, overridden by event / branding.customConfig. */
export function resolveThemeSections(
  theme?: { config?: { sections?: Record<string, boolean> } } | null,
  overrides?: {
    showSubEvents?: boolean | null;
    showInvitationCard?: boolean | null;
    showCountdown?: boolean | null;
    showGallery?: boolean | null;
    showLivePlayer?: boolean | null;
    showCouplePhotos?: boolean | null;
  } | null,
) {
  const sections = theme?.config?.sections ?? {};
  const pick = (
    key: keyof NonNullable<typeof overrides>,
    fromSections: boolean,
  ) => {
    const v = overrides?.[key];
    if (v === false || v === true) return v;
    return fromSections;
  };

  return {
    showCountdown: pick("showCountdown", sections.showCountdown !== false),
    showGallery: pick("showGallery", sections.showGallery !== false),
    showSubEvents: pick("showSubEvents", sections.showSubEvents !== false),
    showLivePlayer: pick("showLivePlayer", sections.showLivePlayer !== false),
    showInvitationCard: pick("showInvitationCard", sections.showInvitationCard !== false),
    showCouplePhotos: pick("showCouplePhotos", sections.showCouplePhotos !== false),
  };
}

export function shouldShowLivePlayer(
  sections: { showLivePlayer?: boolean },
  youtube?: { liveUrl?: string; videoId?: string } | null,
  embed?: unknown,
  event?: { showWatchLive?: boolean } | null,
) {
  if (sections.showLivePlayer === false) return false;
  if (event?.showWatchLive !== false) return true;
  return Boolean(embed || youtube?.liveUrl || youtube?.videoId);
}

const SECTION_KEYS = [
  "showCountdown",
  "showGallery",
  "showSubEvents",
  "showLivePlayer",
  "showInvitationCard",
  "showCouplePhotos",
] as const;

/** Per-event section toggles: branding.customConfig wins over event fields; unset keys fall back to the theme. */
export function sectionOverridesFrom(
  event?: Record<string, unknown> | null,
  branding?: { customConfig?: Record<string, unknown> | null } | null,
) {
  const custom = branding?.customConfig ?? {};
  const overrides: Record<string, boolean | null> = {};
  for (const key of SECTION_KEYS) {
    const v = custom[key] ?? event?.[key];
    overrides[key] = typeof v === "boolean" ? v : null;
  }
  return overrides as NonNullable<Parameters<typeof resolveThemeSections>[1]>;
}
