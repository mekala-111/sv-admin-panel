import { BackLink } from "@/components/ui/Button";
import { Card, CardTitle } from "@/components/ui/Card";
import { TextField } from "@/components/ui/Field";
import { createVendorAction } from "@/lib/vendors";
import { fetchPlans } from "@/lib/hooks/useAdminPlans";

function toParam(v: string | string[] | undefined): string {
  return Array.isArray(v) ? (v[0] ?? "") : (v ?? "");
}

export default async function CreateVendorPage(props: PageProps<"/vendors/create">) {
  const params = await props.searchParams;
  const error = toParam(params.error);

  const plans = await fetchPlans().catch(() => []);

  return (
    <div className="max-w-[760px]">
      <BackLink href="/vendors" label="Back to Vendors" />
      <div className="mb-5 text-[22px] font-extrabold text-[var(--color-text)]">
        Add Vendor
      </div>

      <form action={createVendorAction} className="flex flex-col gap-4">
        <Card>
          <CardTitle>Login &amp; Contact</CardTitle>
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <TextField label="Contact Name" name="name" placeholder="e.g. Rahul Sharma" required />
            <TextField label="Company Name" name="company" placeholder="e.g. SV Events Pvt Ltd" required />
            <TextField label="Email" name="email" type="email" placeholder="vendor@email.com" required />
            <TextField label="Password" name="password" type="password" placeholder="At least 8 characters" required />
            <TextField label="Phone" name="phone" placeholder="+91 00000 00000" />
            <TextField label="WhatsApp Number" name="whatsappNumber" placeholder="+91 00000 00000" />
          </div>
        </Card>

        <Card>
          <CardTitle>Business</CardTitle>
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <TextField label="Address" name="address" placeholder="Street address" />
            <div>
              <label htmlFor="planId" className="mb-1.5 block text-xs font-semibold text-[var(--color-text-muted)]">
                Pricing Plan
              </label>
              <select
                id="planId"
                name="planId"
                className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2.5 text-[13px] text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
              >
                <option value="">No plan</option>
                {plans.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — ₹{p.price}/{p.billingPeriod}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        <Card>
          <CardTitle>Billing</CardTitle>
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <TextField label="Event Creation Fee (₹)" name="eventCreationFee" type="number" placeholder="0" />
            <TextField label="Initial Wallet Credit (₹)" name="initialWalletCredit" type="number" placeholder="0" />
          </div>
        </Card>

        {error ? (
          <p className="text-xs font-semibold text-[var(--color-danger)]" role="alert">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          className="w-fit rounded-[9px] bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] px-6 py-3 text-sm font-bold text-white"
        >
          CREATE VENDOR
        </button>
      </form>
    </div>
  );
}
