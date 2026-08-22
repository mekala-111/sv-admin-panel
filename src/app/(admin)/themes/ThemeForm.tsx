"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { realImageFor } from "@/lib/images";
import { createThemeAction, updateThemeAction } from "@/lib/theme-actions";
import {
  buildThemePreviewPayload,
  configFromStored,
  defaultSampleForTemplate,
} from "@/lib/theme-config-utils";
import {
  getTemplateIdFromLayout,
  getThemeTemplate,
  THEME_TEMPLATES,
  type ThemeConfig,
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

function resolvePreviewSrc(previewImage: string | null | undefined, templateId: string): string {
  const template = getThemeTemplate(templateId);
  if (!previewImage) return template?.previewImage ?? "";
  if (previewImage.startsWith("/") || previewImage.startsWith("data:") || previewImage.startsWith("http")) {
    return previewImage;
  }
  return realImageFor(previewImage) || template?.previewImage || "";
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
  const initialTemplateId = getTemplateIdFromLayout(initial?.layout);
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

  const selected = useMemo(
    () => THEME_TEMPLATES.find((t) => t.id === templateId) ?? THEME_TEMPLATES[0],
    [templateId]
  );

  const displayPreview =
    customImage && previewImage ? previewImage : selected?.previewImage ?? initialPreview;

  const storedConfig = useMemo(
    () => configFromStored(templateId, initial?.config ?? null),
    [templateId, initial?.config]
  );

  const previewPayload = useMemo(
    () =>
      buildThemePreviewPayload({
        themeName: themeName || selected.label,
        themeSlug: initial?.slug,
        config: storedConfig,
        sample: {
          ...defaultSampleForTemplate(templateId),
          pageTitle: themeName || defaultSampleForTemplate(templateId).pageTitle,
        },
        previewImage: displayPreview || null,
      }),
    [themeName, initial?.slug, storedConfig, templateId, displayPreview, selected.label]
  );

  function onTemplateChange(nextId: string) {
    setTemplateId(nextId);
    if (!customImage) setPreviewImage("");
  }

  const action = mode === "create" ? createThemeAction : updateThemeAction;
  const submitLabel = mode === "create" ? "Create theme" : "Save theme";
  const configJson = JSON.stringify(storedConfig);

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,320px)_1fr]">
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
                placeholder="e.g. Priya & Rahul Wedding"
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

            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-[var(--color-text-muted)]">
                Template
              </span>
              <select
                value={templateId}
                onChange={(e) => onTemplateChange(e.target.value)}
                className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2.5 text-[13.5px]"
              >
                {THEME_TEMPLATES.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </select>
              <p className="mt-1.5 text-[12px] leading-relaxed text-[var(--color-text-muted)]">
                {selected.description}
              </p>
            </label>

            <div>
              <span className="mb-1.5 block text-xs font-semibold text-[var(--color-text-muted)]">
                Cover image
              </span>
              <input
                type="file"
                accept="image/*"
                className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2.5 text-[13px]"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) {
                    setCustomImage(false);
                    setPreviewImage("");
                    return;
                  }
                  setImageError("");
                  setCustomImage(true);
                  const reader = new FileReader();
                  reader.onload = () =>
                    setPreviewImage(typeof reader.result === "string" ? reader.result : "");
                  reader.readAsDataURL(file);
                }}
              />
              {imageError ? (
                <p className="mt-1 text-[12px] font-semibold text-[#F52222]">{imageError}</p>
              ) : null}
            </div>

            {mode === "create" ? (
              <label className="flex items-start gap-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2.5">
                <input
                  type="checkbox"
                  name="assignToAllVendors"
                  defaultChecked
                  className="mt-0.5"
                />
                <span className="text-[12.5px] leading-relaxed text-[var(--color-text-muted)]">
                  Assign this theme to all active vendors immediately after creation
                </span>
              </label>
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

export function CreateThemeForm(props: {
  error?: string | null;
  cancelHref?: string;
  categories?: ThemeCategoryOption[];
}) {
  return <ThemeEditor mode="create" {...props} />;
}
