import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { PillTabs } from "@/components/ui/Tabs";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { fetchThemes, fetchThemeCategories } from "@/lib/hooks/useAdminThemes";
import { duplicateThemeAction } from "@/lib/themes";

function statusLabel(status: string): string {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

export default async function ThemesPage({
  searchParams,
}: PageProps<"/themes">) {
  const sp = await searchParams;
  const catParam = Array.isArray(sp.tab) ? sp.tab[0] : sp.tab;

  const [themes, categories] = await Promise.all([
    fetchThemes().catch(() => []),
    fetchThemeCategories().catch(() => []),
  ]);

  const categoryFilters = ["All", ...categories.map((c) => c.name)];
  const category = categoryFilters.includes(catParam ?? "") ? (catParam as string) : "All";

  const categoryById = new Map(categories.map((c) => [c.id, c.name]));
  const filtered = themes.filter(
    (t) => category === "All" || categoryById.get(t.categoryId ?? "") === category
  );

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="text-[22px] font-extrabold text-[var(--color-text)]">
          Theme Library
        </div>
        <div className="flex flex-wrap gap-2.5">
          <Button href="/themes/categories" variant="secondary">Categories</Button>
          <Button href="/themes/assignments" variant="secondary">Assignments</Button>
          <Button href="/themes/new" variant="primary">+ Create Theme</Button>
        </div>
      </div>

      <PillTabs basePath="/themes" options={categoryFilters} current={category} />

      {filtered.length === 0 ? (
        <div className="rounded-[14px] border border-dashed border-[var(--color-border)] p-16 text-center text-[13px] text-[var(--color-text-faint)]">
          No themes yet. Create your first theme to get started.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-[18px] sm:grid-cols-2 xl:grid-cols-4">
          {filtered.map((t) => (
            <div key={t.id} className="overflow-hidden rounded-[14px] border border-[var(--color-border)] bg-white">
              <div
                className="flex h-[120px] w-full items-center justify-center bg-[#F0EEEA] text-[11px] font-mono uppercase text-[#9C9890]"
                style={t.previewImage ? { backgroundImage: `url(${t.previewImage})`, backgroundSize: "cover" } : undefined}
              >
                {!t.previewImage && "preview"}
              </div>
              <div className="p-3.5">
                <div className="mb-1 flex items-center justify-between">
                  <div className="text-[14px] font-bold text-[var(--color-text)]">{t.name}</div>
                  <StatusBadge status={statusLabel(t.status)} />
                </div>
                <div className="mb-3 text-xs text-[var(--color-text-muted)]">
                  {t.categoryId ? categoryById.get(t.categoryId) ?? "Uncategorized" : "Uncategorized"}
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/themes/${t.id}/edit`}
                    className="flex-1 rounded-[7px] border border-[var(--color-border)] bg-white py-1.5 text-center text-xs font-semibold text-[var(--color-primary)]"
                  >
                    Edit
                  </Link>
                  <form action={duplicateThemeAction.bind(null, t.id)} className="flex-1">
                    <button
                      type="submit"
                      className="w-full rounded-[7px] border border-[var(--color-border)] bg-white py-1.5 text-xs font-semibold text-[var(--color-text-muted)]"
                    >
                      Duplicate
                    </button>
                  </form>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
