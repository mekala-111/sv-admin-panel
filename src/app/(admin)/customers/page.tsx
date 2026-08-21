import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { TableCard, Thead, Tr, Td } from "@/components/ui/Table";
import { fetchCustomers } from "@/lib/hooks/useAdminCustomers";
import { fetchVendorNameMap } from "@/lib/hooks/useNameMaps";

function toParam(v: string | string[] | undefined): string {
  return Array.isArray(v) ? (v[0] ?? "") : (v ?? "");
}

function statusLabel(status: string): string {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

export default async function CustomersPage(props: PageProps<"/customers">) {
  const params = await props.searchParams;
  const page = Math.max(1, Number(toParam(params.page)) || 1);

  let result: Awaited<ReturnType<typeof fetchCustomers>> | null = null;
  let vendorNames = new Map<string, string>();
  let loadError: string | null = null;
  try {
    [result, vendorNames] = await Promise.all([
      fetchCustomers({ page }),
      fetchVendorNameMap().catch(() => new Map<string, string>()),
    ]);
  } catch {
    loadError = "Couldn't load customers. Please try again.";
  }

  return (
    <div>
      <PageHeader title="Customers" />

      {loadError ? (
        <div className="rounded-[14px] border border-[var(--color-border)] bg-white p-8 text-center text-[13px] text-[var(--color-text-muted)]">
          {loadError}
        </div>
      ) : (
        <>
          <TableCard>
            <Thead columns={["CUSTOMER", "VENDOR", "EMAIL", "PHONE", "EVENTS", "STATUS", "JOINED", ""]} />
            <tbody>
              {result!.items.length === 0 ? (
                <tr>
                  <Td muted>No customers yet.</Td>
                </tr>
              ) : (
                result!.items.map((c) => (
                  <Tr key={c.id}>
                    <Td strong>{c.name}</Td>
                    <Td muted>{vendorNames.get(c.vendorId) ?? "–"}</Td>
                    <Td muted>{c.email ?? "–"}</Td>
                    <Td muted>{c.phone ?? "–"}</Td>
                    <Td>{c.eventsCount}</Td>
                    <Td>
                      <StatusBadge status={statusLabel(c.status)} />
                    </Td>
                    <Td muted>{new Date(c.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}</Td>
                    <Td>
                      <Link
                        href={`/customers/${c.id}`}
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

          {result!.totalPages > 1 && (
            <div className="mt-4 flex items-center justify-center gap-3 text-[13px]">
              <Link
                href={`/customers?page=${page - 1}`}
                className="rounded-[7px] border border-[var(--color-border)] bg-white px-3.5 py-1.5 text-xs font-semibold"
                aria-disabled={page <= 1}
                style={page <= 1 ? { pointerEvents: "none", opacity: 0.5 } : undefined}
              >
                ← Previous
              </Link>
              <span className="text-[var(--color-text-muted)]">
                Page {result!.page} of {result!.totalPages} · {result!.total} customers
              </span>
              <Link
                href={`/customers?page=${page + 1}`}
                className="rounded-[7px] border border-[var(--color-border)] bg-white px-3.5 py-1.5 text-xs font-semibold"
                aria-disabled={page >= result!.totalPages}
                style={page >= result!.totalPages ? { pointerEvents: "none", opacity: 0.5 } : undefined}
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
