import Link from "next/link";
import { ThemeForm } from "../ThemeForm";
import { listThemeCategories } from "@/lib/db";

export default async function CreateThemePage({
  searchParams,
}: PageProps<"/themes/new">) {
  const sp = await searchParams;
  const error = Array.isArray(sp.error) ? sp.error[0] : sp.error;
  const categories = await listThemeCategories();

  return (
    <div className="mx-auto max-w-[1400px]">
      <Link
        href="/themes"
        className="mb-4 inline-block text-[13px] font-semibold text-[var(--color-text-muted)]"
      >
        &larr; Back to Themes
      </Link>
      <h1 className="mb-2 text-[22px] font-extrabold text-[var(--color-text)]">Create Theme</h1>
      <p className="mb-5 text-[13.5px] text-[var(--color-text-muted)]">
        Name your theme, pick a template, and preview the full page before saving.
      </p>

      <ThemeForm mode="create" error={error} categories={categories} />
    </div>
  );
}
