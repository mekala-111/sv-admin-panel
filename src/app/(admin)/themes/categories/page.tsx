import { BackLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { listThemes } from "@/lib/db";

const CATEGORY_NAMES = [
  "Wedding",
  "Corporate",
  "Concert",
  "Spiritual",
  "Sports",
  "Birthday",
  "Private",
  "Minimal",
];

export default function ThemeCategoriesPage() {
  const themes = listThemes();
  const categories = CATEGORY_NAMES.map((name) => ({
    name,
    count: themes.filter((t) => t.category === name).length,
  }));

  return (
    <div>
      <BackLink href="/themes" label="Back to Themes" />
      <div className="mb-5 text-[22px] font-extrabold text-[var(--color-text)]">
        Theme Categories
      </div>
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
        {categories.map((c) => (
          <Card key={c.name}>
            <div className="mb-1 text-[14px] font-bold text-[var(--color-text)]">
              {c.name}
            </div>
            <div className="text-xs text-[var(--color-text-muted)]">
              {c.count} themes
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
