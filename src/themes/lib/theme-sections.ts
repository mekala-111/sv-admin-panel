/** Section toggles come from theme.config (registered in admin). No local template registry. */
export function resolveThemeSections(theme?: { config?: { sections?: Record<string, boolean> } } | null) {
  const sections = theme?.config?.sections ?? {};
  return {
    showCountdown: sections.showCountdown !== false,
    showGallery: sections.showGallery !== false,
    showSubEvents: sections.showSubEvents !== false,
    showLivePlayer: sections.showLivePlayer !== false,
    showInvitationCard: sections.showInvitationCard !== false,
    showCouplePhotos: sections.showCouplePhotos !== false,
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
