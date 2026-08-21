import Link from "next/link";
import { TableCard, Thead, Tr, Td } from "@/components/ui/Table";
import { fetchAuditLogs } from "@/lib/hooks/useAdminAuditLogs";

function toParam(v: string | string[] | undefined): string {
  return Array.isArray(v) ? (v[0] ?? "") : (v ?? "");
}

export default async function AuditLogsPage(props: PageProps<"/audit-logs">) {
  const sp = await props.searchParams;
  const page = Math.max(1, Number(toParam(sp.page)) || 1);
  const moduleFilter = toParam(sp.module);

  const { items, page: currentPage, totalPages, total } = await fetchAuditLogs({ page, module: moduleFilter || undefined }).catch(() => ({
    items: [],
    page: 1,
    totalPages: 1,
    total: 0,
  }));

  return (
    <div>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-[22px] font-extrabold text-[var(--color-text)]">Audit Logs</div>
        <form method="get" className="flex gap-2">
          <input
            type="text"
            name="module"
            defaultValue={moduleFilter}
            placeholder="Filter by module..."
            className="rounded-lg border border-[var(--color-border)] px-3 py-2 text-[13px] outline-none focus:border-[var(--color-primary)]"
          />
          <button type="submit" className="rounded-[9px] border border-[var(--color-border)] bg-white px-4 py-2 text-[13px] font-semibold text-[var(--color-text)]">
            Filter
          </button>
        </form>
      </div>
      <TableCard>
        <Thead columns={["ACTION", "MODULE", "ENTITY", "IP", "DATE"]} />
        <tbody>
          {items.length === 0 ? (
            <tr>
              <Td muted>No audit log entries yet.</Td>
            </tr>
          ) : (
            items.map((l) => (
              <Tr key={l.id}>
                <Td strong>{l.action}</Td>
                <Td muted>{l.module}</Td>
                <Td muted>{l.entityType ?? "–"}</Td>
                <Td mono muted>{l.ipAddress ?? "–"}</Td>
                <Td muted>
                  {new Date(l.createdAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                </Td>
              </Tr>
            ))
          )}
        </tbody>
      </TableCard>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-3 text-[13px]">
          <Link
            href={`/audit-logs?${new URLSearchParams({ ...(moduleFilter ? { module: moduleFilter } : {}), page: String(page - 1) })}`}
            className="rounded-[7px] border border-[var(--color-border)] bg-white px-3.5 py-1.5 text-xs font-semibold"
            aria-disabled={page <= 1}
            style={page <= 1 ? { pointerEvents: "none", opacity: 0.5 } : undefined}
          >
            ← Previous
          </Link>
          <span className="text-[var(--color-text-muted)]">
            Page {currentPage} of {totalPages} · {total} entries
          </span>
          <Link
            href={`/audit-logs?${new URLSearchParams({ ...(moduleFilter ? { module: moduleFilter } : {}), page: String(page + 1) })}`}
            className="rounded-[7px] border border-[var(--color-border)] bg-white px-3.5 py-1.5 text-xs font-semibold"
            aria-disabled={page >= totalPages}
            style={page >= totalPages ? { pointerEvents: "none", opacity: 0.5 } : undefined}
          >
            Next →
          </Link>
        </div>
      )}
    </div>
  );
}
