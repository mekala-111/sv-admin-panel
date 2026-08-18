import { Card } from "@/components/ui/Card";
import { TableCard, Thead, Tr, Td } from "@/components/ui/Table";
import { listWalletTx } from "@/lib/db";

export default function WalletPage() {
  const walletTx = listWalletTx();

  return (
    <div>
      <div className="mb-5 text-[22px] font-extrabold text-[var(--color-text)]">
        Wallet
      </div>

      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <div className="mb-1.5 text-xs text-[var(--color-text-muted)]">
            Total Platform Wallet
          </div>
          <div className="text-2xl font-extrabold text-[var(--color-text)]">
            ₹42,84,200
          </div>
        </Card>
        <Card>
          <div className="mb-1.5 text-xs text-[var(--color-text-muted)]">
            Vendor Wallets
          </div>
          <div className="text-2xl font-extrabold text-[var(--color-text)]">
            ₹28,41,000
          </div>
        </Card>
        <Card>
          <div className="mb-1.5 text-xs text-[var(--color-text-muted)]">
            Pending
          </div>
          <div className="text-2xl font-extrabold text-[var(--color-warning)]">
            ₹4,20,000
          </div>
        </Card>
      </div>

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
    </div>
  );
}
