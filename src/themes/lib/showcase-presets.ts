/**
 * Styles for the "showcase" layout — portrait live-stream cards (photo frame, LIVE STREAM title,
 * LIVE NOW pill, framed player, message, Date · Venue · tagline row). Decorations are CSS-only;
 * the photo is the event's cover image. Keep in sync with sv-admin-panel/src/themes/lib.
 */

export type ShowcaseFrame = "arch" | "circle" | "hexagon" | "wide" | "none";

export type ShowcaseDecor =
  | "gold-border"
  | "floral-corners"
  | "lanterns"
  | "bells"
  | "om"
  | "gold-swirl"
  | "bokeh"
  | "glass"
  | "neon-lines"
  | "stage-lights"
  | "equalizer"
  | "broadcast";

export type ShowcasePreset = {
  key: string;
  label: string;
  description: string;
  /** Vendor event types this suits; empty = every type. Names match sv-vendor-panel/src/lib/data.ts. */
  eventTypes: string[];
  colors: {
    primary: string; // title / accents
    secondary: string; // player border / pills
    accent: string; // eyebrow / small text
    background: string; // page
    text: string; // body text
  };
  /** Page background (CSS `background`). */
  page: string;
  titleFont: string;
  bodyFont: string;
  titleStyle?: "caps" | "italic" | "script";
  frame: ShowcaseFrame;
  /** CSS filter for the photo (e.g. black & white). */
  photoFilter?: string;
  playerGlow?: string;
  decor: ShowcaseDecor[];
  eyebrow: string;
  headline: string;
  message: string;
  tagline: string;
  footnote?: string;
};

const SERIF_CAPS = "Cinzel, 'Cormorant Garamond', Georgia, serif";
const SERIF_BODY = "'Cormorant Garamond', Georgia, serif";
const SANS = "Montserrat, 'Helvetica Neue', Arial, sans-serif";

