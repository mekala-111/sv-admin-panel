import { notFound } from "next/navigation";
import { BackLink } from "@/components/ui/Button";
import { Card, CardTitle } from "@/components/ui/Card";
import { TextField, TextAreaField, SelectField } from "@/components/ui/Field";
import { fetchThemeDetail, fetchThemeCategories } from "@/lib/hooks/useAdminThemes";
import { createThemeAction, updateThemeAction } from "@/lib/themes";

function toParam(v: string | string[] | undefined): string {
  return Array.isArray(v) ? (v[0] ?? "") : (v ?? "");
}

export default async function ThemeEditorPage({
  params,
  searchParams,
}: PageProps<"/themes/[id]/edit">) {
  const { id } = await params;
  const sp = await searchParams;
  const error = toParam(sp.error);
  const isNew = id === "0";

  const categories = await fetchThemeCategories().catch(() => []);
  const theme = isNew ? null : await fetchThemeDetail(id);
  if (!isNew && !theme) notFound();

  const action = isNew ? createThemeAction : updateThemeAction.bind(null, id);

  return (
    <div className="max-w-[700px]">
      <BackLink href="/themes" label="Back to Themes" />
      <div className="mb-5 text-[22px] font-extrabold text-[var(--color-text)]">
        {isNew ? "Create Theme" : `Edit — ${theme!.name}`}
      </div>

      <Card>
        <CardTitle>Theme Details</CardTitle>
        <form action={action} className="flex flex-col gap-3.5">
          <TextField label="Name" name="name" defaultValue={theme?.name} required />

          <SelectField
            label="Category"
            name="categoryId"
            options={["", ...categories.map((c) => c.id)]}
            defaultValue={theme?.categoryId ?? ""}
          />
          {categories.length > 0 ? (
            <div className="-mt-2 text-xs text-[var(--color-text-muted)]">
              Categories: {categories.map((c) => `${c.name} (${c.id.slice(0, 8)}…)`).join(" · ")}
            </div>
          ) : null}

          <SelectField
            label="Status"
            name="status"
            options={["DRAFT", "ACTIVE", "INACTIVE"]}
            defaultValue={theme?.status ?? "DRAFT"}
          />

          <TextAreaField
            label="Config (JSON)"
            name="config"
            placeholder='{"primaryColor": "#FF7A00"}'
            defaultValue={theme ? JSON.stringify(theme.config, null, 2) : "{}"}
          />

          {error ? (
            <p className="text-xs font-semibold text-[var(--color-danger)]" role="alert">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            className="w-fit rounded-[9px] bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] px-6 py-2.5 text-[13px] font-bold text-white"
          >
            {isNew ? "Create Theme" : "Save Changes"}
          </button>
        </form>
      </Card>
    </div>
  );
}
