import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { TableCard, Thead, Tr, Td } from "@/components/ui/Table";
import {
  listEvents,
  listRecordings,
  listServers,
  listTransactions,
  listVendors,
  listCustomers,
  listWalletTx,
} from "@/lib/db";

const REPORT_TYPES = [
  "Revenue",
  "Vendor",
  "Customer",
  "Event",
  "Streaming",
  "Payment",
  "Wallet",
  "Storage",
];

export default async function ReportsPage({
  searchParams,
}: PageProps<"/reports">) {
  const sp = await searchParams;
  const typeParam = Array.isArray(sp.type) ? sp.type[0] : sp.type;
  const type = REPORT_TYPES.includes(typeParam ?? "")
    ? (typeParam as string)
    : "Revenue";

  return (
    <div>
      <div className="mb-5 text-[22px] font-extrabold text-[var(--color-text)]">
        Reports
      </div>

      <div className="mb-5 grid grid-cols-2 gap-3.5 sm:grid-cols-4">
        {REPORT_TYPES.map((r) => {
          const active = r === type;
          return (
            <Link
              key={r}
              href={`/reports?type=${r}`}
              className="rounded-xl bg-white p-4 text-center text-[13px] font-bold"
              style={{
                border: active
                  ? "2px solid var(--color-primary)"
                  : "1px solid var(--color-border)",
                color: active ? "var(--color-primary)" : "var(--color-text)",
              }}
            >
              {r} Report
            </Link>
          );
        })}
      </div>

      <div className="mb-3 flex flex-wrap justify-end gap-2">
        <Button variant="secondary">Export CSV</Button>
        <Button variant="secondary">Export Excel</Button>
        <Button variant="primary">Export PDF</Button>
      </div>

      <ReportTable type={type} />
    </div>
  );
}

function ReportTable({ type }: { type: string }) {
  if (type === "Revenue" || type === "Payment") {
    const rows = listTransactions();
    return (
      <TableCard>
        {type === "Revenue" ? (
          <Thead columns={["TXN ID", "CUSTOMER", "VENDOR", "AMOUNT", "STATUS"]} />
        ) : (
          <Thead columns={["TXN ID", "GATEWAY", "AMOUNT", "STATUS"]} />
        )}
        <tbody>
          {rows.map((tx) => (
            <Tr key={tx.id}>
              <Td mono muted>
                {tx.id}
              </Td>
              {type === "Revenue" ? (
                <>
                  <Td>{tx.customer}</Td>
                  <Td muted>{tx.vendor}</Td>
                </>
              ) : (
                <Td muted>{tx.gateway}</Td>
              )}
              <Td strong>{tx.amount}</Td>
              <Td>
                <StatusBadge status={tx.status} />
              </Td>
            </Tr>
          ))}
        </tbody>
      </TableCard>
    );
  }

  if (type === "Vendor") {
    const rows = listVendors();
    return (
      <TableCard>
        <Thead columns={["VENDOR", "EVENTS", "CUSTOMERS", "REVENUE", "STATUS"]} />
        <tbody>
          {rows.map((v) => (
            <Tr key={v.id}>
              <Td strong>{v.name}</Td>
              <Td>{v.events}</Td>
              <Td>{v.customers}</Td>
              <Td strong>{v.revenue}</Td>
              <Td>
                <StatusBadge status={v.status} />
              </Td>
            </Tr>
          ))}
        </tbody>
      </TableCard>
    );
  }

  if (type === "Customer") {
    const rows = listCustomers();
    return (
      <TableCard>
        <Thead columns={["CUSTOMER", "VENDOR", "EVENTS", "SPENDING"]} />
        <tbody>
          {rows.map((c) => (
            <Tr key={c.id}>
              <Td strong>{c.name}</Td>
              <Td muted>{c.vendor}</Td>
              <Td>{c.events}</Td>
              <Td strong>{c.spending}</Td>
            </Tr>
          ))}
        </tbody>
      </TableCard>
    );
  }

  if (type === "Event") {
    const rows = listEvents();
    return (
      <TableCard>
        <Thead columns={["EVENT", "VENDOR", "VIEWERS", "REVENUE", "STATUS"]} />
        <tbody>
          {rows.map((ev) => (
            <Tr key={ev.id}>
              <Td strong>{ev.name}</Td>
              <Td muted>{ev.vendor}</Td>
              <Td>{ev.viewers.toLocaleString("en-IN")}</Td>
              <Td strong>{ev.revenue}</Td>
              <Td>
                <StatusBadge status={ev.status} />
              </Td>
            </Tr>
          ))}
        </tbody>
      </TableCard>
    );
  }

  if (type === "Streaming") {
    const rows = listServers();
    return (
      <TableCard>
        <Thead columns={["SERVER", "LOCATION", "CPU", "RAM", "STATUS"]} />
        <tbody>
          {rows.map((s) => (
            <Tr key={s.name}>
              <Td strong>{s.name}</Td>
              <Td muted>{s.location}</Td>
              <Td>{s.cpu}%</Td>
              <Td>{s.ram}%</Td>
              <Td>
                <span className="font-semibold text-[var(--color-success)]">
                  {s.status}
                </span>
              </Td>
            </Tr>
          ))}
        </tbody>
      </TableCard>
    );
  }

  if (type === "Wallet") {
    const rows = listWalletTx();
    return (
      <TableCard>
        <Thead columns={["TYPE", "VENDOR", "AMOUNT", "DATE"]} />
        <tbody>
          {rows.map((w, i) => (
            <Tr key={i}>
              <Td strong>{w.type}</Td>
              <Td muted>{w.vendor}</Td>
              <Td>{w.amount}</Td>
              <Td muted>{w.date}</Td>
            </Tr>
          ))}
        </tbody>
      </TableCard>
    );
  }

  // Storage
  const rows = listRecordings();
  return (
    <TableCard>
      <Thead columns={["EVENT", "VENDOR", "FILE SIZE", "SERVER"]} />
      <tbody>
        {rows.map((rc, i) => (
          <Tr key={i}>
            <Td strong>{rc.event}</Td>
            <Td muted>{rc.vendor}</Td>
            <Td>{rc.size}</Td>
            <Td muted>{rc.storage}</Td>
          </Tr>
        ))}
      </tbody>
    </TableCard>
  );
}
