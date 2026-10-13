export type ThemeFieldType =
  | "text"
  | "date"
  | "time"
  | "textarea"
  | "image"
  | "subEvents"
  | "gallery";

export type ThemeFieldDef = {
  key: string;
  label: string;
  type: ThemeFieldType;
  required?: boolean;
  placeholder?: string;
  hint?: string;
  maxItems?: number;
};

export type ThemeSections = {
  showCountdown: boolean;
  showGallery: boolean;
  showSubEvents: boolean;
  showLivePlayer: boolean;
  showInvitationCard: boolean;
  showCouplePhotos: boolean;
};

export type ThemeCustomSection = {
  id: string;
  title: string;
  fieldKey: string;
};

export type ThemeConfig = {
  layout: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  fontFamily: string;
  assetPath?: string;
  backgroundImage?: string;
  sections: ThemeSections;
  sectionOrder?: (keyof ThemeSections)[];
  customSections?: ThemeCustomSection[];
  fields: ThemeFieldDef[];
  defaults?: Record<string, string>;
  /** Vendor wizard shows this design only for these event types; empty = all types. */
  eventTypes?: string[];
};

export type ThemeTemplate = {
  id: string;
  label: string;
  description: string;
  previewImage: string;
  config: ThemeConfig;
};

export const WEDDING_FIELDS: ThemeFieldDef[] = [
  { key: "brideName", label: "Bride name", type: "text", required: true, placeholder: "Priya" },
  { key: "groomName", label: "Groom name", type: "text", required: true, placeholder: "Rahul" },
  {
    key: "brideImage",
    label: "Bride image",
    type: "image",
    hint: "Any size · JPEG/PNG/WebP",
  },
  {
    key: "groomImage",
    label: "Groom image",
    type: "image",
    hint: "Any size · JPEG/PNG/WebP",
  },
  { key: "eventDate", label: "Event date", type: "date" },
  { key: "eventTime", label: "Event time", type: "text", placeholder: "6:00 PM IST" },
  { key: "eventPlace", label: "Event place", type: "text", placeholder: "Venue name, city" },
  { key: "subEvents", label: "Sub events", type: "subEvents" },
  {
    key: "invitationCard",
    label: "Invitation card",
    type: "image",
    hint: "Any size · full invitation image",
  },
  { key: "galleryImages", label: "Gallery images", type: "gallery", maxItems: 20 },
  { key: "description", label: "Blessing message", type: "textarea", placeholder: "Divine blessings text" },
  {
    key: "remarks1",
    label: "Hosts",
    type: "textarea",
    placeholder: "Host names on first line, place on second line",
  },
  { key: "remarks2", label: "Family members", type: "textarea", placeholder: "One paragraph per line" },
  { key: "logoImage", label: "Host photo 1", type: "image", hint: "Any size · JPEG/PNG/WebP" },
  { key: "customImage", label: "Host photo 2", type: "image", hint: "Any size · JPEG/PNG/WebP" },
];

export const LIVE_EVENT_FIELDS: ThemeFieldDef[] = [
  { key: "pageTitle", label: "Page headline", type: "text", placeholder: "Live event title" },
  { key: "eventDate", label: "Event date", type: "date" },
  { key: "eventTime", label: "Event time", type: "text", placeholder: "7:00 PM IST" },
  { key: "eventPlace", label: "Venue", type: "text", placeholder: "City or venue" },
  {
    key: "coverImage",
    label: "Cover image",
    type: "image",
    hint: "Any size · JPEG/PNG/WebP",
  },
  { key: "scrollMessage", label: "Ticker message", type: "textarea", placeholder: "Welcome message" },
  { key: "galleryImages", label: "Gallery images", type: "gallery", maxItems: 12 },
];

const WEDDING_SECTIONS: ThemeSections = {
  showCountdown: true,
  showGallery: true,
  showSubEvents: true,
  showLivePlayer: true,
  showInvitationCard: true,
  showCouplePhotos: true,
};

const LIVE_SECTIONS: ThemeSections = {
  showCountdown: true,
  showGallery: true,
  showSubEvents: false,
  showLivePlayer: true,
  showInvitationCard: false,
  showCouplePhotos: false,
};

