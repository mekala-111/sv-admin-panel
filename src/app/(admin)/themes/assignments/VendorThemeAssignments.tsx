"use client";

import { useMemo, useState, useTransition } from "react";

type ThemeRow = {
  id: string;
  name: string;
  category: string;
  status: string;
};

export function VendorThemeAssignments({
  vendorId,
  themes,
  assignedThemeIds,
  saveAction,
}: {
  vendorId: string;
  themes: ThemeRow[];
  assignedThemeIds: string[];
  saveAction: (formData: FormData) => Promise<void>;
}) {
  const initial = useMemo(() => new Set(assignedThemeIds), [assignedThemeIds]);
  const [selected, setSelected] = useState<Set<string>>(() => new Set(initial));
  const [pending, startTransition] = useTransition();

  function toggle(themeId: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(themeId)) next.delete(themeId);
      else next.add(themeId);
      return next;
    });
  }

  function save() {
    startTransition(async () => {
      const fd = new FormData();
      fd.set("vendorId", vendorId);
      fd.set("themeIds", [...selected].join(","));
      fd.set("allThemeIds", themes.map((t) => t.id).join(","));
      await saveAction(fd);
    });
  }

  const dirty = themes.some((t) => initial.has(t.id) !== selected.has(t.id));

  return (
    <div>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {themes.map((theme) => (
          <label
            key={theme.id}
            className="flex cursor-pointer items-center gap-2 rounded-[8px] border border-[var(--color-border)] px-3 py-2 text-[13px]"
          >
            <input
              type="checkbox"
              checked={selected.has(theme.id)}
              onChange={() => toggle(theme.id)}
              disabled={pending}
            />
            <span className="font-semibold text-[var(--color-text)]">{theme.name}</span>
            <span className="text-[11px] text-[var(--color-muted)]">{theme.category}</span>
          </label>
        ))}
      </div>
      <button
        type="button"
        onClick={save}
        disabled={!dirty || pending}
        className="mt-3 rounded-[8px] bg-[var(--color-primary)] px-4 py-2 text-[12px] font-bold text-white disabled:opacity-50"
      >
        {pending ? "Saving…" : "Save assignments"}
      </button>
    </div>
  );
}
