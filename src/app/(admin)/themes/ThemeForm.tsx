"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { realImageFor } from "@/lib/images";
import { createThemeAction, updateThemeAction } from "@/lib/theme-actions";
import {
  buildThemePreviewPayload,
  configFromStored,
  defaultSampleForTemplate,
  EVENT_TYPE_OPTIONS,
  mergeThemeConfig,
} from "@/lib/theme-config-utils";
import {
  getTemplateIdFromLayout,
  getThemeTemplate,
  THEME_TEMPLATES,
  type ThemeConfig,
  type ThemeCustomSection,
  type ThemeFieldDef,
} from "@/lib/theme-templates";
import { ThemePreviewFrame } from "./ThemePreviewFrame";

export type ThemeFormInitial = {
  id?: string;
  name?: string;
  layout?: string;
  previewImage?: string | null;
  status?: "ACTIVE" | "DRAFT" | "INACTIVE";
  slug?: string;
  categoryId?: string | null;
  config?: Partial<ThemeConfig> | null;
};

export type ThemeCategoryOption = { id: string; name: string };

const FONT_OPTIONS = [
  "Great Vibes, cursive",
  "Dancing Script, cursive",
  "Pacifico, cursive",
  "Tangerine, cursive",
  "Pinyon Script, cursive",
  "Playfair Display, Georgia, serif",
  "Cormorant Garamond, Georgia, serif",
  "Cinzel, Georgia, serif",
  "Lora, Georgia, serif",
  "Peddana, Ramabhadra, serif",
  "Poppins, sans-serif",
  "Oswald, sans-serif",
  "Josefin Sans, sans-serif",
  "Lobster, cursive",
];

const FONT_STYLESHEET =
  "https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600&family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500&family=Dancing+Script&family=Great+Vibes&family=Josefin+Sans:wght@400;600&family=Lobster&family=Lora:wght@500;600&family=Oswald:wght@500&family=Pacifico&family=Peddana&family=Pinyon+Script&family=Playfair+Display:wght@500;600;700&family=Poppins:wght@400;500;600&family=Ramabhadra&family=Tangerine:wght@400;700&display=swap";

const PAGE_BLOCKS: { key: keyof ThemeConfig["sections"]; label: string }[] = [
  { key: "showLivePlayer", label: "Live player" },
  { key: "showCountdown", label: "Countdown" },
  { key: "showCouplePhotos", label: "Couple photos" },
  { key: "showInvitationCard", label: "Invitation card" },
  { key: "showSubEvents", label: "Sub events" },
  { key: "showGallery", label: "Photo gallery" },
];

function defaultBlockOrder(sections?: ThemeConfig["sections"] | null): (keyof ThemeConfig["sections"])[] {
  const keys = PAGE_BLOCKS.map((b) => b.key);
  if (!sections) return keys;
  return [...keys.filter((k) => sections[k] !== false), ...keys.filter((k) => sections[k] === false)];
}

function moveBlock<T>(list: T[], from: number, to: number): T[] {
  if (from < 0 || to < 0 || from === to) return list;
  const next = list.slice();
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

function readImageFile(
  file: File | undefined,
  onOk: (dataUrl: string) => void,
  onErr: (message: string) => void
) {
  if (!file) return;
  if (!file.type.startsWith("image/")) {
    onErr("Use a JPG, PNG, or WebP image.");
    return;
  }
  const reader = new FileReader();
  reader.onload = () => onOk(typeof reader.result === "string" ? reader.result : "");
  reader.readAsDataURL(file);
}

function resolvePreviewSrc(previewImage: string | null | undefined, templateId: string): string {
  const template = getThemeTemplate(templateId);
  if (!previewImage) return template?.previewImage ?? "";
  if (previewImage.startsWith("/") || previewImage.startsWith("data:") || previewImage.startsWith("http")) {
    return previewImage;
  }
  return realImageFor(previewImage) || template?.previewImage || "";
}

function withFontOption(family: string) {
  const match = FONT_OPTIONS.find((f) => f.split(",")[0].trim() === family.split(",")[0].trim());
  return match ?? family;
}

function slugifyFieldKey(label: string, used: Set<string>) {
  const base = label.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "") || `custom_${Date.now().toString(36)}`;
  let key = base.startsWith("custom_") ? base : `custom_${base}`;
  let n = 2;
  while (used.has(key)) key = `${base}_${n++}`;
  return key;
}

