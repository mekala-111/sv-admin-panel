"use client";

const SKIP_KEYS = new Set([
  "brideName",
  "groomName",
  "brideImage",
  "groomImage",
  "eventDate",
  "eventTime",
  "eventPlace",
  "invitationCard",
  "galleryImages",
  "description",
  "remarks1",
  "remarks2",
  "logoImage",
  "customImage",
  "pageTitle",
  "coverImage",
  "scrollMessage",
  "subEvents",
  "youtubeLiveUrl",
  "youtubeLiveKey",
  "teaserUrl",
  "eventName",
  "location",
  "fontFamily",
  "fontColor",
  "liveTiming",
  "eventType",
  "eventTime",
  "whatsappImage",
  "whatsappNumber",
  "accessPin",
  "youtubeChannelId",
]);

const BOOLEAN_TYPES = new Set(["boolean", "checkbox", "toggle", "switch"]);

function lookupValue(event, branding, key) {
  const custom =
    branding?.customConfig && typeof branding.customConfig === "object" ? branding.customConfig : {};
  const value = event?.[key] ?? custom[key];
  // Toggles are layout switches, not content — never print "true"/"false".
  if (value == null || typeof value === "boolean" || typeof value === "object") return "";
  return String(value).trim();
}

function isImageValue(type, value) {
  if (type === "image") return true;
  return /^(https?:|data:|\/)/.test(value) && !/\s/.test(value);
}

export default function CustomThemeBlocks({ event, branding, theme }) {
  const config = theme?.config && typeof theme.config === "object" ? theme.config : {};
  const sections = Array.isArray(config.customSections) ? config.customSections : [];
  const fields = Array.isArray(config.fields) ? config.fields : [];
  const sectionKeys = new Set(sections.map((s) => s.fieldKey));
  const extraFields = fields.filter(
    (f) =>
      f?.key &&
      !SKIP_KEYS.has(f.key) &&
      !f.key.startsWith("show") &&
      !BOOLEAN_TYPES.has(f.type) &&
      !sectionKeys.has(f.key)
  );
  const items = [
    ...sections.map((s) => ({ key: s.fieldKey, title: s.title, type: "textarea" })),
    ...extraFields.map((f) => ({ key: f.key, title: f.label || f.key, type: f.type })),
  ];
  const visible = items.filter((item) => lookupValue(event, branding, item.key));
  if (!visible.length) return null;

  const colors = config.colors || {};
  return (
    <div
      style={{
        padding: "40px 20px 64px",
        // Match the theme above; without theme colours, inherit instead of forcing a dark band.
        background: colors.background || "transparent",
        color: colors.text || "inherit",
        fontFamily: config.fontFamily || "Georgia, serif",
      }}
    >
      <div style={{ maxWidth: 720, margin: "0 auto", display: "flex", flexDirection: "column", gap: 28 }}>
        {visible.map((item) => {
          const value = lookupValue(event, branding, item.key);
          const showImage = isImageValue(item.type, value);
          return (
            <section key={item.key}>
              <h2 style={{ fontSize: 22, margin: "0 0 12px" }}>{item.title}</h2>
              {showImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={value} alt="" style={{ maxWidth: "100%", borderRadius: 12 }} />
              ) : (
                <p style={{ whiteSpace: "pre-wrap", lineHeight: 1.6, margin: 0 }}>{value}</p>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
