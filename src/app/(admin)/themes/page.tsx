import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { PillTabs } from "@/components/ui/Tabs";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { SlotImage } from "@/components/ui/SlotImage";
import { listThemeCategories, listThemes } from "@/lib/db";
import { CreateThemeButton } from "./CreateThemeButton";
import { ThemeDuplicateButton } from "./ThemeDuplicateButton";

function ThemePreviewImage({ imgId, name }: { imgId: string; name: string }) {
  const isDirectSrc =
    imgId.startsWith("/") || imgId.startsWith("data:") || imgId.startsWith("http");

  if (isDirectSrc) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={imgId} alt={name} className="h-[120px] w-full object-cover" />
    );
  }

  return (
    <SlotImage slotId={imgId} label="Theme preview" shape="rect" className="h-[120px] w-full" />
  );
}

const FALLBACK_CATEGORIES = ["All", "Wedding", "Corporate", "General", "Traditional"];

export default async function ThemesPage({
  searchParams,
}: PageProps<"/themes">) {
  const sp = await searchParams;
  const catParam = Array.isArray(sp.tab) ? sp.tab[0] : sp.tab;

  const [themes, categoriesFromDb] = await Promise.all([listThemes(), listThemeCategories()]);
  const categoryNames = [
    "All",
    ...categoriesFromDb.map((c) => c.name),
    ...FALLBACK_CATEGORIES.filter((c) => c !== "All" && !categoriesFromDb.some((db) => db.name === c)),
  ];
  const uniqueCategories = [...new Set(categoryNames)];

  const category = uniqueCategories.includes(catParam ?? "") ? (catParam as string) : "All";

  const filteredThemes = themes.filter(
    (t) => category === "All" || t.category === category
  );

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="text-[22px] font-extrabold text-[var(--color-text)]">
          Theme Library
        </div>
        <div className="flex flex-wrap gap-2.5">
          <Button href="/themes/categories" variant="secondary">
            Categories
          </Button>
          <Button href="/themes/assignments" variant="secondary">
            Assignments
          </Button>
          <CreateThemeButton categories={categoriesFromDb} />
        </div>
      </div>

      <PillTabs basePath="/themes" options={uniqueCategories} current={category} />

      <div className="grid grid-cols-1 gap-[18px] sm:grid-cols-2 xl:grid-cols-4">
        {filteredThemes.map((t) => (
          <div
            key={t.id}
            className="overflow-hidden rounded-[14px] border border-[var(--color-border)] bg-white"
          >
            <ThemePreviewImage imgId={t.imgId} name={t.name} />
            <div className="p-3.5">
              <div className="mb-1 flex items-center justify-between">
                <div className="text-[14px] font-bold text-[var(--color-text)]">
                  {t.name}
                </div>
                <StatusBadge status={t.status} />
              </div>
              <div className="mb-3 text-xs text-[var(--color-text-muted)]">
                {t.category}
                {(t as { layout?: string }).layout ? (
                  <> &middot; {(t as { layout?: string }).layout}</>
                ) : null}
                {(t as { fieldCount?: number }).fieldCount ? (
                  <> &middot; {(t as { fieldCount?: number }).fieldCount} content fields</>
                ) : null}
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/themes/${t.id}/edit`}
                  className="flex-1 rounded-[7px] border border-[var(--color-border)] bg-white py-1.5 text-center text-xs font-semibold text-[var(--color-primary)]"
                >
                  Edit
                </Link>
                <ThemeDuplicateButton themeId={String(t.id)} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
