import { Card, CardTitle } from "@/components/ui/Card";
import { TextField } from "@/components/ui/Field";
import { fetchPlans } from "@/lib/hooks/useAdminPlans";
import { fetchVendors } from "@/lib/hooks/useAdminVendors";
import { createPlanAction, updatePlanAction, assignPlanToVendorAction } from "@/lib/plans";

function toParam(v: string | string[] | undefined): string {
  return Array.isArray(v) ? (v[0] ?? "") : (v ?? "");
}

export default async function PricingPage({
  searchParams,
}: PageProps<"/pricing">) {
  const sp = await searchParams;
  const planParam = toParam(sp.plan);
  const error = toParam(sp.error);

  const [plans, vendorsResult] = await Promise.all([
    fetchPlans().catch(() => []),
    fetchVendors({ page: 1 }).catch(() => ({ items: [], page: 1, totalPages: 1, total: 0 })),
  ]);
  const vendors = vendorsResult.items;
  const selected = plans.find((p) => p.id === planParam) ?? plans[0] ?? null;

  return (
    <div>
      <div className="mb-5 text-[22px] font-extrabold text-[var(--color-text)]">
        Pricing &amp; Plans
      </div>

      {error ? (
        <p className="mb-4 text-xs font-semibold text-[var(--color-danger)]" role="alert">
          {error}
        </p>
      ) : null}

      {plans.length === 0 ? (
        <div className="mb-6 rounded-[14px] border border-dashed border-[var(--color-border)] p-10 text-center text-[13px] text-[var(--color-text-faint)]">
          No plans yet — create your first one below.
        </div>
      ) : (
        <div className="mb-6 grid grid-cols-1 gap-[18px] sm:grid-cols-2 lg:grid-cols-3">
          {plans.map((p) => {
            const active = selected?.id === p.id;
            return (
              <a
                key={p.id}
                href={`/pricing?plan=${p.id}`}
                className="rounded-[14px] bg-white p-[22px]"
                style={{ border: active ? "2px solid var(--color-primary)" : "1px solid var(--color-border)" }}
              >
                <div className="mb-1 text-[15px] font-bold text-[var(--color-text)]">{p.name}</div>
                <div className="mb-3.5 text-[22px] font-extrabold text-[var(--color-primary)]">
                  ₹{p.price}/{p.billingPeriod}
                </div>
                <div className="flex flex-col gap-2 text-xs text-[var(--color-text-muted)]">
                  <div>Events: <span className="font-semibold text-[var(--color-text)]">{p.eventLimit}</span></div>
                  <div>Streaming: <span className="font-semibold text-[var(--color-text)]">{p.hoursLimit} hrs</span></div>
                  <div>Storage: <span className="font-semibold text-[var(--color-text)]">{p.storageGb} GB</span></div>
                  <div>Viewers: <span className="font-semibold text-[var(--color-text)]">{p.viewerLimit}</span></div>
                  <div>Status: <span className="font-semibold text-[var(--color-text)]">{p.status}</span></div>
                </div>
              </a>
            );
          })}
        </div>
      )}

      {selected ? (
        <Card className="mb-5">
          <CardTitle>Configure — {selected.name}</CardTitle>
          <form action={updatePlanAction.bind(null, selected.id)} className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
            <TextField label="Price (₹)" name="price" type="number" defaultValue={selected.price} />
            <TextField label="Event Limit" name="eventLimit" type="number" defaultValue={selected.eventLimit} />
            <TextField label="Streaming Hours" name="hoursLimit" type="number" defaultValue={selected.hoursLimit} />
            <TextField label="Storage (GB)" name="storageGb" type="number" defaultValue={selected.storageGb} />
            <TextField label="Viewer Limit" name="viewerLimit" type="number" defaultValue={selected.viewerLimit} />
            <div>
              <label htmlFor="status" className="mb-1.5 block text-xs font-semibold text-[var(--color-text-muted)]">
                Status
              </label>
              <select
                id="status"
                name="status"
                defaultValue={selected.status}
                className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2.5 text-[13px] text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
            <button type="submit" className="col-span-full w-fit rounded-[9px] bg-[var(--color-primary)] px-5 py-2.5 text-[13px] font-bold text-white">
              Save Plan
            </button>
          </form>
        </Card>
      ) : null}

      {selected ? (
        <Card className="mb-5">
          <CardTitle>Assign {selected.name} to a Vendor</CardTitle>
          <form action={assignPlanToVendorAction.bind(null, selected.id)} className="flex flex-wrap items-end gap-2.5">
            <div className="min-w-[240px] flex-1">
              <label htmlFor="vendorId" className="mb-1.5 block text-xs font-semibold text-[var(--color-text-muted)]">
                Vendor
              </label>
              <select
                id="vendorId"
                name="vendorId"
                className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2.5 text-[13px] text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
              >
                {vendors.map((v) => (
                  <option key={v.id} value={v.id}>{v.companyName}</option>
                ))}
              </select>
            </div>
            <button type="submit" className="rounded-[9px] border border-[var(--color-border)] bg-white px-4 py-2.5 text-[13px] font-semibold text-[var(--color-primary)]">
              Assign
            </button>
          </form>
        </Card>
      ) : null}

      <Card>
        <CardTitle>Create New Plan</CardTitle>
        <form action={createPlanAction} className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
          <TextField label="Name" name="name" placeholder="e.g. Enterprise" required />
          <TextField label="Code" name="code" placeholder="e.g. ENTERPRISE" required />
          <TextField label="Price (₹)" name="price" type="number" placeholder="0" />
          <TextField label="Event Limit" name="eventLimit" type="number" placeholder="0" />
          <TextField label="Streaming Hours" name="hoursLimit" type="number" placeholder="0" />
          <TextField label="Storage (GB)" name="storageGb" type="number" placeholder="0" />
          <TextField label="Viewer Limit" name="viewerLimit" type="number" placeholder="0" />
          <button type="submit" className="col-span-full w-fit rounded-[9px] bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] px-5 py-2.5 text-[13px] font-bold text-white">
            Create Plan
          </button>
        </form>
      </Card>
    </div>
  );
}
