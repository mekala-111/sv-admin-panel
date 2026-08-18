import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { PillTabs } from "@/components/ui/Tabs";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { SlotImage } from "@/components/ui/SlotImage";
import { listThemes } from "@/lib/db";

const CATEGORIES = [
  "All",
  "Wedding",
  "Corporate",
  "Concert",
  "Spiritual",
  "Sports",
  "Birthday",
  "Private",
  "Minimal",
];

export default async function ThemesPage({
  searchParams,
}: PageProps<"/themes">) {
  const sp = await searchParams;
  const catParam = Array.isArray(sp.tab) ? sp.tab[0] : sp.tab;
  const category = CATEGORIES.includes(catParam ?? "")
    ? (catParam as string)
    : "All";

  const themes = listThemes().filter(
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
          <Button href="/themes/0/edit" variant="primary">
            + Create Theme
          </Button>
        </div>
      </div>

      <PillTabs basePath="/themes" options={CATEGORIES} current={category} />

      <div className="grid grid-cols-1 gap-[18px] sm:grid-cols-2 xl:grid-cols-4">
        {themes.map((t) => (
          <div
            key={t.id}
            className="overflow-hidden rounded-[14px] border border-[var(--color-border)] bg-white"
          >
            <SlotImage
              slotId={t.imgId}
              label="Theme preview"
              shape="rect"
              className="h-[120px] w-full"
            />
            <div className="p-3.5">
              <div className="mb-1 flex items-center justify-between">
                <div className="text-[14px] font-bold text-[var(--color-text)]">
                  {t.name}
                </div>
                <StatusBadge status={t.status} />
              </div>
              <div className="mb-3 text-xs text-[var(--color-text-muted)]">
                {t.category} &middot; Used by {t.vendors} vendors
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/themes/${t.id}/edit`}
                  className="flex-1 rounded-[7px] border border-[var(--color-border)] bg-white py-1.5 text-center text-xs font-semibold text-[var(--color-primary)]"
                >
                  Edit
                </Link>
                <button className="flex-1 rounded-[7px] border border-[var(--color-border)] bg-white py-1.5 text-xs font-semibold text-[var(--color-text-muted)]">
                  Duplicate
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
