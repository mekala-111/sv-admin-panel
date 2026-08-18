import { notFound } from "next/navigation";
import { BackLink, Button } from "@/components/ui/Button";
import { Card, CardTitle } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { SlotImage } from "@/components/ui/SlotImage";
import { Tabs } from "@/components/ui/Tabs";
import { TableCard, Thead, Tr, Td, EmptyState } from "@/components/ui/Table";
import { getVendor, listEventsByVendor } from "@/lib/db";

const TABS = [
  "Overview",
  "Customers",
  "Events",
  "Revenue",
  "Wallet",
  "Branding",
  "Domain",
  "Transactions",
  "Activity",
];

export default async function VendorDetailPage({
  params,
  searchParams,
}: PageProps<"/vendors/[id]">) {
  const { id } = await params;
  const sp = await searchParams;
  const vendor = getVendor(Number(id));
  if (!vendor) notFound();

  const tabParam = Array.isArray(sp.tab) ? sp.tab[0] : sp.tab;
  const tab = TABS.includes(tabParam ?? "") ? (tabParam as string) : "Overview";
  const basePath = `/vendors/${id}`;

  return (
    <div>
      <BackLink href="/vendors" label="Back to Vendors" />
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3.5">
          <SlotImage
            slotId={vendor.logoId}
            label="logo"
            shape="rounded"
            radius={12}
            className="h-14 w-14"
          />
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-[22px] font-extrabold text-[var(--color-text)]">
                {vendor.name}
              </span>
              <StatusBadge status={vendor.status} />
            </div>
            <div className="mt-0.5 text-[13px] text-[var(--color-text-muted)]">
              {vendor.company} &middot; {vendor.email}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <Button variant="secondary">Edit</Button>
          <Button variant="danger">Suspend</Button>
          <Button variant="primary">Login as Vendor</Button>
        </div>
      </div>

      <Tabs basePath={basePath} options={TABS} current={tab} />

      {tab === "Overview" && (
        <>
          <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Card>
              <div className="mb-1.5 text-xs text-[var(--color-text-muted)]">
                Events
              </div>
              <div className="text-[22px] font-extrabold text-[var(--color-text)]">
                {vendor.events}
              </div>
            </Card>
            <Card>
              <div className="mb-1.5 text-xs text-[var(--color-text-muted)]">
                Customers
              </div>
              <div className="text-[22px] font-extrabold text-[var(--color-text)]">
                {vendor.customers}
              </div>
            </Card>
            <Card>
              <div className="mb-1.5 text-xs text-[var(--color-text-muted)]">
                Revenue
              </div>
              <div className="text-[22px] font-extrabold text-[var(--color-text)]">
                {vendor.revenue}
              </div>
            </Card>
            <Card>
              <div className="mb-1.5 text-xs text-[var(--color-text-muted)]">
                Wallet Balance
              </div>
              <div className="text-[22px] font-extrabold text-[var(--color-text)]">
                {vendor.wallet}
              </div>
            </Card>
          </div>
          <Card>
            <CardTitle>Vendor Information</CardTitle>
            <div className="grid grid-cols-1 gap-3.5 text-[13px] sm:grid-cols-2">
              <div>
                <span className="text-[var(--color-text-muted)]">
                  Company:{" "}
                </span>
                <span className="font-semibold text-[var(--color-text)]">
                  {vendor.company}
                </span>
              </div>
              <div>
                <span className="text-[var(--color-text-muted)]">
                  Email:{" "}
                </span>
                <span className="font-semibold text-[var(--color-text)]">
                  {vendor.email}
                </span>
              </div>
              <div>
                <span className="text-[var(--color-text-muted)]">
                  Created:{" "}
                </span>
                <span className="font-semibold text-[var(--color-text)]">
                  {vendor.created}
                </span>
              </div>
              <div>
                <span className="text-[var(--color-text-muted)]">
                  Status:{" "}
                </span>
                <span className="font-semibold text-[var(--color-text)]">
                  {vendor.status}
                </span>
              </div>
            </div>
          </Card>
        </>
      )}

      {tab === "Events" && (
        <TableCard>
          <Thead columns={["EVENT", "CUSTOMER", "DATE", "VIEWERS", "STATUS"]} />
          <tbody>
            {listEventsByVendor(vendor.name).map((ev) => (
              <Tr key={ev.id}>
                <Td strong>{ev.name}</Td>
                <Td muted>{ev.customer}</Td>
                <Td muted>{ev.date}</Td>
                <Td>{ev.viewers.toLocaleString("en-IN")}</Td>
                <Td>
                  <StatusBadge status={ev.status} />
                </Td>
              </Tr>
            ))}
          </tbody>
        </TableCard>
      )}

      {tab !== "Overview" && tab !== "Events" && (
        <EmptyState message="No data yet for this section." />
      )}
    </div>
  );
}
