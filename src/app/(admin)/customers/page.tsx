import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { TableCard, Thead, Tr, Td } from "@/components/ui/Table";
import { listCustomers } from "@/lib/db";

export default async function CustomersPage() {
  const customers = await listCustomers();

  return (
    <div>
      <PageHeader title="Customers" />
      <TableCard>
        <Thead
          columns={[
            "CUSTOMER",
            "VENDOR",
            "EVENTS",
            "SPENDING",
            "LAST EVENT",
            "STATUS",
            "JOINED",
            "",
          ]}
        />
        <tbody>
          {customers.map((c) => (
            <Tr key={c.id}>
              <Td strong>{c.name}</Td>
              <Td muted>{c.vendor}</Td>
              <Td>{c.events}</Td>
              <Td strong>{c.spending}</Td>
              <Td muted>{c.lastEvent}</Td>
              <Td>
                <StatusBadge status={c.status} />
              </Td>
              <Td muted>{c.joined}</Td>
              <Td>
                <Link
                  href={`/customers/${c.id}`}
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
