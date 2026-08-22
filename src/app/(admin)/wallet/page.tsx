import { Card } from "@/components/ui/Card";
import { TableCard, Thead, Tr, Td, EmptyState } from "@/components/ui/Table";
import { getWalletPlatformStats, listWalletTx } from "@/lib/db";

export default async function WalletPage() {
  const [walletTx, stats] = await Promise.all([listWalletTx(), getWalletPlatformStats()]);

  return (
    <div>
      <div className="mb-5 text-[22px] font-extrabold text-[var(--color-text)]">Wallet</div>

      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <div className="mb-1.5 text-xs text-[var(--color-text-muted)]">Total Platform Wallet</div>
          <div className="text-2xl font-extrabold text-[var(--color-text)]">{stats.totalPlatform}</div>
        </Card>
        <Card>
          <div className="mb-1.5 text-xs text-[var(--color-text-muted)]">Vendor Wallets</div>
          <div className="text-2xl font-extrabold text-[var(--color-text)]">{stats.vendorWallets}</div>
          <div className="mt-1 text-[11px] text-[var(--color-text-muted)]">
            Across {stats.vendorCount} vendors
          </div>
        </Card>
        <Card>
          <div className="mb-1.5 text-xs text-[var(--color-text-muted)]">Pending</div>
          <div className="text-2xl font-extrabold text-[var(--color-warning)]">{stats.pending}</div>
        </Card>
      </div>

      {walletTx.length === 0 ? (
        <EmptyState message="No wallet transactions yet." />
      ) : (
        <TableCard>
          <Thead columns={["TYPE", "VENDOR", "AMOUNT", "DATE"]} />
          <tbody>
            {walletTx.map((w, i) => (
              <Tr key={i}>
                <Td strong>{w.type}</Td>
                <Td muted>{w.vendor}</Td>
                <Td>{w.amount}</Td>
                <Td muted>{w.date}</Td>
              </Tr>
            ))}
          </tbody>
        </TableCard>
      )}
    </div>
  );
}
