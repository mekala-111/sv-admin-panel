"use client";

import EventThemeShell from "./EventThemeShell";
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
};

function resolveLayoutRenderer(layout) {
  if (!layout) return EventThemeShell;
  if (LAYOUT_RENDERERS[layout]) return LAYOUT_RENDERERS[layout];
  if (layout.includes("wedding-traditional") || layout.includes("telugu-wedding")) {
    return WeddingThemeTraditional;
  }
  return EventThemeShell;
}

export default function EventThemeRenderer(props) {
  const layout = props.theme?.config?.layout;
  const Component = resolveLayoutRenderer(layout);
  return <Component {...props} />;
}
