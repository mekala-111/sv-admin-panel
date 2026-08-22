import { BackLink } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { listThemeAssignments, listThemes, listVendors } from "@/lib/db";
import { saveVendorThemeAssignmentsAction } from "@/lib/theme-actions";
import { VendorThemeAssignments } from "./VendorThemeAssignments";

export default async function ThemeAssignmentsPage(props: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const searchParams = await props.searchParams;
  const [vendors, themes, assignments] = await Promise.all([
    listVendors(),
    listThemes(),
    listThemeAssignments(),
  ]);

  const assignedByVendor = new Map<string, Set<string>>();
  for (const row of assignments) {
    if (!row.isEnabled) continue;
    const set = assignedByVendor.get(row.vendorId) ?? new Set<string>();
    set.add(row.themeId);
    assignedByVendor.set(row.vendorId, set);
  }

  return (
    <div>
      <BackLink href="/themes" label="Back to Themes" />
      <div className="mb-2 text-[22px] font-extrabold text-[var(--color-text)]">
        Theme Assignments
      </div>
      <p className="mb-5 max-w-2xl text-[13.5px] leading-relaxed text-[var(--color-muted-strong)]">
        Assign themes to vendors. Vendors only see assigned themes when creating events.
      </p>

      {searchParams.saved ? (
        <div className="mb-4 text-[13px] font-bold text-[#1E9E5A]">Assignments saved.</div>
      ) : null}
      {searchParams.error ? (
        <div className="mb-4 text-[13px] font-bold text-[#E4362B]">
          Could not save assignments. Please try again.
        </div>
      ) : null}

      {vendors.length === 0 ? (
        <p className="text-[13.5px] text-[var(--color-muted)]">No vendors yet. Create a vendor first.</p>
      ) : themes.length === 0 ? (
        <p className="text-[13.5px] text-[var(--color-muted)]">No themes yet. Create a theme first.</p>
      ) : (
        <div className="space-y-4">
          {vendors.map((vendor) => {
            const vendorId = String(vendor.id);
            const assigned = assignedByVendor.get(vendorId) ?? new Set<string>();
            return (
              <div
                key={vendorId}
                className="rounded-[12px] border border-[var(--color-border)] bg-white p-4 shadow-sm"
              >
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="text-[15px] font-extrabold text-[var(--color-text)]">
                      {vendor.name}
                    </div>
                    <div className="text-[12px] text-[var(--color-muted)]">{vendor.email}</div>
                  </div>
                  <StatusBadge status={vendor.status} />
                </div>
                <VendorThemeAssignments
                  vendorId={vendorId}
                  themes={themes.map((t) => ({
                    id: t._id ?? String(t.id),
                    name: t.name,
                    category: t.category,
                    status: t.status,
                  }))}
                  assignedThemeIds={[...assigned]}
                  saveAction={saveVendorThemeAssignmentsAction}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
