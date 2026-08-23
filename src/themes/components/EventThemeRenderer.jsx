"use client";

import CinematicLiveTheme from "./CinematicLiveTheme";
import CustomThemeBlocks from "./CustomThemeBlocks";
import EventThemeShell from "./EventThemeShell";
import SacredGardenTheme from "./SacredGardenTheme";
import TraditionalStreamingTheme from "./TraditionalStreamingTheme";
import WeddingThemeTraditional from "./WeddingThemeTraditional";

/**
 * Maps layout keys (from admin theme.config.layout) to guest renderers.
 * Register new layouts in admin only — add a renderer here when the layout needs custom UI.
 */
const LAYOUT_RENDERERS = {
  "wedding-theme-traditional": WeddingThemeTraditional,
  "telugu-wedding-traditional": WeddingThemeTraditional,
  "traditional-streaming": TraditionalStreamingTheme,
  "the-sacred-garden": SacredGardenTheme,
  cinematic: CinematicLiveTheme,
  "cinematic-live": CinematicLiveTheme,
};

function resolveLayoutRenderer(layout) {
  if (!layout) return EventThemeShell;
  const key = String(layout).toLowerCase();
  if (LAYOUT_RENDERERS[layout]) return LAYOUT_RENDERERS[layout];
  if (LAYOUT_RENDERERS[key]) return LAYOUT_RENDERERS[key];
  if (key.includes("wedding-traditional") || key.includes("telugu-wedding")) {
    return WeddingThemeTraditional;
  }
  if (key.includes("sacred-garden") || key.includes("sacredgarden")) {
    return SacredGardenTheme;
  }
  if (key.includes("traditional-streaming") || key.includes("streaming")) {
    return TraditionalStreamingTheme;
  }
  if (key.includes("cinematic")) {
    return CinematicLiveTheme;
  }
  return EventThemeShell;
}

function resolveLayoutKey(theme) {
  const config = theme?.config && typeof theme.config === "object" ? theme.config : {};
  return (
    config.layout ||
    config.preset ||
    theme?.slug ||
    theme?.name ||
    null
  );
}

export default function EventThemeRenderer(props) {
  const layout = resolveLayoutKey(props.theme);
  const Component = resolveLayoutRenderer(layout);
  return (
    <>
      <Component {...props} />
      <CustomThemeBlocks {...props} />
    </>
  );
}
