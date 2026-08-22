import { duplicateThemeAction } from "@/lib/theme-actions";

export function ThemeDuplicateButton({ themeId }: { themeId: string }) {
  return (
    <form action={duplicateThemeAction} className="flex-1">
      <input type="hidden" name="id" value={themeId} />
      <button
        type="submit"
        className="w-full rounded-[7px] border border-[var(--color-border)] bg-white py-1.5 text-xs font-semibold text-[var(--color-text-muted)]"
      >
        Duplicate
      </button>
    </form>
  );
}
