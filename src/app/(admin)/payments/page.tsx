import { Card, CardTitle } from "@/components/ui/Card";
import { PillTabs } from "@/components/ui/Tabs";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { TableCard, Thead, Tr, Td, EmptyState } from "@/components/ui/Table";
import {
  getPaymentStats,
  getPlatformRevenue,
  listPendingEventCreationPayments,
  listTransactions,
} from "@/lib/db";
import { approvePaymentAction, rejectPaymentAction } from "@/lib/payment-actions";

const FILTERS = ["Successful", "Pending", "Failed", "Refunded"];

export default async function PaymentsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const tabParam = Array.isArray(sp.tab) ? sp.tab[0] : sp.tab;
  const tab = FILTERS.includes(tabParam ?? "") ? (tabParam as string) : "Pending";

  const [allTx, stats, platform, pendingFees] = await Promise.all([
    listTransactions(),
    getPaymentStats(),
    getPlatformRevenue(),
    listPendingEventCreationPayments(),
  ]);
  const transactions = allTx.filter((t) => t.status === tab);

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

      {pendingFees.length > 0 ? (
        <Card className="mb-5">
          <CardTitle>Event creation payments to review</CardTitle>
          <div className="flex flex-col gap-4">
            {pendingFees.map((fee) => (
              <div
                key={fee.id}
                className="flex flex-col gap-3 rounded-[12px] border border-[var(--color-border)] p-4 sm:flex-row sm:items-start"
              >
                {fee.paymentImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={fee.paymentImage}
                    alt="Payment proof"
                    className="h-28 w-28 shrink-0 rounded-lg border border-[var(--color-border)] object-cover"
                  />
                ) : (
                  <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-lg border border-dashed border-[var(--color-border)] text-[11px] text-[var(--color-text-muted)]">
                    No image
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="text-[14px] font-bold text-[var(--color-text)]">{fee.event}</div>
                  <div className="mt-1 text-[12px] text-[var(--color-text-muted)]">
                    Vendor: {fee.vendor} · {fee.date}
                  </div>
                  <div className="mt-2 text-[13px] font-semibold">{fee.amount}</div>
                  <div className="mt-1 font-mono text-[12px] text-[var(--color-text)]">
                    UTR: {fee.utrNumber}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <form action={approvePaymentAction}>
                      <input type="hidden" name="id" value={fee.id} />
                      <button
                        type="submit"
                        className="rounded-[8px] bg-[var(--color-primary)] px-3.5 py-2 text-[12px] font-bold text-white"
                      >
                        Approve &amp; go live
                      </button>
                    </form>
                    <form action={rejectPaymentAction} className="flex flex-wrap items-center gap-2">
                      <input type="hidden" name="id" value={fee.id} />
                      <input
                        name="reason"
                        placeholder="Reject reason"
                        className="rounded-[8px] border border-[var(--color-border)] px-2.5 py-2 text-[12px]"
                      />
                      <button
                        type="submit"
                        className="rounded-[8px] border border-[var(--color-danger)] px-3.5 py-2 text-[12px] font-bold text-[var(--color-danger)]"
                      >
                        Reject
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      ) : null}

      <PillTabs basePath="/payments" options={FILTERS} current={tab} />

      {transactions.length === 0 ? (
        <EmptyState message={`No ${tab.toLowerCase()} payments.`} />
      ) : (
        <TableCard>
          <Thead
            columns={[
              "TXN ID",
              "VENDOR",
              "EVENT",
              "UTR",
              "AMOUNT",
              "GATEWAY",
              "DATE",
              "STATUS",
            ]}
          />
          <tbody>
            {transactions.map((tx) => (
              <Tr key={tx.id}>
                <Td mono muted>
                  {tx.id.slice(0, 8)}…
                </Td>
                <Td muted>{tx.vendor}</Td>
                <Td muted>{tx.event}</Td>
                <Td mono muted>
                  {tx.utrNumber || "—"}
                </Td>
                <Td strong>{tx.amount}</Td>
                <Td muted>{tx.gateway}</Td>
                <Td muted>{tx.date}</Td>
                <Td>
                  <StatusBadge status={tx.status} />
                </Td>
              </Tr>
            ))}
          </tbody>
        </TableCard>
      )}
    </div>
  );
}
