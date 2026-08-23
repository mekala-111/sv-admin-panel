"use client";

import CinematicLiveTheme from "./CinematicLiveTheme";
import EventThemeShell from "./EventThemeShell";
import SacredGardenTheme from "./SacredGardenTheme";
import TraditionalStreamingTheme from "./TraditionalStreamingTheme";
import WeddingThemeTraditional from "./WeddingThemeTraditional";

function resolveLayoutKey(theme) {
  const config = theme?.config && typeof theme.config === "object" ? theme.config : {};
  return config.layout || config.preset || theme?.slug || theme?.name || null;
}

function isWeddingTraditionalLayout(layout, key) {
  return (
    layout === "wedding-theme-traditional" ||
    layout === "telugu-wedding-traditional" ||
    key.includes("wedding-traditional") ||
    key.includes("telugu-wedding")
  );
}

function isTraditionalStreamingLayout(layout, key) {
  return (
    layout === "traditional-streaming" ||
    key.includes("traditional-streaming") ||
    (key.includes("streaming") && !key.includes("cinematic"))
  );
}

function isSacredGardenLayout(layout, key) {
  return (
    layout === "the-sacred-garden" ||
    key.includes("sacred-garden") ||
    key.includes("sacredgarden")
  );
}

function isCinematicLayout(layout, key) {
  return layout === "cinematic" || layout === "cinematic-live" || key.includes("cinematic");
}

export default function EventThemeRenderer(props) {
  const layout = resolveLayoutKey(props.theme);
  const key = layout ? String(layout).toLowerCase() : "";

  if (!layout) {
    return <EventThemeShell {...props} />;
  }
  if (isWeddingTraditionalLayout(layout, key)) {
    return <WeddingThemeTraditional {...props} />;
  }
  if (isTraditionalStreamingLayout(layout, key)) {
    return <TraditionalStreamingTheme {...props} />;
  }
  if (isSacredGardenLayout(layout, key)) {
    return <SacredGardenTheme {...props} />;
  }
  if (isCinematicLayout(layout, key)) {
    return <CinematicLiveTheme {...props} />;
  }
  return <EventThemeShell {...props} />;
}
