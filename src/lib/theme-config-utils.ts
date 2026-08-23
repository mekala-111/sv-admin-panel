import type {
  ThemeConfig,
  ThemeCustomSection,
  ThemeFieldDef,
  ThemeSections,
} from "@/themes/theme-templates";
import {
  getThemeTemplate,
  resolveThemeFields,
  resolveThemeSections,
  THEME_TEMPLATES,
} from "@/themes/theme-templates";

export type ThemeSampleContent = Record<string, string | unknown>;

export const DEFAULT_SAMPLE_WEDDING: ThemeSampleContent = {
  brideName: "Priya",
  groomName: "Rahul",
  pageTitle: "Priya & Rahul Wedding",
  eventDate: "2026-12-15",
  startTime: "2026-12-15T18:00:00.000Z",
  eventTime: "6:00 PM IST",
  eventPlace: "Grand Convention Hall, Hyderabad",
  scrollMessage: "Welcome to our celebration",
  description: "With the blessings of our families, we invite you to celebrate with us.",
  remarks1: "Your presence is our greatest gift.",
  subEvents: [
    { title: "Haldi", date: "14 Dec 2026", time: "10:00 AM", place: "Family Home" },
    { title: "Wedding Ceremony", date: "15 Dec 2026", time: "6:00 PM", place: "Grand Convention Hall" },
    { title: "Reception", date: "16 Dec 2026", time: "7:00 PM", place: "Lakeview Banquet" },
  ],
  galleryImages: [],
};

export const DEFAULT_SAMPLE_LIVE: ThemeSampleContent = {
  pageTitle: "Annual Live Celebration",
  eventDate: "2026-11-20",
  startTime: "2026-11-20T19:00:00.000Z",
  eventTime: "7:00 PM IST",
  eventPlace: "City Auditorium",
  scrollMessage: "Welcome — stream begins shortly",
  description: "Join us for an unforgettable live experience.",
};

export function defaultSampleForTemplate(templateId: string): ThemeSampleContent {
  const template = getThemeTemplate(templateId);
  const layout = template?.config.layout ?? "";
  const isWedding =
    layout.includes("wedding") || layout.includes("floral") || layout === "traditional";
  const base = isWedding ? DEFAULT_SAMPLE_WEDDING : DEFAULT_SAMPLE_LIVE;
  const defaults = template?.config.defaults ?? {};
  return {
    ...base,
    scrollMessage: defaults.scrollMessage ?? base.scrollMessage,
    remarks1: defaults.remarks1 ?? base.remarks1,
  };
}

export function mergeThemeConfig(
  templateId: string,
  overrides: {
    colors?: Partial<ThemeConfig["colors"]>;
    fontFamily?: string;
    sections?: Partial<ThemeSections>;
    sectionOrder?: ThemeConfig["sectionOrder"];
    defaults?: Record<string, string>;
    fields?: ThemeFieldDef[];
    customSections?: ThemeCustomSection[];
    backgroundImage?: string;
  }
): ThemeConfig {
  const template = getThemeTemplate(templateId) ?? THEME_TEMPLATES[0];
  const base = template.config;
  return {
    ...base,
    colors: { ...base.colors, ...(overrides.colors ?? {}) },
    fontFamily: overrides.fontFamily?.trim() || base.fontFamily,
    sections: { ...base.sections, ...(overrides.sections ?? {}) },
    sectionOrder: overrides.sectionOrder ?? base.sectionOrder,
    defaults: { ...(base.defaults ?? {}), ...(overrides.defaults ?? {}) },
    fields: overrides.fields ?? base.fields,
    customSections: overrides.customSections ?? base.customSections ?? [],
    backgroundImage: overrides.backgroundImage ?? base.backgroundImage,
    layout: base.layout,
  };
}

export function configFromStored(
  templateId: string,
  stored?: Partial<ThemeConfig> | null
): ThemeConfig {
  if (!stored?.layout && !stored?.colors) {
    return mergeThemeConfig(templateId, {});
  }
  const template = getThemeTemplate(templateId) ?? THEME_TEMPLATES[0];
  return {
    ...template.config,
    ...stored,
    colors: { ...template.config.colors, ...(stored.colors ?? {}) },
    sections: { ...template.config.sections, ...(stored.sections ?? {}) },
    defaults: { ...(template.config.defaults ?? {}), ...(stored.defaults ?? {}) },
    fields: stored.fields?.length ? stored.fields : template.config.fields,
    customSections: stored.customSections ?? template.config.customSections ?? [],
    backgroundImage: stored.backgroundImage ?? template.config.backgroundImage,
  };
}

export function buildThemePreviewPayload(opts: {
  themeName: string;
  themeSlug?: string;
  config: ThemeConfig;
  sample: ThemeSampleContent;
  previewImage?: string | null;
  includeLive?: boolean;
}) {
  const { themeName, themeSlug, config, sample, previewImage, includeLive = true } = opts;
  const sections = resolveThemeSections(config);
  const subEvents = Array.isArray(sample.subEvents) ? sample.subEvents : [];
  const galleryUrls = Array.isArray(sample.galleryImages)
    ? (sample.galleryImages as string[])
    : config.layout.includes("wedding")
      ? [
          "/themes/wedding-theme-traditional/assets/gallery-1.jpg",
          "/themes/wedding-theme-traditional/assets/gallery-2.jpg",
          "/themes/wedding-theme-traditional/assets/gallery-3.jpg",
        ]
      : [];

  const event = {
    ...sample,
    eventName: String(sample.pageTitle || themeName || "Preview Event"),
    pageTitle: String(sample.pageTitle || themeName || "Preview Event"),
    eventType: config.layout.includes("wedding") ? "Wedding" : "Live Event",
    eventDate: sample.eventDate ?? null,
    startTime: sample.startTime ?? sample.eventDate ?? null,
    eventTime: sample.eventTime ?? null,
    eventPlace: sample.eventPlace ?? null,
    location: sample.eventPlace ?? null,
    description: sample.description ?? null,
    remarks1: sample.remarks1 ?? config.defaults?.remarks1 ?? null,
    remarks2: sample.remarks2 ?? null,
    scrollMessage: sample.scrollMessage ?? config.defaults?.scrollMessage ?? null,
    fontFamily: config.fontFamily,
    fontColor: config.colors.text,
    brideName: sample.brideName ?? null,
    groomName: sample.groomName ?? null,
    brideImage: sample.brideImage ?? previewImage ?? null,
    groomImage: sample.groomImage ?? null,
    coverImage: sample.coverImage ?? previewImage ?? null,
    invitationCard: sample.invitationCard ?? null,
    subEvents,
    status: "UPCOMING",
    showWatchLive: true,
    showSocialShare: false,
  };

  const media = galleryUrls.map((fileUrl, index) => ({
    id: `gallery-${index}`,
    fileUrl,
    thumbnailUrl: fileUrl,
    type: "IMAGE",
  }));

  const showLive =
    includeLive &&
    sections.showLivePlayer !== false;

  return {
    event,
    theme: {
      name: themeName,
      slug: themeSlug || config.layout,
      config,
    },
    branding: {
      companyName: "SV Live Preview",
    },
    youtube: showLive
      ? {
          videoId: null,
          liveUrl: null,
          status: "SCHEDULED",
        }
      : null,
    media,
    publicPath: "/event/draft",
  };
}

export function fieldKeysForPreview(fields: ThemeFieldDef[]): ThemeFieldDef[] {
  return fields.filter((f) => f.type !== "gallery" && f.type !== "subEvents");
}
