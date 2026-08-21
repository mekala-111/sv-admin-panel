import { StatusBadge } from "@/components/ui/StatusBadge";
import { TableCard, Thead, Tr, Td, EmptyState } from "@/components/ui/Table";
import { fetchRevenueSummary, fetchTopVendors } from "@/lib/hooks/useAdminReports";
import { fetchPayments } from "@/lib/hooks/useAdminPayments";
import { fetchVendors } from "@/lib/hooks/useAdminVendors";
import { fetchCustomers } from "@/lib/hooks/useAdminCustomers";
import { fetchEvents } from "@/lib/hooks/useAdminEvents";
import { fetchRecordings, formatBytes } from "@/lib/hooks/useAdminRecordings";
import { fetchVendorNameMap, fetchCustomerNameMap } from "@/lib/hooks/useNameMaps";

const REPORT_TYPES = ["Revenue", "Vendor", "Customer", "Event", "Storage"];

function toParam(v: string | string[] | undefined): string {
  return Array.isArray(v) ? (v[0] ?? "") : (v ?? "");
}

function statusLabel(status: string): string {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

export default async function ReportsPage({
  searchParams,
}: PageProps<"/reports">) {
  const sp = await searchParams;
  const typeParam = toParam(sp.type);
  const type = REPORT_TYPES.includes(typeParam) ? typeParam : "Revenue";

  return (
    <div>
      <div className="mb-5 text-[22px] font-extrabold text-[var(--color-text)]">
        Reports
      </div>

      <div className="mb-5 grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-5">
        {REPORT_TYPES.map((r) => {
          const active = r === type;
          return (
            <a
              key={r}
              href={`/reports?type=${r}`}
              className="rounded-xl bg-white p-4 text-center text-[13px] font-bold"
              style={{
                border: active ? "2px solid var(--color-primary)" : "1px solid var(--color-border)",
                color: active ? "var(--color-primary)" : "var(--color-text)",
              }}
            >
              {r} Report
            </a>
          );
        })}
      </div>

      <ReportTable type={type} />
    </div>
  );
}

async function ReportTable({ type }: { type: string }) {
  if (type === "Revenue") {
    const [summary, payments, customerNames] = await Promise.all([
      fetchRevenueSummary().catch(() => null),
      fetchPayments({ status: "SUCCESS" }).catch(() => []),
      fetchCustomerNameMap().catch(() => new Map<string, string>()),
    ]);
    return (
      <>
        {summary ? (
          <div className="mb-4 grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <div className="rounded-xl border border-[var(--color-border)] bg-white p-4">
              <div className="mb-1 text-xs text-[var(--color-text-muted)]">Total Revenue</div>
              <div className="text-xl font-extrabold text-[var(--color-text)]">₹{summary.totalRevenue.toLocaleString("en-IN")}</div>
            </div>
            <div className="rounded-xl border border-[var(--color-border)] bg-white p-4">
              <div className="mb-1 text-xs text-[var(--color-text-muted)]">Successful Payments</div>
              <div className="text-xl font-extrabold text-[var(--color-text)]">{summary.successfulPayments}</div>
            </div>
          </div>
        ) : null}
        {payments.length === 0 ? (
          <EmptyState message="No successful payments yet." />
        ) : (
          <TableCard>
            <Thead columns={["CUSTOMER", "AMOUNT", "GATEWAY", "DATE"]} />
            <tbody>
              {payments.map((tx) => (
                <Tr key={tx.id}>
                  <Td>{tx.customerId ? customerNames.get(tx.customerId) ?? "–" : "–"}</Td>
                  <Td strong>₹{tx.amount.toLocaleString("en-IN")}</Td>
                  <Td muted>{tx.gateway}</Td>
                  <Td muted>{new Date(tx.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</Td>
                </Tr>
              ))}
            </tbody>
          </TableCard>
        )}
      </>
    );
  }

  if (type === "Vendor") {
    const [topVendors, vendorsResult] = await Promise.all([
      fetchTopVendors().catch(() => []),
      fetchVendors({ page: 1 }).catch(() => ({ items: [], page: 1, totalPages: 1, total: 0 })),
    ]);
    const vendors = vendorsResult.items;
    return vendors.length === 0 ? (
      <EmptyState message="No vendors yet." />
    ) : (
      <TableCard>
        <Thead columns={["VENDOR", "EVENTS", "STATUS", "CREATED"]} />
        <tbody>
          {vendors.map((v) => (
            <Tr key={v.id}>
              <Td strong>{v.companyName}</Td>
              <Td>{topVendors.find((tv) => tv.vendorId === v.id)?.eventCount ?? 0}</Td>
              <Td>
                <StatusBadge status={statusLabel(v.status)} />
              </Td>
              <Td muted>{new Date(v.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}</Td>
            </Tr>
          ))}
        </tbody>
      </TableCard>
    );
  }

  if (type === "Customer") {
    const [{ items }, vendorNames] = await Promise.all([
      fetchCustomers({ page: 1 }).catch(() => ({ items: [], page: 1, totalPages: 1, total: 0 })),
      fetchVendorNameMap().catch(() => new Map<string, string>()),
    ]);
    return items.length === 0 ? (
      <EmptyState message="No customers yet." />
    ) : (
      <TableCard>
        <Thead columns={["CUSTOMER", "VENDOR", "EVENTS"]} />
        <tbody>
          {items.map((c) => (
            <Tr key={c.id}>
              <Td strong>{c.name}</Td>
              <Td muted>{vendorNames.get(c.vendorId) ?? "–"}</Td>
              <Td>{c.eventsCount}</Td>
            </Tr>
          ))}
        </tbody>
      </TableCard>
    );
  }

  if (type === "Event") {
    const [{ items }, vendorNames] = await Promise.all([
      fetchEvents({ limit: 100 }).catch(() => ({ items: [], page: 1, totalPages: 1, total: 0 })),
      fetchVendorNameMap().catch(() => new Map<string, string>()),
    ]);
    return items.length === 0 ? (
      <EmptyState message="No events yet." />
    ) : (
      <TableCard>
        <Thead columns={["EVENT", "VENDOR", "DATE", "STATUS"]} />
        <tbody>
          {items.map((ev) => (
            <Tr key={ev.id}>
              <Td strong>{ev.eventName}</Td>
              <Td muted>{vendorNames.get(ev.vendorId) ?? "–"}</Td>
              <Td muted>{ev.eventDate ? new Date(ev.eventDate).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "–"}</Td>
              <Td>
                <StatusBadge status={statusLabel(ev.status)} />
              </Td>
            </Tr>
          ))}
        </tbody>
      </TableCard>
    );
  }

  // Storage
  const { items } = await fetchRecordings({ page: 1 }).catch(() => ({ items: [], page: 1, totalPages: 1, total: 0 }));
  return items.length === 0 ? (
    <EmptyState message="No recordings yet." />
  ) : (
    <TableCard>
      <Thead columns={["EVENT ID", "SIZE", "DURATION", "STATUS"]} />
      <tbody>
        {items.map((rc) => (
          <Tr key={rc.id}>
            <Td mono muted>{rc.eventId}</Td>
            <Td strong>{formatBytes(rc.sizeBytes)}</Td>
            <Td muted>{Math.round(rc.durationSec / 60)} min</Td>
            <Td muted>{rc.status}</Td>
          </Tr>
        ))}
      </tbody>
    </TableCard>
  );
}
