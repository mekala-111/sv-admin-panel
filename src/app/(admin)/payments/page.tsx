import { Card } from "@/components/ui/Card";
import { PillTabs } from "@/components/ui/Tabs";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { TableCard, Thead, Tr, Td } from "@/components/ui/Table";
import { listTransactions } from "@/lib/db";

const FILTERS = ["Successful", "Pending", "Failed", "Refunded"];

export default async function PaymentsPage({
  searchParams,
}: PageProps<"/payments">) {
  const sp = await searchParams;
  const tabParam = Array.isArray(sp.tab) ? sp.tab[0] : sp.tab;
  const tab = FILTERS.includes(tabParam ?? "") ? (tabParam as string) : "Successful";

  const transactions = listTransactions().filter((t) => t.status === tab);

  return (
    <div>
      <div className="mb-5 text-[22px] font-extrabold text-[var(--color-text)]">
        Payments
      </div>

      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card>
          <div className="mb-1.5 text-xs text-[var(--color-text-muted)]">
            Today&apos;s Revenue
          </div>
          <div className="text-xl font-extrabold text-[var(--color-text)]">
            ₹64,200
          </div>
        </Card>
        <Card>
          <div className="mb-1.5 text-xs text-[var(--color-text-muted)]">
            Monthly Revenue
          </div>
          <div className="text-xl font-extrabold text-[var(--color-text)]">
            ₹18.42L
          </div>
        </Card>
        <Card>
          <div className="mb-1.5 text-xs text-[var(--color-text-muted)]">
            Pending
          </div>
          <div className="text-xl font-extrabold text-[var(--color-warning)]">
            ₹11,000
          </div>
        </Card>
        <Card>
          <div className="mb-1.5 text-xs text-[var(--color-text-muted)]">
            Refunds
          </div>
          <div className="text-xl font-extrabold text-[var(--color-danger)]">
            ₹4,200
          </div>
        </Card>
      </div>

      <PillTabs basePath="/payments" options={FILTERS} current={tab} />

      <TableCard>
        <Thead
          columns={[
            "TXN ID",
            "CUSTOMER",
            "VENDOR",
            "EVENT",
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
                {tx.id}
              </Td>
              <Td>{tx.customer}</Td>
              <Td muted>{tx.vendor}</Td>
              <Td muted>{tx.event}</Td>
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
    </div>
  );
}
