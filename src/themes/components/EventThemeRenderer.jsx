"use client";

import CinematicLiveTheme from "./CinematicLiveTheme";
import EventBannerTheme from "./EventBannerTheme";
import CustomThemeBlocks from "./CustomThemeBlocks";
import EventThemeShell from "./EventThemeShell";
import SacredGardenTheme from "./SacredGardenTheme";
import TraditionalStreamingTheme from "./TraditionalStreamingTheme";
import WeddingThemeTraditional from "./WeddingThemeTraditional";

/** Exact layout keys (admin theme.config.layout). Checked before any fuzzy matching. */
const EXACT_LAYOUTS = {
  "wedding-theme-traditional": "wedding",
  "telugu-wedding-traditional": "wedding",
  "traditional-streaming": "streaming",
  "the-sacred-garden": "sacred",
  cinematic: "cinematic",
  "cinematic-live": "cinematic",
  "event-banner": "banner",
};

function resolveLayoutKey(theme) {
  const config = theme?.config && typeof theme.config === "object" ? theme.config : {};
  return config.layout || config.preset || theme?.slug || theme?.name || null;
}

/** Fuzzy fallback for older themes whose layout is only implied by slug/name. */
function resolveRenderer(layout) {
  if (!layout) return "shell";
  const key = String(layout).toLowerCase();
  if (EXACT_LAYOUTS[key]) return EXACT_LAYOUTS[key];
  if (key.includes("wedding-traditional") || key.includes("telugu-wedding")) return "wedding";
  if (key.includes("sacred-garden") || key.includes("sacredgarden")) return "sacred";
  if (key.includes("traditional-streaming")) return "streaming";
  if (key.includes("cinematic")) return "cinematic";
  return "shell";
}

function renderLayout(renderer, props) {
  switch (renderer) {
    case "wedding":
      return <WeddingThemeTraditional {...props} />;
    case "streaming":
      return <TraditionalStreamingTheme {...props} />;
    case "sacred":
      return <SacredGardenTheme {...props} />;
    case "cinematic":
      return <CinematicLiveTheme {...props} />;
    case "banner":
      return <EventBannerTheme {...props} />;
    default:
      return <EventThemeShell {...props} />;
  }
}

export default function EventThemeRenderer(props) {
  return (
    <>
      {renderLayout(resolveRenderer(resolveLayoutKey(props.theme)), props)}
      <CustomThemeBlocks {...props} />
    </>
  );
}
