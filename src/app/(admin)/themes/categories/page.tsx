import { BackLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { TextField } from "@/components/ui/Field";
import { fetchThemeCategories, fetchThemes } from "@/lib/hooks/useAdminThemes";
import { createThemeCategoryAction } from "@/lib/themes";

function toParam(v: string | string[] | undefined): string {
  return Array.isArray(v) ? (v[0] ?? "") : (v ?? "");
}

export default async function ThemeCategoriesPage(props: PageProps<"/themes/categories">) {
  const sp = await props.searchParams;
  const error = toParam(sp.error);

  const [categories, themes] = await Promise.all([
    fetchThemeCategories().catch(() => []),
    fetchThemes().catch(() => []),
  ]);

  const counts = new Map<string, number>();
  themes.forEach((t) => {
    if (t.categoryId) counts.set(t.categoryId, (counts.get(t.categoryId) ?? 0) + 1);
  });

  return (
    <div>
      <BackLink href="/themes" label="Back to Themes" />
      <div className="mb-5 text-[22px] font-extrabold text-[var(--color-text)]">
        Theme Categories
      </div>

      {categories.length === 0 ? (
        <div className="mb-5 rounded-[14px] border border-dashed border-[var(--color-border)] p-10 text-center text-[13px] text-[var(--color-text-faint)]">
          No categories yet.
        </div>
      ) : (
        <div className="mb-6 grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((c) => (
            <Card key={c.id}>
              <div className="mb-1 text-[14px] font-bold text-[var(--color-text)]">{c.name}</div>
              <div className="text-xs text-[var(--color-text-muted)]">{counts.get(c.id) ?? 0} themes</div>
            </Card>
          ))}
        </div>
      )}

      <Card className="max-w-[420px]">
        <div className="mb-3.5 text-[14px] font-bold text-[var(--color-text)]">Add Category</div>
        <form action={createThemeCategoryAction} className="flex flex-col gap-3.5">
          <TextField label="Category Name" name="name" placeholder="e.g. Corporate" required />
          {error ? (
            <p className="text-xs font-semibold text-[var(--color-danger)]" role="alert">
              {error}
            </p>
          ) : null}
          <button type="submit" className="w-fit rounded-[9px] bg-[var(--color-primary)] px-5 py-2.5 text-[13px] font-bold text-white">
            Add Category
          </button>
        </form>
      </Card>
    </div>
  );
}
