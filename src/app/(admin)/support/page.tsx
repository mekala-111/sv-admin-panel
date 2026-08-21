import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { TableCard, Thead, Tr, Td } from "@/components/ui/Table";
import { fetchSupportTickets } from "@/lib/hooks/useAdminSupport";
import { fetchVendorNameMap, fetchCustomerNameMap } from "@/lib/hooks/useNameMaps";

function statusLabel(status: string): string {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

export default async function SupportPage(props: PageProps<"/support">) {
  const sp = await props.searchParams;
  const page = Math.max(1, Number(Array.isArray(sp.page) ? sp.page[0] : sp.page) || 1);

  const [result, vendorNames, customerNames] = await Promise.all([
    fetchSupportTickets({ page }).catch(() => ({ items: [], page: 1, totalPages: 1, total: 0 })),
    fetchVendorNameMap().catch(() => new Map<string, string>()),
    fetchCustomerNameMap().catch(() => new Map<string, string>()),
  ]);

  const tickets = result.items;
  const counts = {
    Open: tickets.filter((t) => t.status === "OPEN").length,
    Pending: tickets.filter((t) => t.status === "PENDING").length,
    Resolved: tickets.filter((t) => t.status === "RESOLVED").length,
    Critical: tickets.filter((t) => t.status === "CRITICAL").length,
  };

  return (
    <div>
      <div className="mb-5 text-[22px] font-extrabold text-[var(--color-text)]">
        Support Tickets
      </div>

      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card>
          <div className="mb-1.5 text-xs text-[var(--color-text-muted)]">Open</div>
          <div className="text-xl font-extrabold text-[var(--color-danger)]">{counts.Open}</div>
        </Card>
        <Card>
          <div className="mb-1.5 text-xs text-[var(--color-text-muted)]">Pending</div>
          <div className="text-xl font-extrabold text-[var(--color-warning)]">{counts.Pending}</div>
        </Card>
        <Card>
          <div className="mb-1.5 text-xs text-[var(--color-text-muted)]">Resolved</div>
          <div className="text-xl font-extrabold text-[var(--color-success)]">{counts.Resolved}</div>
        </Card>
        <Card>
          <div className="mb-1.5 text-xs text-[var(--color-text-muted)]">Critical</div>
          <div className="text-xl font-extrabold text-[var(--color-danger)]">{counts.Critical}</div>
        </Card>
      </div>

      <TableCard>
        <Thead columns={["TICKET", "SUBJECT", "VENDOR", "CATEGORY", "PRIORITY", "STATUS", ""]} />
        <tbody>
          {tickets.length === 0 ? (
            <tr>
              <Td muted>No tickets yet.</Td>
            </tr>
          ) : (
            tickets.map((t) => (
              <Tr key={t.id}>
                <Td mono muted>{t.ticketCode}</Td>
                <Td>{t.subject}</Td>
                <Td muted>{t.vendorId ? vendorNames.get(t.vendorId) ?? "–" : t.customerId ? customerNames.get(t.customerId) ?? "–" : "–"}</Td>
                <Td muted>{t.category}</Td>
                <Td>
                  <StatusBadge status={statusLabel(t.priority)} />
                </Td>
                <Td>
                  <StatusBadge status={statusLabel(t.status)} />
                </Td>
                <Td>
                  <Link
                    href={`/support/${t.id}`}
                    className="rounded-[7px] border border-[var(--color-border)] bg-white px-3 py-1.5 text-xs font-semibold text-[var(--color-primary)]"
                  >
                    View
                  </Link>
                </Td>
              </Tr>
            ))
          )}
        </tbody>
      </TableCard>

      {result.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-3 text-[13px]">
          <Link
            href={`/support?page=${page - 1}`}
            className="rounded-[7px] border border-[var(--color-border)] bg-white px-3.5 py-1.5 text-xs font-semibold"
            aria-disabled={page <= 1}
            style={page <= 1 ? { pointerEvents: "none", opacity: 0.5 } : undefined}
          >
            ← Previous
          </Link>
          <span className="text-[var(--color-text-muted)]">
            Page {result.page} of {result.totalPages} · {result.total} tickets
          </span>
          <Link
            href={`/support?page=${page + 1}`}
            className="rounded-[7px] border border-[var(--color-border)] bg-white px-3.5 py-1.5 text-xs font-semibold"
            aria-disabled={page >= result.totalPages}
            style={page >= result.totalPages ? { pointerEvents: "none", opacity: 0.5 } : undefined}
          >
            Next →
          </Link>
        </div>
      )}
    </div>
  );
}
