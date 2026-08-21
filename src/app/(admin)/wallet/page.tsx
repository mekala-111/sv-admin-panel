import { Card } from "@/components/ui/Card";
import { TableCard, Thead, Tr, Td, EmptyState } from "@/components/ui/Table";
import { fetchPlatformRevenue } from "@/lib/hooks/useAdminPayments";
import { fetchVendors } from "@/lib/hooks/useAdminVendors";
import { fetchVendorWallet, fetchVendorWalletTransactions } from "@/lib/hooks/useAdminWallet";
import { creditWalletAction } from "@/lib/payments";

function toParam(v: string | string[] | undefined): string {
  return Array.isArray(v) ? (v[0] ?? "") : (v ?? "");
}

export default async function WalletPage(props: PageProps<"/wallet">) {
  const sp = await props.searchParams;
  const error = toParam(sp.error);
  const vendorIdParam = toParam(sp.vendorId);

  const [revenue, vendorsResult] = await Promise.all([
    fetchPlatformRevenue().catch(() => null),
    fetchVendors({ page: 1 }).catch(() => ({ items: [], page: 1, totalPages: 1, total: 0 })),
  ]);
  const vendors = vendorsResult.items;
  const selectedVendorId = vendorIdParam || vendors[0]?.id || "";

  let wallet: Awaited<ReturnType<typeof fetchVendorWallet>> | null = null;
  let transactions: Awaited<ReturnType<typeof fetchVendorWalletTransactions>> | null = null;
  if (selectedVendorId) {
    [wallet, transactions] = await Promise.all([
      fetchVendorWallet(selectedVendorId).catch(() => null),
      fetchVendorWalletTransactions(selectedVendorId, { limit: 20 }).catch(() => null),
    ]);
  }

  return (
    <div>
      <div className="mb-5 text-[22px] font-extrabold text-[var(--color-text)]">
        Wallet
      </div>

      <div className="mb-5">
        <Card>
          <div className="mb-1.5 text-xs text-[var(--color-text-muted)]">Platform Wallet Balance</div>
          <div className="text-2xl font-extrabold text-[var(--color-text)]">
            ₹{(revenue?.balance ?? 0).toLocaleString("en-IN")}
          </div>
        </Card>
      </div>

      <Card className="mb-5">
        <div className="mb-3.5 text-[14px] font-bold text-[var(--color-text)]">Vendor Wallet Lookup</div>
        <form method="get" className="flex flex-wrap items-end gap-2.5">
          <div className="min-w-[240px] flex-1">
            <select
              name="vendorId"
              defaultValue={selectedVendorId}
              className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2.5 text-[13px] text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
            >
              {vendors.map((v) => (
                <option key={v.id} value={v.id}>{v.companyName}</option>
              ))}
            </select>
          </div>
          <button type="submit" className="rounded-[9px] border border-[var(--color-border)] bg-white px-4 py-2.5 text-[13px] font-semibold text-[var(--color-text)]">
            View Wallet
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
      ) : !wallet ? (
        <EmptyState message="Couldn't load this vendor's wallet." />
      ) : (
        <>
          <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Card>
              <div className="mb-1.5 text-xs text-[var(--color-text-muted)]">Vendor Wallet Balance</div>
              <div className="text-2xl font-extrabold text-[var(--color-text)]">
                ₹{wallet.balance.toLocaleString("en-IN")}
              </div>
            </Card>
            <Card>
              <div className="mb-2 text-[13px] font-bold text-[var(--color-text)]">Credit This Wallet</div>
              <form action={creditWalletAction.bind(null, selectedVendorId)} className="flex flex-wrap items-end gap-2.5">
                <div className="flex-1 min-w-[100px]">
                  <input
                    name="amount"
                    type="number"
                    min={1}
                    step="0.01"
                    required
                    placeholder="Amount (₹)"
                    className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2.5 text-[13px] outline-none focus:border-[var(--color-primary)]"
                  />
                </div>
                <button type="submit" className="rounded-[9px] bg-[var(--color-primary)] px-4 py-2.5 text-[13px] font-bold text-white">
                  Credit
                </button>
              </form>
            </Card>
          </div>

          {transactions && transactions.items.length > 0 ? (
            <TableCard>
              <Thead columns={["TYPE", "AMOUNT", "DESCRIPTION", "DATE"]} />
              <tbody>
                {transactions.items.map((w) => (
                  <Tr key={w.id}>
                    <Td strong>{w.type.charAt(0) + w.type.slice(1).toLowerCase()}</Td>
                    <Td>₹{Math.abs(w.amount).toLocaleString("en-IN")}</Td>
                    <Td muted>{w.description ?? w.referenceType ?? "–"}</Td>
                    <Td muted>{new Date(w.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</Td>
                  </Tr>
                ))}
              </tbody>
            </TableCard>
          ) : (
            <EmptyState message="No transactions yet for this vendor." />
          )}
        </>
      )}
    </div>
  );
}
