/**
 * CSS-only banner artwork for the "event-banner" layout. Each preset is drawn with layered
 * gradients — no image files — so themes work out of the box; an admin-uploaded
 * config.backgroundImage replaces the artwork. Keep in sync with sv-admin-panel/src/themes/lib.
 */

export type BannerDecoration = "bunting" | "toran" | "spotlight" | "confetti" | "mandala" | "frame" | null;

export type BannerPreset = {
  key: string;
  label: string;
  description: string;
  /** Must match the vendor panel's event type names (sv-vendor-panel/src/lib/data.ts). */
  eventTypes: string[];
  colors: { primary: string; secondary: string; accent: string; background: string; text: string };
  fontFamily: string;
  /** CSS `background` for the hero banner. */
  hero: string;
  /** Text colour over the hero. */
  heroText: string;
  decoration: BannerDecoration;
};

export const BANNER_PRESETS: BannerPreset[] = [
  {
    key: "birthday",
    label: "Birthday Balloons",
    description: "Royal blue with gold and blue balloons and party bunting.",
    eventTypes: ["Birthday"],
    colors: { primary: "#E9B949", secondary: "#123A9C", accent: "#7FB6FF", background: "#EEF3FF", text: "#14213D" },
    fontFamily: "Dancing Script, Lora, serif",
    hero: [
      "radial-gradient(circle at 12% 70%, rgba(233,185,73,.95) 0 9%, transparent 9.4%)",
      "radial-gradient(circle at 22% 42%, rgba(90,140,255,.85) 0 8%, transparent 8.4%)",
      "radial-gradient(circle at 30% 80%, rgba(40,90,220,.9) 0 7%, transparent 7.4%)",
      "radial-gradient(circle at 8% 28%, rgba(233,185,73,.8) 0 5%, transparent 5.4%)",
      "radial-gradient(circle at 70% 30%, rgba(255,255,255,.18) 0 1%, transparent 1.3%)",
      "radial-gradient(circle at 85% 65%, rgba(233,185,73,.5) 0 1%, transparent 1.3%)",
      "radial-gradient(120% 120% at 70% 40%, #2350C8 0%, #0E2A80 55%, #081A55 100%)",
    ].join(", "),
    heroText: "#FFFFFF",
    decoration: "bunting",
  },
  {
    key: "wedding-floral",
    label: "Wedding Floral",
    description: "Ivory watercolour with sage and blush washes inside a gold frame.",
    eventTypes: ["Marriage", "Marriage-Events", "Engagement", "Reception"],
    colors: { primary: "#B08D3C", secondary: "#2F5D46", accent: "#C9737F", background: "#FBF8F1", text: "#3B3326" },
    fontFamily: "Great Vibes, Cormorant Garamond, serif",
    hero: [
      "radial-gradient(38% 46% at 10% 18%, rgba(47,93,70,.55), transparent 70%)",
      "radial-gradient(30% 40% at 92% 82%, rgba(47,93,70,.45), transparent 70%)",
      "radial-gradient(22% 30% at 86% 14%, rgba(201,115,127,.45), transparent 70%)",
      "radial-gradient(26% 32% at 16% 86%, rgba(214,160,110,.4), transparent 70%)",
      "linear-gradient(180deg, #FFFDF8 0%, #F6F0E2 100%)",
    ].join(", "),
    heroText: "#3B3326",
    decoration: "frame",
  },
  {
    key: "public-event",
    label: "Public Event Spotlight",
    description: "Concert-style blue spotlights — schools, annual days and public events.",
    eventTypes: ["General Event", "Reunion", "Retirement"],
    colors: { primary: "#4FC3F7", secondary: "#0B1B3F", accent: "#B3E5FC", background: "#F2F6FC", text: "#0B1B3F" },
    fontFamily: "Lora, Georgia, serif",
    hero: [
      "conic-gradient(from 200deg at 30% -10%, transparent 0deg, rgba(160,220,255,.35) 12deg, transparent 26deg)",
      "conic-gradient(from 140deg at 70% -10%, transparent 0deg, rgba(160,220,255,.3) 14deg, transparent 30deg)",
      "radial-gradient(60% 50% at 50% 100%, rgba(30,90,200,.6), transparent 70%)",
      "linear-gradient(180deg, #0A1A44 0%, #06102C 100%)",
    ].join(", "),
    heroText: "#FFFFFF",
    decoration: "spotlight",
  },
  {
    key: "devotional",
    label: "Devotional Saffron",
    description: "Saffron to deep maroon glow with a soft mandala.",
    eventTypes: ["Devotional", "Padi Pooja"],
    colors: { primary: "#F4A300", secondary: "#6E0F1F", accent: "#FFD27A", background: "#FFF7EA", text: "#4A1A10" },
    fontFamily: "Cormorant Garamond, Georgia, serif",
    hero: [
      "repeating-conic-gradient(from 0deg at 50% 55%, rgba(255,210,122,.14) 0deg 6deg, transparent 6deg 15deg)",
      "radial-gradient(45% 60% at 50% 55%, #FFB22E 0%, #E06A00 45%, transparent 75%)",
      "linear-gradient(180deg, #8E1B1B 0%, #5A0B16 100%)",
    ].join(", "),
    heroText: "#FFF6E0",
    decoration: "mandala",
  },
  {
    key: "housewarming",
    label: "Gruhapravesham",
    description: "Warm terracotta and marigold with a toran across the top.",
    eventTypes: ["Gruhapravesham"],
    colors: { primary: "#E07B24", secondary: "#7A2E12", accent: "#F2C14E", background: "#FFF6EC", text: "#4A2410" },
    fontFamily: "Cormorant Garamond, Georgia, serif",
    hero: [
      "radial-gradient(70% 60% at 50% 110%, rgba(242,193,78,.45), transparent 70%)",
      "linear-gradient(160deg, #C4561B 0%, #8C3410 60%, #5E200A 100%)",
    ].join(", "),
    heroText: "#FFF3DE",
    decoration: "toran",
  },
  {
    key: "baby",
    label: "Baby Pastel",
    description: "Soft pink and sky pastel clouds — baby shower, cradle and naming ceremonies.",
    eventTypes: ["Baby Shower", "Cradle Ceremony", "Namakarana", "Seemantham"],
    colors: { primary: "#E88FB0", secondary: "#7FB8E6", accent: "#FFD6E4", background: "#FFF8FB", text: "#4A3A55" },
    fontFamily: "Dancing Script, Lora, serif",
    hero: [
      "radial-gradient(28% 34% at 18% 30%, rgba(255,255,255,.85), transparent 70%)",
      "radial-gradient(24% 30% at 78% 70%, rgba(255,255,255,.8), transparent 70%)",
      "radial-gradient(18% 22% at 60% 22%, rgba(255,255,255,.7), transparent 70%)",
      "linear-gradient(135deg, #FFD3E2 0%, #E8DDF7 50%, #CFE6FA 100%)",
    ].join(", "),
    heroText: "#4A3A55",
    decoration: "confetti",
  },
  {
    key: "sangeeth",
    label: "Sangeeth Night",
    description: "Magenta and violet night with confetti sparkle.",
    eventTypes: ["Sangeeth", "Half Saree", "Vonifunction"],
    colors: { primary: "#FF4FA3", secondary: "#2A0D4A", accent: "#FFC857", background: "#FBF3FF", text: "#2A0D4A" },
    fontFamily: "Great Vibes, Lora, serif",
    hero: [
      "radial-gradient(50% 60% at 20% 30%, rgba(255,79,163,.55), transparent 70%)",
      "radial-gradient(45% 55% at 85% 70%, rgba(124,77,255,.55), transparent 70%)",
      "linear-gradient(160deg, #3A0E5E 0%, #1C0634 100%)",
    ].join(", "),
    heroText: "#FFFFFF",
    decoration: "confetti",
  },
  {
    key: "traditional-maroon",
    label: "Traditional Maroon & Gold",
    description: "Maroon silk with a gold border — upanayanam, dhoti and milestone ceremonies.",
    eventTypes: ["Upanayanam", "Dhothi Ceremony", "Shastipoorthi"],
    colors: { primary: "#D4A53C", secondary: "#6B0F1A", accent: "#F3D58A", background: "#FBF4E8", text: "#4A0E14" },
    fontFamily: "Cormorant Garamond, Georgia, serif",
    hero: [
      "repeating-linear-gradient(45deg, rgba(212,165,60,.08) 0 2px, transparent 2px 14px)",
      "radial-gradient(60% 70% at 50% 50%, #8E1B2A 0%, #5A0A14 100%)",
    ].join(", "),
    heroText: "#F8E7C2",
    decoration: "frame",
  },
  {
    key: "church",
    label: "Church Light",
    description: "Soft sky with rays of light — church services and christenings.",
    eventTypes: ["Church Event"],
    colors: { primary: "#3A6EA5", secondary: "#E7F0FA", accent: "#E9C46A", background: "#F7FAFD", text: "#1E3350" },
    fontFamily: "Lora, Georgia, serif",
    hero: [
      "conic-gradient(from 160deg at 50% -20%, transparent 0deg, rgba(255,255,255,.55) 8deg, transparent 16deg, rgba(255,255,255,.45) 26deg, transparent 34deg)",
      "linear-gradient(180deg, #BFD8F2 0%, #EAF3FB 100%)",
    ].join(", "),
    heroText: "#1E3350",
    decoration: null,
  },
  {
    key: "emerald-arch",
    label: "Emerald Arch",
    description: "Emerald and gold geometric pattern — Muslim weddings and nikah.",
    eventTypes: ["Muslim Wedding"],
    colors: { primary: "#D4AF37", secondary: "#0B4D3B", accent: "#F1DFA0", background: "#F4FAF7", text: "#0B3A2D" },
    fontFamily: "Cormorant Garamond, Georgia, serif",
    hero: [
      "repeating-conic-gradient(from 45deg at 50% 50%, rgba(212,175,55,.12) 0deg 15deg, transparent 15deg 45deg)",
      "radial-gradient(70% 80% at 50% 40%, #13705A 0%, #073B2E 100%)",
    ].join(", "),
    heroText: "#F6EBC8",
    decoration: "frame",
  },
  {
    key: "dark-gold",
    label: "Dark Gold",
    description: "Black with a warm gold glow — works for any event.",
    eventTypes: [],
    colors: { primary: "#E8C36A", secondary: "#141009", accent: "#F3DDA0", background: "#0E0C09", text: "#F7F1E6" },
    fontFamily: "Cormorant Garamond, Georgia, serif",
    hero: [
      "radial-gradient(50% 70% at 75% 40%, rgba(232,195,106,.28), transparent 70%)",
      "radial-gradient(40% 60% at 15% 80%, rgba(232,195,106,.12), transparent 70%)",
      "linear-gradient(180deg, #17120A 0%, #0A0806 100%)",
    ].join(", "),
    heroText: "#F7E7C0",
    decoration: null,
  },
];

export function getBannerPreset(key?: string | null): BannerPreset {
  return BANNER_PRESETS.find((p) => p.key === key) ?? BANNER_PRESETS[BANNER_PRESETS.length - 1];
}