export function ThemeEditor({
  mode,
  error,
  cancelHref = "/themes",
  initial,
  categories = [],
}: {
  mode: "create" | "edit";
  error?: string | null;
  cancelHref?: string;
  initial?: ThemeFormInitial;
  categories?: ThemeCategoryOption[];
}) {
  const initialTemplateId = getTemplateIdFromLayout(initial?.layout, initial?.config?.banner);
  const initialPreview = resolvePreviewSrc(initial?.previewImage, initialTemplateId);
  const initialTemplate = getThemeTemplate(initialTemplateId);
  const startedWithCustomImage = Boolean(
    initial?.previewImage &&
      initial.previewImage !== initialTemplate?.previewImage &&
      !/^th-\d+$/.test(initial.previewImage)
  );

  const [templateId, setTemplateId] = useState(initialTemplateId);
  const [themeName, setThemeName] = useState(initial?.name ?? "");
  const [previewImage, setPreviewImage] = useState(startedWithCustomImage ? initialPreview : "");
  const [customImage, setCustomImage] = useState(startedWithCustomImage);
  const [imageError, setImageError] = useState("");

  const initialConfig = configFromStored(initialTemplateId, initial?.config ?? null);
  const [fontFamily, setFontFamily] = useState(withFontOption(initialConfig.fontFamily));
  const [colors, setColors] = useState(initialConfig.colors);
  const [sections, setSections] = useState(initialConfig.sections);
  const [sectionOrder, setSectionOrder] = useState<(keyof ThemeConfig["sections"])[]>(
    initialConfig.sectionOrder?.length
      ? initialConfig.sectionOrder
      : defaultBlockOrder(initialConfig.sections)
  );
  const [coverOver, setCoverOver] = useState(false);
  const [dragKey, setDragKey] = useState<string | null>(null);
  const [fields, setFields] = useState<ThemeFieldDef[]>(initialConfig.fields);
  const [customSections, setCustomSections] = useState<ThemeCustomSection[]>(
    initialConfig.customSections ?? []
  );
  const [backgroundImage, setBackgroundImage] = useState(initialConfig.backgroundImage ?? "");
  const [eventTypes, setEventTypes] = useState<string[]>(initialConfig.eventTypes ?? []);
  const [bgOver, setBgOver] = useState(false);
  const [sectionTitle, setSectionTitle] = useState("");
  const [fieldLabel, setFieldLabel] = useState("");
  const [fieldType, setFieldType] = useState<ThemeFieldDef["type"]>("text");

  const selected = useMemo(
    () => THEME_TEMPLATES.find((t) => t.id === templateId) ?? THEME_TEMPLATES[0],
    [templateId]
  );

  const displayPreview =
    customImage && previewImage ? previewImage : selected?.previewImage ?? initialPreview;

  const config = useMemo(
    () =>
      mergeThemeConfig(templateId, {
        fontFamily,
        colors,
        sections,
        sectionOrder,
        fields,
        customSections,
        backgroundImage,
        eventTypes,
      }),
    [
      templateId,
      fontFamily,
      colors,
      sections,
      sectionOrder,
      fields,
      customSections,
      backgroundImage,
      eventTypes,
    ]
  );

  const previewPayload = useMemo(() => {
    const sample = defaultSampleForTemplate(templateId);
    const extras: Record<string, string> = {};
    for (const section of customSections) {
      extras[section.fieldKey] = `Sample ${section.title}`;
    }
    return buildThemePreviewPayload({
      themeName: themeName || selected.label,
      themeSlug: initial?.slug,
      config,
      sample: {
        ...sample,
        ...extras,
        pageTitle: themeName || sample.pageTitle,
      },
      previewImage: displayPreview || null,
    });
  }, [themeName, initial?.slug, config, templateId, displayPreview, selected.label, customSections]);

  function onTemplateChange(nextId: string) {
    setTemplateId(nextId);
    const next = configFromStored(nextId, null);
    setFontFamily(withFontOption(next.fontFamily));
    setColors(next.colors);
    setSections(next.sections);
    setSectionOrder(defaultBlockOrder(next.sections));
    setFields(next.fields);
    setCustomSections(next.customSections ?? []);
    setBackgroundImage(next.backgroundImage ?? "");
    // Start from the template's suggested event types; the admin can still adjust them.
    setEventTypes(next.eventTypes ?? []);
    if (!customImage) setPreviewImage("");
  }

  function usedFieldKeys() {
    return new Set([...fields.map((f) => f.key), ...customSections.map((s) => s.fieldKey)]);
  }

  function addCustomSection() {
    const title = sectionTitle.trim();
    if (!title) return;
    const fieldKey = slugifyFieldKey(title, usedFieldKeys());
    setCustomSections((s) => [...s, { id: fieldKey, title, fieldKey }]);
    setFields((f) => [...f, { key: fieldKey, label: title, type: "textarea" }]);
    setSectionTitle("");
  }

  function addCustomField() {
    const label = fieldLabel.trim();
    if (!label) return;
    const key = slugifyFieldKey(label, usedFieldKeys());
    setFields((f) => [...f, { key, label, type: fieldType }]);
    setFieldLabel("");
  }

  function removeCustomField(key: string) {
    setFields((f) => f.filter((row) => row.key !== key));
    setCustomSections((s) => s.filter((row) => row.fieldKey !== key));
  }

  function applyBackground(file: File | undefined) {
    if (!file) {
      setBackgroundImage("");
      return;
    }
    readImageFile(file, (dataUrl) => {
      setImageError("");
      setBackgroundImage(dataUrl);
    }, setImageError);
  }

  function applyCover(file: File | undefined) {
    if (!file) {
      setCustomImage(false);
      setPreviewImage("");
      return;
    }
    readImageFile(
      file,
      (dataUrl) => {
        setImageError("");
        setCustomImage(true);
        setPreviewImage(dataUrl);
      },
      setImageError
    );
  }

  function onBlockDrop(targetKey: keyof ThemeConfig["sections"]) {
    const fromKey = dragKey;
    if (!fromKey || fromKey === targetKey) {
      setDragKey(null);
      return;
    }
    const from = sectionOrder.indexOf(fromKey as keyof ThemeConfig["sections"]);
    const to = sectionOrder.indexOf(targetKey);
    setSectionOrder(moveBlock(sectionOrder, from, to));
    setDragKey(null);
  }

  const action = mode === "create" ? createThemeAction : updateThemeAction;
  const submitLabel = mode === "create" ? "Create theme" : "Save theme";
  const configJson = JSON.stringify(config);

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,380px)_1fr]">
      <link rel="stylesheet" href={FONT_STYLESHEET} />
      <form action={action} className="flex flex-col gap-4">
        {mode === "edit" && initial?.id ? <input type="hidden" name="id" value={initial.id} /> : null}
        <input type="hidden" name="template" value={templateId} />
        <input type="hidden" name="previewImage" value={displayPreview} />
        <input type="hidden" name="config" value={configJson} />

        {error ? (
          <p className="text-[13px] font-semibold text-[#F52222]">
            {mode === "create"
              ? "Could not create theme. Check the fields and try again."
              : "Could not save theme. Check the fields and try again."}
          </p>
        ) : null}

        <section className="rounded-[12px] border border-[var(--color-border)] bg-white p-4">
          <h2 className="mb-3 text-[14px] font-extrabold text-[var(--color-text)]">Theme settings</h2>
          <div className="flex flex-col gap-3.5">
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-[var(--color-text-muted)]">
                Theme name
              </span>
              <input
                name="name"
                required
                minLength={2}
                value={themeName}
                onChange={(e) => setThemeName(e.target.value)}
                placeholder="e.g. Shiny Rose Design"
                className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2.5 text-[13.5px]"
              />
            </label>

            {mode === "edit" && initial?.slug ? (
              <div className="text-[12.5px] text-[var(--color-text-muted)]">
                Slug: <code className="font-semibold text-[var(--color-text)]">{initial.slug}</code>
              </div>
            ) : null}

            {categories.length > 0 ? (
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-[var(--color-text-muted)]">
                  Category
                </span>
                <select
                  name="categoryId"
                  defaultValue={initial?.categoryId ?? ""}
                  className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2.5 text-[13.5px]"
                >
                  <option value="">General</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}

            <div>
              <span className="mb-1.5 block text-xs font-semibold text-[var(--color-text-muted)]">
                Event types
              </span>
              <p className="mb-2 text-[12px] leading-relaxed text-[var(--color-text-muted)]">
                Vendors see this design only for the ticked event types. Leave all unticked to show
                it for every event type.
              </p>
              <div className="grid max-h-[180px] grid-cols-2 gap-x-3 gap-y-1.5 overflow-y-auto rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-2.5 text-[12.5px]">
                {EVENT_TYPE_OPTIONS.map((type) => (
                  <label key={type} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={eventTypes.includes(type)}
                      onChange={(e) =>
                        setEventTypes((prev) =>
                          e.target.checked ? [...prev, type] : prev.filter((t) => t !== type)
                        )
                      }
                    />
                    {type}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <span className="mb-1.5 block text-xs font-semibold text-[var(--color-text-muted)]">
                Design
              </span>
              <select
                value={templateId}
                onChange={(e) => onTemplateChange(e.target.value)}
                className="mb-2 w-full rounded-lg border border-[var(--color-border)] px-3 py-2.5 text-[13.5px]"
              >
                {THEME_TEMPLATES.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </select>
              <p className="mb-2 text-[12px] leading-relaxed text-[var(--color-text-muted)]">
                {selected.description}
              </p>
              <div className="grid max-h-[280px] grid-cols-2 gap-2 overflow-y-auto rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-2">
                {THEME_TEMPLATES.map((t) => {
                  const active = t.id === templateId;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => onTemplateChange(t.id)}
                      className={`overflow-hidden rounded-md border bg-white text-left ${
                        active
                          ? "border-[var(--color-primary)] ring-2 ring-[var(--color-primary)]"
                          : "border-[var(--color-border)]"
                      }`}
                    >
                      {t.previewImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={t.previewImage} alt={t.label} className="h-[72px] w-full object-cover" />
                      ) : (
                        <div className="h-[72px] w-full" style={{ background: t.previewStyle }} aria-hidden />
                      )}
                      <span className="block truncate px-1.5 py-1 text-[10px] font-semibold text-[var(--color-text)]">
                        {t.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-[var(--color-text-muted)]">
                Font style
              </span>
              <select
                value={FONT_OPTIONS.includes(fontFamily) ? fontFamily : fontFamily}
                onChange={(e) => setFontFamily(e.target.value)}
                className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2.5 text-[13.5px]"
                style={{ fontFamily }}
              >
                {FONT_OPTIONS.map((font) => (
                  <option key={font} value={font} style={{ fontFamily: font }}>
                    {font.split(",")[0]}
                  </option>
                ))}
                {!FONT_OPTIONS.includes(fontFamily) ? (
                  <option value={fontFamily}>{fontFamily.split(",")[0]}</option>
                ) : null}
              </select>
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-[var(--color-text-muted)]">
                  Font color
                </span>
                <input
                  type="color"
                  value={colors.text}
                  onChange={(e) => setColors((c) => ({ ...c, text: e.target.value }))}
                  className="h-10 w-full cursor-pointer rounded-lg border border-[var(--color-border)] bg-white p-1"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-[var(--color-text-muted)]">
                  Accent color
                </span>
                <input
                  type="color"
                  value={colors.primary}
                  onChange={(e) =>
                    setColors((c) => ({ ...c, primary: e.target.value, accent: e.target.value }))
                  }
                  className="h-10 w-full cursor-pointer rounded-lg border border-[var(--color-border)] bg-white p-1"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-[var(--color-text-muted)]">
                  Background color
                </span>
                <input
                  type="color"
                  value={colors.background}
                  onChange={(e) => setColors((c) => ({ ...c, background: e.target.value }))}
                  className="h-10 w-full cursor-pointer rounded-lg border border-[var(--color-border)] bg-white p-1"
                />
              </label>
            </div>

            <div>
              <span className="mb-1.5 block text-xs font-semibold text-[var(--color-text-muted)]">
                Page blocks
              </span>
              <p className="mb-2 text-[12px] text-[var(--color-text-muted)]">
                Drag to reorder. Uncheck to hide a block on the event page.
              </p>
              <ul className="flex flex-col gap-1.5">
                {sectionOrder.map((key) => {
                  const block = PAGE_BLOCKS.find((b) => b.key === key);
                  if (!block) return null;
                  const on = sections[key] !== false;
                  return (
                    <li
                      key={key}
                      draggable
                      onDragStart={() => setDragKey(key)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => onBlockDrop(key)}
                      className={`flex cursor-grab items-center gap-2 rounded-lg border bg-white px-2.5 py-2 active:cursor-grabbing ${
                        dragKey === key
                          ? "border-[var(--color-primary)] opacity-70"
                          : "border-[var(--color-border)]"
                      }`}
                    >
                      <span className="select-none text-[13px] text-[var(--color-text-muted)]" aria-hidden>
                        ⋮⋮
                      </span>
                      <label className="flex flex-1 cursor-pointer items-center gap-2 text-[13px] font-semibold text-[var(--color-text)]">
                        <input
                          type="checkbox"
                          checked={on}
                          onChange={(e) =>
                            setSections((s) => ({ ...s, [key]: e.target.checked }))
                          }
                        />
                        {block.label}
                      </label>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div>
              <span className="mb-1.5 block text-xs font-semibold text-[var(--color-text-muted)]">
                Cover image
              </span>
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setCoverOver(true);
                }}
                onDragLeave={() => setCoverOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setCoverOver(false);
                  applyCover(e.dataTransfer.files?.[0]);
                }}
                className={`rounded-lg border-2 border-dashed p-3 text-center ${
                  coverOver
                    ? "border-[var(--color-primary)] bg-[var(--color-bg)]"
                    : "border-[var(--color-border)]"
                }`}
              >
                {customImage && previewImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={previewImage}
                    alt=""
                    className="mb-2 h-[88px] w-full rounded-md object-cover"
                  />
                ) : null}
                <p className="text-[12.5px] font-semibold text-[var(--color-text)]">
                  Drop an image here, or choose a file
                </p>
                <input
                  type="file"
                  accept="image/*"
                  className="mt-2 w-full text-[13px]"
                  onChange={(e) => applyCover(e.target.files?.[0])}
                />
              </div>
              {imageError ? (
                <p className="mt-1 text-[12px] font-semibold text-[#F52222]">{imageError}</p>
              ) : null}
            </div>

            <div>
              <span className="mb-1.5 block text-xs font-semibold text-[var(--color-text-muted)]">
                Page background
              </span>
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setBgOver(true);
                }}
                onDragLeave={() => setBgOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setBgOver(false);
                  applyBackground(e.dataTransfer.files?.[0]);
                }}
                className={`rounded-lg border-2 border-dashed p-3 text-center ${
                  bgOver
                    ? "border-[var(--color-primary)] bg-[var(--color-bg)]"
                    : "border-[var(--color-border)]"
                }`}
              >
                {backgroundImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={backgroundImage}
                    alt=""
                    className="mb-2 h-[88px] w-full rounded-md object-cover"
                  />
                ) : null}
                <p className="text-[12.5px] font-semibold text-[var(--color-text)]">
                  Drop a background image, or choose a file
                </p>
                <input
                  type="file"
                  accept="image/*"
                  className="mt-2 w-full text-[13px]"
                  onChange={(e) => applyBackground(e.target.files?.[0])}
                />
                {backgroundImage ? (
                  <button
                    type="button"
                    className="mt-2 text-[12px] font-semibold text-[var(--color-text-muted)]"
                    onClick={() => setBackgroundImage("")}
                  >
                    Remove background image
                  </button>
                ) : null}
              </div>
            </div>

            <div>
              <span className="mb-1.5 block text-xs font-semibold text-[var(--color-text-muted)]">
                Custom sections
              </span>
              <p className="mb-2 text-[12px] text-[var(--color-text-muted)]">
                Adds a titled block on the guest page. Vendors fill the text.
              </p>
              <ul className="mb-2 flex flex-col gap-1.5">
                {customSections.map((section) => (
                  <li
                    key={section.id}
                    className="flex items-center justify-between rounded-lg border border-[var(--color-border)] bg-white px-2.5 py-2 text-[13px] font-semibold"
                  >
                    {section.title}
                    <button
                      type="button"
                      className="text-[12px] font-semibold text-[#F52222]"
                      onClick={() => removeCustomField(section.fieldKey)}
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
              <div className="flex gap-2">
                <input
                  value={sectionTitle}
                  onChange={(e) => setSectionTitle(e.target.value)}
                  placeholder="e.g. Blessing note"
                  className="min-w-0 flex-1 rounded-lg border border-[var(--color-border)] px-3 py-2 text-[13px]"
                />
                <button
                  type="button"
                  onClick={addCustomSection}
                  className="rounded-lg bg-[var(--color-primary)] px-3 py-2 text-[12px] font-bold text-white"
                >
                  Add
                </button>
              </div>
            </div>

            <div>
              <span className="mb-1.5 block text-xs font-semibold text-[var(--color-text-muted)]">
                Custom fields
              </span>
              <p className="mb-2 text-[12px] text-[var(--color-text-muted)]">
                Extra vendor inputs (text, long text, or image).
              </p>
              <ul className="mb-2 flex flex-col gap-1.5">
                {fields
                  .filter(
                    (field) =>
                      !(getThemeTemplate(templateId)?.config.fields ?? []).some((f) => f.key === field.key)
                  )
                  .map((field) => (
                    <li
                      key={field.key}
                      className="flex items-center justify-between rounded-lg border border-[var(--color-border)] bg-white px-2.5 py-2 text-[13px] font-semibold"
                    >
                      <span>
                        {field.label}{" "}
                        <span className="font-normal text-[var(--color-text-muted)]">({field.type})</span>
                      </span>
                      <button
                        type="button"
                        className="text-[12px] font-semibold text-[#F52222]"
                        onClick={() => removeCustomField(field.key)}
                      >
                        Remove
                      </button>
                    </li>
                  ))}
              </ul>
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  value={fieldLabel}
                  onChange={(e) => setFieldLabel(e.target.value)}
                  placeholder="Field label"
                  className="min-w-0 flex-1 rounded-lg border border-[var(--color-border)] px-3 py-2 text-[13px]"
                />
                <select
                  value={fieldType}
                  onChange={(e) => setFieldType(e.target.value as ThemeFieldDef["type"])}
                  className="rounded-lg border border-[var(--color-border)] px-2 py-2 text-[13px]"
                >
                  <option value="text">Text</option>
                  <option value="textarea">Long text</option>
                  <option value="image">Image</option>
                </select>
                <button
                  type="button"
                  onClick={addCustomField}
                  className="rounded-lg bg-[var(--color-primary)] px-3 py-2 text-[12px] font-bold text-white"
                >
                  Add
                </button>
              </div>
            </div>

            {mode === "create" ? (
              <p className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2.5 text-[12.5px] leading-relaxed text-[var(--color-text-muted)]">
                This theme is created by admin. After save it is sent to all active vendors. Vendors can only use assigned themes — they cannot create or redesign them.
              </p>
            ) : null}

            {mode === "edit" ? (
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-[var(--color-text-muted)]">
                  Status
                </span>
                <select
                  name="status"
                  defaultValue={initial?.status ?? "ACTIVE"}
                  className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2.5 text-[13.5px]"
                >
                  <option value="ACTIVE">Active (assigned vendors can use it)</option>
                  <option value="DRAFT">Draft</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </label>
            ) : null}
          </div>
        </section>

        <div className="flex justify-end gap-2.5">
          <Link
            href={cancelHref}
            className="rounded-[8px] border border-[var(--color-border)] bg-white px-4 py-2.5 text-[13px] font-semibold text-[var(--color-text-muted)]"
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="rounded-[8px] bg-[var(--color-primary)] px-4 py-2.5 text-[13px] font-bold text-white"
          >
            {submitLabel}
          </button>
        </div>
      </form>

      <div className="xl:sticky xl:top-4 xl:self-start">
        <ThemePreviewFrame payload={previewPayload as Record<string, unknown>} />
      </div>
    </div>
  );
}

export function ThemeForm(props: Parameters<typeof ThemeEditor>[0]) {
  return <ThemeEditor {...props} />;
}
