import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { SearchIcon } from "@/components/ui/Icons";
import { TableCard, Thead, Tr, Td } from "@/components/ui/Table";
import { fetchVendors } from "@/lib/hooks/useAdminVendors";

function toParam(v: string | string[] | undefined): string {
  return Array.isArray(v) ? (v[0] ?? "") : (v ?? "");
}

function statusLabel(status: string): string {
  return status
    .split("_")
    .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
    .join(" ");
}

export default async function VendorsPage(props: PageProps<"/vendors">) {
  const params = await props.searchParams;
  const search = toParam(params.search);
  const page = Math.max(1, Number(toParam(params.page)) || 1);

  let result: Awaited<ReturnType<typeof fetchVendors>> | null = null;
  let loadError: string | null = null;
  try {
    result = await fetchVendors({ page, search });
  } catch {
    loadError = "Couldn't load vendors. Please try again.";
  }

  return (
    <div>
      <PageHeader
        title="Vendors"
        subtitle="Manage your streaming partners and resellers."
        actions={<Button href="/vendors/create" variant="primary">+ Add Vendor</Button>}
      />

      <form method="get" className="mb-4 flex flex-wrap gap-2.5">
        <div className="flex min-w-[160px] flex-1 items-center gap-2 rounded-[9px] border border-[var(--color-border)] bg-white px-3.5 py-2.5">
          <SearchIcon size={15} color="#707070" />
          <input
            type="text"
            name="search"
            defaultValue={search}
            placeholder="Search vendors..."
            className="w-full bg-transparent text-[13px] text-[var(--color-text)] outline-none placeholder:text-[var(--color-text-faint)]"
          />
        </div>
        <button type="submit" className="rounded-[9px] border border-[var(--color-border)] bg-white px-4 py-2.5 text-[13px] font-semibold text-[var(--color-text)]">
          Search
        </button>
      </form>

      {loadError ? (
        <div className="rounded-[14px] border border-[var(--color-border)] bg-white p-8 text-center text-[13px] text-[var(--color-text-muted)]">
          {loadError}
        </div>
      ) : (
        <>
          <TableCard>
            <Thead columns={["VENDOR", "EMAIL", "STATUS", "CREATED", ""]} />
            <tbody>
              {result!.items.length === 0 ? (
                <tr>
                  <Td muted>{search ? "No vendors match your search." : "No vendors yet."}</Td>
                </tr>
              ) : (
                result!.items.map((v) => (
                  <Tr key={v.id}>
                    <Td>
                      <div className="font-bold text-[var(--color-text)]">{v.companyName}</div>
                      <div className="text-[11px] text-[var(--color-text-muted)]">{v.vendorCode}</div>
                    </Td>
                    <Td muted>{v.email ?? "–"}</Td>
                    <Td>
                      <StatusBadge status={statusLabel(v.status)} />
                    </Td>
                    <Td muted>{new Date(v.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</Td>
                    <Td>
                      <Link
                        href={`/vendors/${v.id}`}
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
                href={`/vendors?${new URLSearchParams({ ...(search ? { search } : {}), page: String(page - 1) })}`}
                className="rounded-[7px] border border-[var(--color-border)] bg-white px-3.5 py-1.5 text-xs font-semibold"
                aria-disabled={page <= 1}
                style={page <= 1 ? { pointerEvents: "none", opacity: 0.5 } : undefined}
              >
                ← Previous
              </Link>
              <span className="text-[var(--color-text-muted)]">
                Page {result!.page} of {result!.totalPages} · {result!.total} vendors
              </span>
              <Link
                href={`/vendors?${new URLSearchParams({ ...(search ? { search } : {}), page: String(page + 1) })}`}
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