/** Single source of truth for theme blueprints — synced to backend seed via theme-template-configs.ts */
export const THEME_TEMPLATES: ThemeTemplate[] = [
  {
    id: "wedding-theme-traditional",
    label: "Wedding Theme Traditional",
    description: "Traditional Indian wedding — maroon, gold, and floral styling.",
    previewImage: "/images/th-1.webp",
    config: {
      layout: "wedding-theme-traditional",
      colors: {
        primary: "#B8860A",
        secondary: "#7A1626",
        accent: "#D8B25C",
        background: "#FBF6EC",
        text: "#5A4A2E",
      },
      fontFamily: "Great Vibes, Cormorant Garamond, serif",
      assetPath: "/themes/wedding-theme-traditional",
      sections: WEDDING_SECTIONS,
      fields: WEDDING_FIELDS,
      defaults: { scrollMessage: "Welcome to our celebration" },
    },
  },
  {
    id: "cinematic",
    label: "Cinematic",
    description: "Dark cinematic layout with gold accents — ideal for live streams.",
    previewImage: "/images/th-2.webp",
    config: {
      layout: "cinematic",
      colors: {
        primary: "#E8C36A",
        secondary: "#1A1208",
        accent: "#E8C36A",
        background: "#0B0908",
        text: "#F7F1E6",
      },
      fontFamily: "Cormorant Garamond, Georgia, serif",
      sections: LIVE_SECTIONS,
      fields: LIVE_EVENT_FIELDS,
    },
  },
  {
    id: "traditional",
    label: "Traditional",
    description: "Classic maroon and cream palette for formal ceremonies.",
    previewImage: "/images/th-3.webp",
    config: {
      layout: "traditional",
      colors: {
        primary: "#8B1E3F",
        secondary: "#F5E6D3",
        accent: "#C9A227",
        background: "#2A0F18",
        text: "#F8EFE4",
      },
      fontFamily: "Playfair Display, Georgia, serif",
      sections: { ...WEDDING_SECTIONS, showInvitationCard: false },
      fields: WEDDING_FIELDS.filter((f) => f.key !== "invitationCard"),
    },
  },
  {
    id: "floral",
    label: "Floral Rose",
    description: "Soft rose and blush tones for romantic celebrations.",
    previewImage: "/images/th-4.webp",
    config: {
      layout: "floral",
      colors: {
        primary: "#C45C7A",
        secondary: "#FFE8F0",
        accent: "#E8A0B5",
        background: "#FFF7FA",
        text: "#4A2A35",
      },
      fontFamily: "Great Vibes, cursive",
      sections: WEDDING_SECTIONS,
      fields: WEDDING_FIELDS,
    },
  },
  {
    id: "classic",
    label: "Classic Light",
    description: "Clean light layout suitable for corporate and general events.",
    previewImage: "/images/th-5.webp",
    config: {
      layout: "classic",
      colors: {
        primary: "#1F4B7A",
        secondary: "#EEF3F8",
        accent: "#C9A227",
        background: "#F7F9FC",
        text: "#1B2430",
      },
      fontFamily: "Lora, Georgia, serif",
      sections: LIVE_SECTIONS,
      fields: LIVE_EVENT_FIELDS,
    },
  },
  {
    id: "traditional-streaming",
    label: "Traditional Streaming Theme",
    description:
      "Telugu traditional live stream — maroon, gold, toran borders, and ornate player frame.",
    previewImage: "/images/th-3.webp",
    config: {
      layout: "traditional-streaming",
      colors: {
        primary: "#B8860A",
        secondary: "#7A1626",
        accent: "#D8B25C",
        background: "#FBF6EC",
        text: "#5A4A2E",
      },
      fontFamily: "Cormorant Garamond, Peddana, Ramabhadra, serif",
      assetPath: "/themes/traditional-streaming",
      sections: LIVE_SECTIONS,
      fields: LIVE_EVENT_FIELDS,
      defaults: {
        scrollMessage: "స్వాగతం — ప్రత్యక్ష ప్రసారం త్వరలో ప్రారంభమవుతుంది",
        tagline: "ప్రత్యక్ష ప్రసారానికి స్వాగతం",
      },
    },
  },
  {
    id: "the-sacred-garden",
    label: "The Sacred Garden",
    description:
      "Soft ivory garden invitation — Pinyon Script, gold accents, envelope open, and petal field.",
    previewImage: "/themes/the-sacred-garden/assets/couple-portrait.webp",
    config: {
      layout: "the-sacred-garden",
      colors: {
        primary: "#A67D2B",
        secondary: "#5A0F1B",
        accent: "#87966C",
        background: "#FFF9EB",
        text: "#6C513F",
      },
      fontFamily: "Pinyon Script, Cinzel, Cormorant Garamond, serif",
      assetPath: "/themes/the-sacred-garden",
      sections: WEDDING_SECTIONS,
      fields: WEDDING_FIELDS,
      defaults: {
        tagline: "The Sacred Garden",
        scrollMessage: "Together with their families",
        description:
          "Two souls, one beautiful journey, surrounded by love, blessed by family, and beginning forever together.",
      },
    },
  },
];

export function getThemeTemplate(id: string): ThemeTemplate | undefined {
  return THEME_TEMPLATES.find((t) => t.id === id);
}

export function getTemplateIdFromLayout(layout?: string | null): string {
  if (!layout) return THEME_TEMPLATES[0]?.id ?? "wedding-theme-traditional";
  const byLayout = THEME_TEMPLATES.find((t) => t.config.layout === layout);
  if (byLayout) return byLayout.id;
  const byId = THEME_TEMPLATES.find((t) => t.id === layout);
  return byId?.id ?? THEME_TEMPLATES[0]?.id ?? "wedding-theme-traditional";
}

/** Resolve field definitions from stored theme config or layout fallback. */
export function resolveThemeFields(config?: { layout?: string; fields?: ThemeFieldDef[] } | null): ThemeFieldDef[] {
  if (config?.fields?.length) return config.fields;
  const template = THEME_TEMPLATES.find((t) => t.config.layout === config?.layout);
  return template?.config.fields ?? WEDDING_FIELDS;
}

export function resolveThemeSections(config?: { layout?: string; sections?: Partial<ThemeSections> } | null): ThemeSections {
  const template = THEME_TEMPLATES.find((t) => t.config.layout === config?.layout);
  const base = template?.config.sections ?? WEDDING_SECTIONS;
  return { ...base, ...(config?.sections ?? {}) };
}
