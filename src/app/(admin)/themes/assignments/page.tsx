import { BackLink } from "@/components/ui/Button";
import { Card, CardTitle } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { TableCard, Thead, Tr, Td, EmptyState } from "@/components/ui/Table";
import { fetchThemes, fetchVendorAssignedThemes } from "@/lib/hooks/useAdminThemes";
import { fetchVendors } from "@/lib/hooks/useAdminVendors";
import { assignThemeToVendorAction } from "@/lib/themes";

function toParam(v: string | string[] | undefined): string {
  return Array.isArray(v) ? (v[0] ?? "") : (v ?? "");
}

export default async function ThemeAssignmentsPage(props: PageProps<"/themes/assignments">) {
  const sp = await props.searchParams;
  const error = toParam(sp.error);
  const vendorId = toParam(sp.vendorId);

  const [vendorsResult, themes] = await Promise.all([
    fetchVendors({ page: 1 }).catch(() => ({ items: [], page: 1, totalPages: 1, total: 0 })),
    fetchThemes().catch(() => []),
  ]);
  const vendors = vendorsResult.items;
  const selectedVendorId = vendorId || vendors[0]?.id || "";

  const assigned = selectedVendorId
    ? await fetchVendorAssignedThemes(selectedVendorId).catch(() => [])
    : [];
  const assignedThemeIds = new Set(assigned.map((a) => a.themeId));

  return (
    <div>
      <BackLink href="/themes" label="Back to Themes" />
      <div className="mb-2 text-[22px] font-extrabold text-[var(--color-text)]">
        Theme Assignments
      </div>

      <Card className="mb-5">
        <CardTitle>Choose a Vendor</CardTitle>
        <form method="get" className="flex flex-wrap items-end gap-2.5">
          <div className="min-w-[240px] flex-1">
            <select
              name="vendorId"
              defaultValue={selectedVendorId}
              className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2.5 text-[13px] text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
            >
              {vendors.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.companyName}
                </option>
              ))}
            </select>
          </div>
          <button type="submit" className="rounded-[9px] border border-[var(--color-border)] bg-white px-4 py-2.5 text-[13px] font-semibold text-[var(--color-text)]">
            View Assignments
          </button>
        </form>
      </Card>

      {error ? (
        <p className="mb-4 text-xs font-semibold text-[var(--color-danger)]" role="alert">
          {error}
        </p>
      ) : null}

      {!selectedVendorId ? (
        <EmptyState message="No vendors yet." />
      ) : (
        <>
          {assigned.length === 0 ? (
            <EmptyState message="This vendor has no themes assigned yet." />
          ) : (
            <TableCard>
              <Thead columns={["THEME", "ENABLED", "DEFAULT"]} />
              <tbody>
                {assigned.map((a) => (
                  <Tr key={a.id}>
                    <Td strong>{a.theme.name}</Td>
                    <Td>
                      <StatusBadge status={a.isEnabled ? "Active" : "Disabled"} />
                    </Td>
                    <Td muted>{a.isDefault ? "Yes" : "No"}</Td>
                  </Tr>
                ))}
              </tbody>
            </TableCard>
          )}

          <Card className="mt-5">
            <CardTitle>Assign a Theme</CardTitle>
            {themes.length === 0 ? (
              <div className="text-[13px] text-[var(--color-text-muted)]">No themes available yet.</div>
            ) : (
              <div className="flex flex-col gap-2.5">
                {themes.map((t) => (
                  <form
                    key={t.id}
                    action={assignThemeToVendorAction.bind(null, t.id)}
                    className="flex flex-wrap items-center justify-between gap-2.5 rounded-xl border border-[var(--color-border)] p-3"
                  >
                    <input type="hidden" name="vendorId" value={selectedVendorId} />
                    <div className="text-[13px] font-semibold text-[var(--color-text)]">
                      {t.name} {assignedThemeIds.has(t.id) ? "(already assigned)" : ""}
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)]">
                        <input type="checkbox" name="isEnabled" defaultChecked />
                        Enabled
                      </label>
                      <label className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)]">
                        <input type="checkbox" name="isDefault" />
                        Default
                      </label>
                      <button type="submit" className="rounded-[7px] border border-[var(--color-border)] bg-white px-3 py-1.5 text-xs font-semibold text-[var(--color-primary)]">
                        Assign
                      </button>
                    </div>
                  </form>
                ))}
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