export const SHOWCASE_PRESETS: ShowcasePreset[] = [
  {
    key: "royal-wedding",
    label: "Royal Wedding",
    description: "Ivory and gold with a palace arch, floral corners and hanging lanterns.",
    eventTypes: ["Marriage", "Marriage-Events", "Engagement", "Reception", "Muslim Wedding"],
    colors: { primary: "#B8862B", secondary: "#C9A24A", accent: "#7A1F1F", background: "#F8EFDC", text: "#5B4632" },
    page: "radial-gradient(120% 80% at 50% 0%, #FFF8EA 0%, #F6EAD2 60%, #EEDDBC 100%)",
    titleFont: SERIF_CAPS,
    bodyFont: SERIF_BODY,
    titleStyle: "caps",
    frame: "arch",
    decor: ["gold-border", "floral-corners", "lanterns"],
    eyebrow: "The Wedding Celebration",
    headline: "Live Stream",
    message: "Thank you for being a part of our special day.",
    tagline: "With Family & Friends",
  },
  {
    key: "cinematic-black",
    label: "Cinematic Black",
    description: "Black-and-white film look with a widescreen photo — elegant for any event.",
    eventTypes: [],
    colors: { primary: "#F2F2F2", secondary: "#8C8C8C", accent: "#BDBDBD", background: "#0A0A0A", text: "#D6D6D6" },
    page: "radial-gradient(90% 60% at 50% 20%, #1C1C1C 0%, #0A0A0A 70%)",
    titleFont: SERIF_CAPS,
    bodyFont: SERIF_BODY,
    titleStyle: "caps",
    frame: "wide",
    photoFilter: "grayscale(1) contrast(1.1)",
    decor: [],
    eyebrow: "A Special Moment",
    headline: "Live Stream",
    message: "We are delighted to share this beautiful moment with you.",
    tagline: "Save the Date",
    footnote: "Save the Date",
  },
  {
    key: "luxury-gold",
    label: "Luxury Gold",
    description: "Black with flowing gold light and a gold-ringed portrait.",
    eventTypes: ["Marriage", "Reception", "Engagement", "Muslim Wedding", "Shastipoorthi"],
    colors: { primary: "#E2B65A", secondary: "#C9973A", accent: "#E8CF95", background: "#0B0906", text: "#E9DFC7" },
    page: "radial-gradient(60% 40% at 80% 20%, rgba(226,182,90,.22), transparent 70%), radial-gradient(50% 35% at 10% 60%, rgba(226,182,90,.12), transparent 70%), #0B0906",
    titleFont: SERIF_CAPS,
    bodyFont: SERIF_BODY,
    titleStyle: "caps",
    frame: "circle",
    playerGlow: "0 0 0 1px rgba(226,182,90,.5), 0 0 30px rgba(226,182,90,.25)",
    decor: ["gold-swirl"],
    eyebrow: "Celebration",
    headline: "Live Stream",
    message: "Your presence (virtually) means a lot to us.",
    tagline: "Join & Celebrate",
  },
  {
    key: "floral-romance",
    label: "Floral Romance",
    description: "Blush pink with soft blossoms and a round portrait.",
    eventTypes: ["Engagement", "Reception", "Marriage", "Baby Shower", "Birthday", "Half Saree"],
    colors: { primary: "#C2566E", secondary: "#E59AAB", accent: "#B4677A", background: "#FCEFEC", text: "#6A4650" },
    page: "linear-gradient(180deg, #FFF6F4 0%, #FBE7E4 100%)",
    titleFont: SERIF_CAPS,
    bodyFont: SERIF_BODY,
    titleStyle: "caps",
    frame: "circle",
    decor: ["floral-corners"],
    eyebrow: "We're Celebrating",
    headline: "A Special Day",
    message: "Thank you for joining us in this beautiful celebration of love.",
    tagline: "With Love",
  },
  {
    key: "traditional-indian",
    label: "Traditional Indian",
    description: "Deep maroon silk with a gold border, temple bells and an arched photo.",
    eventTypes: ["Marriage", "Marriage-Events", "Upanayanam", "Dhothi Ceremony", "Half Saree", "Shastipoorthi"],
    colors: { primary: "#E7B95A", secondary: "#C9973A", accent: "#F1D9A0", background: "#4E0B12", text: "#F3E2C4" },
    page: "radial-gradient(90% 70% at 50% 30%, #7A1420 0%, #4E0B12 70%, #3A0810 100%)",
    titleFont: SERIF_CAPS,
    bodyFont: SERIF_BODY,
    titleStyle: "caps",
    frame: "arch",
    decor: ["gold-border", "bells"],
    eyebrow: "Auspicious Celebration",
    headline: "Live Stream",
    message: "Blessings, love and happiness to the beautiful journey ahead.",
    tagline: "With Family",
  },
  {
    key: "temple-classic",
    label: "Temple Classic",
    description: "Cream and temple red with gold arches, bells and Om motifs.",
    eventTypes: ["Devotional", "Padi Pooja", "Gruhapravesham", "Seemantham", "Namakarana", "Cradle Ceremony", "Upanayanam"],
    colors: { primary: "#9B1B1B", secondary: "#C9973A", accent: "#8A5A1A", background: "#FBF2E1", text: "#5A3A1E" },
    page: "radial-gradient(110% 70% at 50% 0%, #FFF8EA 0%, #F7E8CC 100%)",
    titleFont: SERIF_CAPS,
    bodyFont: SERIF_BODY,
    titleStyle: "caps",
    frame: "arch",
    decor: ["gold-border", "bells", "om"],
    eyebrow: "Divine Celebration",
    headline: "Live Stream",
    message: "May this auspicious occasion bring peace, happiness and prosperity.",
    tagline: "Jayamastu",
  },
  {
    key: "modern-glass",
    label: "Modern Glass",
    description: "Night bokeh behind a frosted-glass card — modern and versatile.",
    eventTypes: [],
    colors: { primary: "#FFFFFF", secondary: "#9DB4FF", accent: "#C9D6FF", background: "#0B1530", text: "#DCE4FF" },
    page: "radial-gradient(30% 20% at 20% 15%, rgba(120,150,255,.35), transparent 70%), radial-gradient(25% 18% at 85% 30%, rgba(255,190,120,.25), transparent 70%), radial-gradient(35% 25% at 70% 85%, rgba(120,150,255,.25), transparent 70%), linear-gradient(180deg, #0B1530 0%, #050A1A 100%)",
    titleFont: SANS,
    bodyFont: SANS,
    titleStyle: "caps",
    frame: "circle",
    decor: ["bokeh", "glass"],
    eyebrow: "Special Event",
    headline: "Live Stream",
    message: "We are excited to share this moment with you.",
    tagline: "Stay Connected",
  },
  {
    key: "neon-night",
    label: "Neon Night",
    description: "Electric magenta and cyan neon — parties, sangeeth and birthdays.",
    eventTypes: ["Sangeeth", "Birthday", "General Event", "Reunion"],
    colors: { primary: "#FF3DF0", secondary: "#B44DFF", accent: "#7FE7FF", background: "#08051A", text: "#E6DCFF" },
    page: "radial-gradient(70% 40% at 50% 0%, rgba(180,77,255,.35), transparent 70%), linear-gradient(180deg, #0C0726 0%, #05030F 100%)",
    titleFont: SANS,
    bodyFont: SANS,
    titleStyle: "caps",
    frame: "hexagon",
    playerGlow: "0 0 0 2px #B44DFF, 0 0 24px rgba(255,61,240,.55)",
    decor: ["neon-lines"],
    eyebrow: "Live Event",
    headline: "Live Stream",
    message: "Feel the energy. Live the moment.",
    tagline: "Let's Go!",
  },
  {
    key: "minimal-white",
    label: "Minimal White",
    description: "Clean white with a wide photo and thin type — suits any event.",
    eventTypes: [],
    colors: { primary: "#2B2B2B", secondary: "#2B2B2B", accent: "#8A8A8A", background: "#F7F5F0", text: "#4A4A4A" },
    page: "#F7F5F0",
    titleFont: SANS,
    bodyFont: SANS,
    titleStyle: "caps",
    frame: "wide",
    decor: [],
    eyebrow: "Special Event",
    headline: "Live Stream",
    message: "Thank you for being a part of our celebration.",
    tagline: "With Love",
  },
  {
    key: "concert-energy",
    label: "Concert Energy",
    description: "Purple stage lights, bold italic title and equaliser bars.",
    eventTypes: ["General Event", "Sangeeth", "Birthday", "Reunion"],
    colors: { primary: "#FFFFFF", secondary: "#C04BFF", accent: "#E7B8FF", background: "#14042B", text: "#EBDDFF" },
    page: "conic-gradient(from 200deg at 25% -10%, transparent 0deg, rgba(220,120,255,.28) 14deg, transparent 28deg), conic-gradient(from 140deg at 75% -10%, transparent 0deg, rgba(120,140,255,.25) 14deg, transparent 28deg), linear-gradient(180deg, #2A0858 0%, #14042B 100%)",
    titleFont: SANS,
    bodyFont: SANS,
    titleStyle: "italic",
    frame: "none",
    playerGlow: "0 0 0 2px #C04BFF, 0 0 26px rgba(192,75,255,.45)",
    decor: ["stage-lights", "equalizer"],
    eyebrow: "Live Concert",
    headline: "Live Stream",
    message: "Music. Moments. Memories.",
    tagline: "Turn Up!",
  },
  {
    key: "corporate-premium",
    label: "Corporate Premium",
    description: "Navy and gold with an angled wide photo — conferences and corporate events.",
    eventTypes: ["General Event", "Retirement", "Reunion"],
    colors: { primary: "#D4A84B", secondary: "#D4A84B", accent: "#A9C1E8", background: "#0B1F3A", text: "#D7E2F3" },
    page: "linear-gradient(160deg, #10294D 0%, #0B1F3A 55%, #081629 100%)",
    titleFont: SERIF_CAPS,
    bodyFont: SANS,
    titleStyle: "caps",
    frame: "wide",
    decor: [],
    eyebrow: "Corporate Event",
    headline: "Live Stream",
    message: "Connecting people. Sharing ideas. Creating impact.",
    tagline: "Stay Connected",
  },
  {
    key: "broadcast-pro",
    label: "Broadcast Pro",
    description: "TV-style broadcast with LIVE and HD badges and a lower-third bar.",
    eventTypes: [],
    colors: { primary: "#FFFFFF", secondary: "#1E5BD8", accent: "#9EB8E8", background: "#081226", text: "#D5E0F5" },
    page: "linear-gradient(180deg, #0D1B36 0%, #060D1C 100%)",
    titleFont: SANS,
    bodyFont: SANS,
    titleStyle: "caps",
    frame: "none",
    decor: ["broadcast"],
    eyebrow: "Event",
    headline: "Live Stream",
    message: "Stay connected and watch the event live.",
    tagline: "Streaming Live",
  },
];

export function getShowcasePreset(key?: string | null): ShowcasePreset {
  return SHOWCASE_PRESETS.find((p) => p.key === key) ?? SHOWCASE_PRESETS[0];
}
