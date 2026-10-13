import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { fetchThemeDetail, fetchThemeCategories } from "@/lib/hooks/useAdminThemes";
import { assignThemeToAllVendorsAction, duplicateThemeAction } from "@/lib/theme-actions";
import type { ThemeConfig } from "@/lib/theme-templates";
import { ThemeForm } from "../../ThemeForm";

function toParam(v: string | string[] | undefined): string {
  return Array.isArray(v) ? (v[0] ?? "") : (v ?? "");
}

export default async function ThemeEditorPage({
  params,
  searchParams,
}: PageProps<"/themes/[id]/edit">) {
  const { id } = await params;
  // Old "create" links pointed at /themes/0/edit — the visual editor lives at /themes/new.
  if (id === "0") redirect("/themes/new");

  const sp = await searchParams;
  const [theme, categories] = await Promise.all([
    fetchThemeDetail(id),
    fetchThemeCategories().catch(() => []),
  ]);
  if (!theme) notFound();

  const saved = toParam(sp.saved);
  const created = toParam(sp.created);
  const assigned = toParam(sp.assigned);
  const error = toParam(sp.error);
  const config = (theme.config ?? {}) as Partial<ThemeConfig>;

  return (
    <div className="mx-auto max-w-[1400px]">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/themes" className="text-[13px] font-semibold text-[var(--color-text-muted)]">
          &larr; Back to Themes &middot;{" "}
          <span className="font-bold text-[var(--color-text)]">{theme.name}</span>
        </Link>
        <div className="flex flex-wrap gap-2">
          <form action={duplicateThemeAction}>
            <input type="hidden" name="id" value={theme.id} />
            <Button variant="secondary" type="submit">
              Duplicate
            </Button>
          </form>
          <form action={assignThemeToAllVendorsAction}>
            <input type="hidden" name="id" value={theme.id} />
            <Button variant="secondary" type="submit">
              Send to all vendors
            </Button>
          </form>
        </div>
      </div>

      {created || saved || assigned ? (
        <p className="mb-4 text-[13px] font-semibold text-[#1E9E5A]">
          {created
            ? "Theme created and sent to all vendors."
            : assigned
              ? "Theme sent to all active vendors."
              : "Theme saved."}{" "}
          Vendors only see themes assigned to them.
        </p>
      ) : null}

      <div className="mb-5">
        <h1 className="mb-1 text-[22px] font-extrabold text-[var(--color-text)]">Edit Theme</h1>
        <p className="text-[13px] text-[var(--color-text-muted)]">
          Preview how this theme renders for guests. Layout:{" "}
          <code className="font-semibold text-[var(--color-text)]">{config.layout ?? "—"}</code>
        </p>
      </div>

      <ThemeForm
        mode="edit"
        error={error || null}
        categories={categories}
        initial={{
          id: theme.id,
          name: theme.name,
          layout: config.layout,
          previewImage: theme.previewImage,
          status: theme.status,
          slug: theme.slug,
          categoryId: theme.categoryId,
          config,
        }}
      />
    </div>
  );
}
