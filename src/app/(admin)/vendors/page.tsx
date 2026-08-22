import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { SearchIcon } from "@/components/ui/Icons";
import { TableCard, Thead, Tr, Td } from "@/components/ui/Table";
import { listVendors } from "@/lib/db";

export default async function VendorsPage() {
  const vendors = await listVendors();

  return (
    <div>
      <PageHeader
        title="Vendors"
        subtitle="Manage your streaming partners and resellers."
        actions={
          <>
            <Button variant="secondary">Export</Button>
            <Button href="/vendors/create" variant="primary">
              + Add Vendor
            </Button>
          </>
        }
      />

      <div className="mb-4 flex flex-wrap gap-2.5">
        <div className="flex min-w-[160px] flex-1 items-center gap-2 rounded-[9px] border border-[var(--color-border)] bg-white px-3.5 py-2.5">
          <SearchIcon size={15} color="#707070" />
          <span className="text-[13px] text-[var(--color-text-faint)]">
            Search vendors...
          </span>
        </div>
        <div className="rounded-[9px] border border-[var(--color-border)] bg-white px-4 py-2.5 text-[13px] text-[var(--color-text)]">
          Status
        </div>
        <div className="rounded-[9px] border border-[var(--color-border)] bg-white px-4 py-2.5 text-[13px] text-[var(--color-text)]">
          Plan
        </div>
        <div className="rounded-[9px] border border-[var(--color-border)] bg-white px-4 py-2.5 text-[13px] text-[var(--color-text)]">
          Date
        </div>
      </div>

      <TableCard>
        <Thead
          columns={[
            "VENDOR",
            "EMAIL",
            "EVENTS",
            "CUSTOMERS",
            "REVENUE",
            "WALLET",
            "STATUS",
            "CREATED",
            "",
          ]}
        />
        <tbody>
          {vendors.map((v) => (
            <Tr key={v.id}>
              <Td>
                <div className="font-bold text-[var(--color-text)]">
                  {v.name}
                </div>
                <div className="text-[11px] text-[var(--color-text-muted)]">
                  {v.company}
                </div>
              </Td>
              <Td muted>{v.email}</Td>
              <Td>{v.events}</Td>
              <Td>{v.customers}</Td>
              <Td strong>{v.revenue}</Td>
              <Td>{v.wallet}</Td>
              <Td>
                <StatusBadge status={v.status} />
              </Td>
              <Td muted>{v.created}</Td>
              <Td>
                <Link
                  href={`/vendors/${v.id}`}
                  className="rounded-[7px] border border-[var(--color-border)] bg-white px-3 py-1.5 text-xs font-semibold text-[var(--color-primary)]"
                >
                  View
                </Link>
              </Td>
            </Tr>
          ))}
        </tbody>
      </TableCard>
    </div>
  );
}
