import Link from "next/link";
import { TableCard, Thead, Tr, Td, EmptyState } from "@/components/ui/Table";
import { fetchRecordings, formatBytes } from "@/lib/hooks/useAdminRecordings";
import { fetchVendorNameMap } from "@/lib/hooks/useNameMaps";
import { deleteRecordingAction } from "@/lib/recordings";

function toParam(v: string | string[] | undefined): string {
  return Array.isArray(v) ? (v[0] ?? "") : (v ?? "");
}

export default async function RecordingsPage(props: PageProps<"/recordings">) {
  const sp = await props.searchParams;
  const page = Math.max(1, Number(toParam(sp.page)) || 1);
  const error = toParam(sp.error);

  const [{ items, page: currentPage, totalPages, total }, vendorNames] = await Promise.all([
    fetchRecordings({ page }).catch(() => ({ items: [], page: 1, totalPages: 1, total: 0 })),
    fetchVendorNameMap().catch(() => new Map<string, string>()),
  ]);

  return (
    <div>
      <div className="mb-5 text-[22px] font-extrabold text-[var(--color-text)]">
        Recordings
      </div>

      {error ? (
        <p className="mb-4 text-xs font-semibold text-[var(--color-danger)]" role="alert">
          {error}
        </p>
      ) : null}

      {items.length === 0 ? (
        <EmptyState message="No recordings yet." />
      ) : (
        <>
          <TableCard>
            <Thead columns={["VENDOR", "SIZE", "DURATION", "STATUS", "RECORDED", ""]} />
            <tbody>
              {items.map((rc) => (
                <Tr key={rc.id}>
                  <Td strong>{vendorNames.get(rc.vendorId) ?? "–"}</Td>
                  <Td>{formatBytes(rc.sizeBytes)}</Td>
                  <Td muted>{Math.round(rc.durationSec / 60)} min</Td>
                  <Td muted>{rc.status}</Td>
                  <Td muted>{new Date(rc.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</Td>
                  <Td>
                    <form action={deleteRecordingAction.bind(null, rc.id)}>
                      <button type="submit" className="rounded-[7px] border border-[var(--color-border)] bg-white px-3 py-1.5 text-xs font-semibold text-[var(--color-danger)]">
                        Delete
                      </button>
                    </form>
                  </Td>
                </Tr>
              ))}
            </tbody>
          </TableCard>

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-center gap-3 text-[13px]">
              <Link
                href={`/recordings?page=${page - 1}`}
                className="rounded-[7px] border border-[var(--color-border)] bg-white px-3.5 py-1.5 text-xs font-semibold"
                aria-disabled={page <= 1}
                style={page <= 1 ? { pointerEvents: "none", opacity: 0.5 } : undefined}
              >
                ← Previous
              </Link>
              <span className="text-[var(--color-text-muted)]">
                Page {currentPage} of {totalPages} · {total} recordings
              </span>
              <Link
                href={`/recordings?page=${page + 1}`}
                className="rounded-[7px] border border-[var(--color-border)] bg-white px-3.5 py-1.5 text-xs font-semibold"
                aria-disabled={page >= totalPages}
                style={page >= totalPages ? { pointerEvents: "none", opacity: 0.5 } : undefined}
              >
                Next →
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}
