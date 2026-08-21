import { notFound } from "next/navigation";
import { BackLink } from "@/components/ui/Button";
import { Card, CardTitle } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Tabs } from "@/components/ui/Tabs";
import { TableCard, Thead, Tr, Td, EmptyState } from "@/components/ui/Table";
import { fetchCustomerDetail } from "@/lib/hooks/useAdminCustomers";
import { fetchVendorNameMap } from "@/lib/hooks/useNameMaps";
import { fetchEvents } from "@/lib/hooks/useAdminEvents";
import { fetchPayments } from "@/lib/hooks/useAdminPayments";
import { setCustomerStatusAction } from "@/lib/customers";

const TABS = ["Overview", "Events", "Payments"];

function statusLabel(status: string): string {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

export default async function CustomerDetailPage({
  params,
  searchParams,
}: PageProps<"/customers/[id]">) {
  const { id } = await params;
  const sp = await searchParams;
  const customer = await fetchCustomerDetail(id);
  if (!customer) notFound();

  const tabParam = Array.isArray(sp.tab) ? sp.tab[0] : sp.tab;
  const tab = TABS.includes(tabParam ?? "") ? (tabParam as string) : "Overview";

  const vendorNames = await fetchVendorNameMap().catch(() => new Map<string, string>());
  const vendorName = vendorNames.get(customer.vendorId) ?? "–";

  const isActive = customer.status === "ACTIVE";

  return (
    <div>
      <BackLink href="/customers" label="Back to Customers" />
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-[22px] font-extrabold text-[var(--color-text)]">{customer.name}</span>
            <StatusBadge status={statusLabel(customer.status)} />
          </div>
          <div className="mt-0.5 text-[13px] text-[var(--color-text-muted)]">
            Vendor: {vendorName} &middot; Joined {new Date(customer.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
          </div>
        </div>
        <form action={setCustomerStatusAction.bind(null, customer.id, isActive ? "SUSPENDED" : "ACTIVE")}>
          <button
            type="submit"
            className={`rounded-[9px] border px-4 py-2.5 text-[13px] font-semibold ${
              isActive
                ? "border-[var(--color-border)] bg-white text-[var(--color-danger)]"
                : "border-none bg-[var(--color-primary)] text-white"
            }`}
          >
            {isActive ? "Suspend" : "Activate"}
          </button>
        </form>
      </div>

      <Tabs basePath={`/customers/${id}`} options={TABS} current={tab} />

      {tab === "Overview" && (
        <Card>
          <CardTitle>Customer Information</CardTitle>
          <div className="grid grid-cols-1 gap-3.5 text-[13px] sm:grid-cols-2">
            <div>
              <span className="text-[var(--color-text-muted)]">Vendor: </span>
              <span className="font-semibold text-[var(--color-text)]">{vendorName}</span>
            </div>
            <div>
              <span className="text-[var(--color-text-muted)]">Email: </span>
              <span className="font-semibold text-[var(--color-text)]">{customer.email ?? "–"}</span>
            </div>
            <div>
              <span className="text-[var(--color-text-muted)]">Phone: </span>
              <span className="font-semibold text-[var(--color-text)]">{customer.phone ?? "–"}</span>
            </div>
            <div>
              <span className="text-[var(--color-text-muted)]">Customer Code: </span>
              <span className="font-semibold text-[var(--color-text)]">{customer.customerCode}</span>
            </div>
            <div>
              <span className="text-[var(--color-text-muted)]">Status: </span>
              <span className="font-semibold text-[var(--color-text)]">{statusLabel(customer.status)}</span>
            </div>
            <div>
              <span className="text-[var(--color-text-muted)]">Joined: </span>
              <span className="font-semibold text-[var(--color-text)]">
                {new Date(customer.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </span>
            </div>
          </div>
        </Card>
      )}

      {tab === "Events" && <EventsTab customerId={id} />}
      {tab === "Payments" && <PaymentsTab customerId={id} />}
    </div>
  );
}

async function EventsTab({ customerId }: { customerId: string }) {
  const { items } = await fetchEvents({ customerId, limit: 100 }).catch(() => ({ items: [], page: 1, totalPages: 1, total: 0 }));
  if (items.length === 0) return <EmptyState message="No events yet." />;
  return (
    <TableCard>
      <Thead columns={["EVENT", "LOCATION", "DATE", "STATUS"]} />
      <tbody>
        {items.map((ev) => (
          <Tr key={ev.id}>
            <Td strong>{ev.eventName}</Td>
            <Td muted>{ev.location ?? "–"}</Td>
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

async function PaymentsTab({ customerId }: { customerId: string }) {
  const payments = await fetchPayments({ customerId }).catch(() => []);
  if (payments.length === 0) return <EmptyState message="No payments yet." />;
  return (
    <TableCard>
      <Thead columns={["AMOUNT", "STATUS", "DATE"]} />
      <tbody>
        {payments.map((p) => (
          <Tr key={p.id}>
            <Td strong>₹{p.amount.toLocaleString("en-IN")}</Td>
            <Td>
              <StatusBadge status={statusLabel(p.status)} />
            </Td>
            <Td muted>{new Date(p.paidAt ?? p.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</Td>
          </Tr>
        ))}
      </tbody>
    </TableCard>
  );
}
