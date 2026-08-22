"use client";

import { useState } from "react";
import { ThemeForm, type ThemeCategoryOption } from "./ThemeForm";

export function CreateThemeButton({ categories = [] }: { categories?: ThemeCategoryOption[] }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-[8px] bg-[var(--color-primary)] px-4 py-2 text-[13px] font-bold text-white"
      >
        + Create Theme
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4"
          onClick={() => setOpen(false)}
          role="presentation"
        >
          <div
            className="max-h-[90vh] w-full max-w-[560px] overflow-y-auto rounded-[14px] border border-[var(--color-border)] bg-white p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-theme-title"
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h2
                  id="create-theme-title"
                  className="text-[18px] font-extrabold text-[var(--color-text)]"
                >
                  Create Theme
                </h2>
                <p className="mt-1 text-[13px] text-[var(--color-text-muted)]">
                  Name your theme, pick a template, and add a preview image. Assigned vendors will
                  see active themes in their panel.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg px-2 py-1 text-[20px] leading-none text-[var(--color-text-muted)] hover:bg-[var(--color-bg)]"
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <ThemeForm mode="create" cancelHref="/themes" categories={categories} />
          </div>
        </div>
      ) : null}
    </>
  );
}
