import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { getTheme, listThemeCategories } from "@/lib/db";
import { assignThemeToAllVendorsAction, duplicateThemeAction } from "@/lib/theme-actions";
import { resolveThemeFields } from "@/lib/theme-templates";
import { ThemeForm } from "../../ThemeForm";

export default async function ThemeEditorPage({
  params,
  searchParams,
}: PageProps<"/themes/[id]/edit">) {
  const { id } = await params;
  const sp = await searchParams;
  const [theme, categories] = await Promise.all([getTheme(id), listThemeCategories()]);
  if (!theme) notFound();

  const saved = Array.isArray(sp.saved) ? sp.saved[0] : sp.saved;
  const created = Array.isArray(sp.created) ? sp.created[0] : sp.created;
  const assigned = Array.isArray(sp.assigned) ? sp.assigned[0] : sp.assigned;
  const error = Array.isArray(sp.error) ? sp.error[0] : sp.error;
  const statusValue =
    theme.status === "Available" ? "ACTIVE" : theme.status === "Draft" ? "DRAFT" : "INACTIVE";
  const fieldCount = resolveThemeFields(theme.config ?? { layout: theme.layout }).length;

  return (
    <div className="mx-auto max-w-[1400px]">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/themes" className="text-[13px] font-semibold text-[var(--color-text-muted)]">
          &larr; Back to Themes &middot;{" "}
          <span className="font-bold text-[var(--color-text)]">{theme.name}</span>
        </Link>
        <div className="flex flex-wrap gap-2">
          <form action={duplicateThemeAction}>
            <input type="hidden" name="id" value={String(theme.id)} />
            <Button variant="secondary" type="submit">
              Duplicate
            </Button>
          </form>
          <form action={assignThemeToAllVendorsAction}>
            <input type="hidden" name="id" value={String(theme.id)} />
            <Button variant="secondary" type="submit">
              Send to all vendors
            </Button>
          </form>
        </div>
      </div>

      {created || saved || assigned ? (
        <p className="mb-4 text-[13px] font-semibold text-[#1E9E5A]">
          {created
            ? "Theme created and sent to assigned vendors."
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
          <code className="font-semibold text-[var(--color-text)]">{theme.layout ?? "—"}</code>
          {" · "}
          {fieldCount} vendor content fields
        </p>
      </div>

      <ThemeForm
        mode="edit"
        error={error}
        categories={categories}
        initial={{
          id: String(theme.id),
          name: theme.name,
          layout: theme.layout,
          previewImage: theme.previewImage,
          status: statusValue,
          slug: theme.slug,
          categoryId: theme.categoryId,
          config: theme.config ?? undefined,
        }}
      />
    </div>
  );
}
