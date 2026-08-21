import { Card, CardTitle } from "@/components/ui/Card";
import { PillTabs } from "@/components/ui/Tabs";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { TableCard, Thead, Tr, Td } from "@/components/ui/Table";
import { fetchPayments, fetchPlatformRevenue, type PaymentStatus } from "@/lib/hooks/useAdminPayments";
import { fetchVendorNameMap, fetchCustomerNameMap } from "@/lib/hooks/useNameMaps";
import { approvePaymentAction, rejectPaymentAction } from "@/lib/payments";

const FILTERS: { label: string; status: PaymentStatus }[] = [
  { label: "Pending", status: "PENDING" },
  { label: "Successful", status: "SUCCESS" },
  { label: "Failed", status: "FAILED" },
  { label: "Refunded", status: "REFUNDED" },
];

function toParam(v: string | string[] | undefined): string {
  return Array.isArray(v) ? (v[0] ?? "") : (v ?? "");
}

function statusLabel(status: string): string {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

export default async function PaymentsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const tabParam = toParam(sp.tab);
  const active = FILTERS.find((f) => f.label === tabParam) ?? FILTERS[0];
  const error = toParam(sp.error);

  const [allPayments, revenue, vendorNames, customerNames] = await Promise.all([
    fetchPayments().catch(() => []),
    fetchPlatformRevenue().catch(() => null),
    fetchVendorNameMap().catch(() => new Map<string, string>()),
    fetchCustomerNameMap().catch(() => new Map<string, string>()),
  ]);

  const transactions = allPayments.filter((t) => t.status === active.status);
  const pendingTotal = allPayments.filter((p) => p.status === "PENDING").reduce((s, p) => s + p.amount, 0);
  const refundedTotal = allPayments.filter((p) => p.status === "REFUNDED").reduce((s, p) => s + p.amount, 0);

  return (
    <div>
      <div className="mb-5 text-[22px] font-extrabold text-[var(--color-text)]">Payments</div>

      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-5">
        <Card>
          <div className="mb-1.5 text-xs text-[var(--color-text-muted)]">Platform wallet</div>
          <div className="text-xl font-extrabold text-[var(--color-text)]">{platform.balance}</div>
          <div className="mt-1 text-[11px] text-[var(--color-text-muted)]">Event creation fees</div>
        </Card>
        <Card>
          <div className="mb-1.5 text-xs text-[var(--color-text-muted)]">Awaiting approval</div>
          <div className="text-xl font-extrabold text-[var(--color-warning)]">
            {pendingFees.length}
          </div>
        </Card>
        <Card>
          <div className="mb-1.5 text-xs text-[var(--color-text-muted)]">Today&apos;s Revenue</div>
          <div className="text-xl font-extrabold text-[var(--color-text)]">{stats.todayRevenue}</div>
        </Card>
        <Card>
          <div className="mb-1.5 text-xs text-[var(--color-text-muted)]">Total Revenue</div>
          <div className="text-xl font-extrabold text-[var(--color-text)]">{stats.monthlyRevenue}</div>
        </Card>
        <Card>
          <div className="mb-1.5 text-xs text-[var(--color-text-muted)]">Pending amount</div>
          <div className="text-xl font-extrabold text-[var(--color-warning)]">{stats.pending}</div>
        </Card>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card>
          <div className="mb-1.5 text-xs text-[var(--color-text-muted)]">Platform Wallet Balance</div>
          <div className="text-xl font-extrabold text-[var(--color-text)]">
            ₹{(revenue?.balance ?? 0).toLocaleString("en-IN")}
          </div>
        </Card>
        <Card>
          <div className="mb-1.5 text-xs text-[var(--color-text-muted)]">Successful Payments</div>
          <div className="text-xl font-extrabold text-[var(--color-text)]">
            {allPayments.filter((p) => p.status === "SUCCESS").length}
          </div>
        </Card>
        <Card>
          <div className="mb-1.5 text-xs text-[var(--color-warning)]">Pending</div>
          <div className="text-xl font-extrabold text-[var(--color-warning)]">
            ₹{pendingTotal.toLocaleString("en-IN")}
          </div>
        </Card>
        <Card>
          <div className="mb-1.5 text-xs text-[var(--color-danger)]">Refunds</div>
          <div className="text-xl font-extrabold text-[var(--color-danger)]">
            ₹{refundedTotal.toLocaleString("en-IN")}
          </div>
        </Card>
      </div>

      {error ? (
        <p className="mb-4 text-xs font-semibold text-[var(--color-danger)]" role="alert">
          {error}
        </p>
      ) : null}

      <PillTabs basePath="/payments" options={FILTERS.map((f) => f.label)} current={active.label} />

      <TableCard>
        <Thead
          columns={
            active.status === "PENDING"
              ? ["PURPOSE", "CUSTOMER", "VENDOR", "AMOUNT", "GATEWAY", "DATE", "STATUS", ""]
              : ["PURPOSE", "CUSTOMER", "VENDOR", "AMOUNT", "GATEWAY", "DATE", "STATUS"]
          }
        />
        <tbody>
          {transactions.length === 0 ? (
            <tr>
              <Td muted>No {active.label.toLowerCase()} payments.</Td>
            </tr>
          ) : (
            transactions.map((tx) => (
              <Tr key={tx.id}>
                <Td strong>{tx.purpose === "EVENT_CREATION" ? "Event Creation" : "Customer"}</Td>
                <Td>{tx.customerId ? customerNames.get(tx.customerId) ?? "–" : "–"}</Td>
                <Td muted>{tx.vendorId ? vendorNames.get(tx.vendorId) ?? "–" : "–"}</Td>
                <Td strong>₹{tx.amount.toLocaleString("en-IN")}</Td>
                <Td muted>{tx.gateway}</Td>
                <Td muted>{new Date(tx.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</Td>
                <Td>
                  <StatusBadge status={statusLabel(tx.status)} />
                </Td>
                {active.status === "PENDING" && (
                  <Td>
                    <div className="flex gap-1.5">
                      <form action={approvePaymentAction.bind(null, tx.id)}>
                        <button type="submit" className="rounded-[7px] border border-[var(--color-border)] bg-white px-2.5 py-1 text-xs font-semibold text-[var(--color-success)]">
                          Approve
                        </button>
                      </form>
                      <form action={rejectPaymentAction.bind(null, tx.id)}>
                        <button type="submit" className="rounded-[7px] border border-[var(--color-border)] bg-white px-2.5 py-1 text-xs font-semibold text-[var(--color-danger)]">
                          Reject
                        </button>
                      </form>
                    </div>
                  </Td>
                )}
              </Tr>
            ))
          )}
        </tbody>
      </TableCard>
    </div>
  );
}
