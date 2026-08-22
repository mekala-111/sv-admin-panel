import { notFound } from "next/navigation";
import { BackLink, Button } from "@/components/ui/Button";
import { Card, CardTitle } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { SlotImage } from "@/components/ui/SlotImage";
import { Tabs } from "@/components/ui/Tabs";
import { TableCard, Thead, Tr, Td, EmptyState } from "@/components/ui/Table";
import { getVendor, listEventsByVendor } from "@/lib/db";
import { activateVendorAction, suspendVendorAction } from "@/lib/actions";

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
  const vendor = await getVendor(id);
  if (!vendor) notFound();

  const tabParam = Array.isArray(sp.tab) ? sp.tab[0] : sp.tab;
  const tab = TABS.includes(tabParam ?? "") ? (tabParam as string) : "Overview";
  const basePath = `/vendors/${id}`;
  const vendorEvents = tab === "Events" ? await listEventsByVendor(vendor.name) : [];
  const isSuspended = vendor.status === "Suspended";

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
          <Button variant="secondary" href={`/vendors/${id}/edit`}>
            Edit
          </Button>
          {isSuspended ? (
            <form action={activateVendorAction}>
              <input type="hidden" name="id" value={String(vendor.id)} />
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-[9px] border-none bg-[var(--color-primary)] px-4 py-2.5 text-[13px] font-bold text-white"
              >
                Activate
              </button>
            </form>
          ) : (
            <form action={suspendVendorAction}>
              <input type="hidden" name="id" value={String(vendor.id)} />
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-[9px] border border-[var(--color-border)] bg-white px-4 py-2.5 text-[13px] font-semibold text-[var(--color-danger)]"
              >
                Suspend
              </button>
            </form>
          )}
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
          <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Card>
              <div className="mb-1.5 text-xs text-[var(--color-text-muted)]">
                Live event creation fee
              </div>
              <div className="text-[22px] font-extrabold text-[var(--color-text)]">
                ₹{Number(vendor.liveEventCreationFee ?? vendor.eventCreationFee ?? 0).toLocaleString("en-IN")}
              </div>
              <div className="mt-1 text-[12px] text-[var(--color-text-muted)]">
                Charged when this vendor creates a live event
              </div>
            </Card>
            <Card>
              <div className="mb-1.5 text-xs text-[var(--color-text-muted)]">
                Invitation creation fee
              </div>
              <div className="text-[22px] font-extrabold text-[var(--color-text)]">
                ₹{Number(vendor.invitationCreationFee ?? vendor.eventCreationFee ?? 0).toLocaleString("en-IN")}
              </div>
              <div className="mt-1 text-[12px] text-[var(--color-text-muted)]">
                Charged when this vendor creates an invitation
              </div>
            </Card>
          </div>
          <Card>
            <CardTitle>Vendor Information</CardTitle>
            <div className="grid grid-cols-1 gap-3.5 text-[13px] sm:grid-cols-2">
              <div>
                <span className="text-[var(--color-text-muted)]">Company: </span>
                <span className="font-semibold text-[var(--color-text)]">
                  {vendor.company}
                </span>
              </div>
              <div>
                <span className="text-[var(--color-text-muted)]">Email: </span>
                <span className="font-semibold text-[var(--color-text)]">
                  {vendor.email}
                </span>
              </div>
              <div>
                <span className="text-[var(--color-text-muted)]">Phone: </span>
                <span className="font-semibold text-[var(--color-text)]">
                  {vendor.phone || "—"}
                </span>
              </div>
              <div>
                <span className="text-[var(--color-text-muted)]">Address: </span>
                <span className="font-semibold text-[var(--color-text)]">
                  {vendor.address || "—"}
                </span>
              </div>
              <div>
                <span className="text-[var(--color-text-muted)]">Created: </span>
                <span className="font-semibold text-[var(--color-text)]">
                  {vendor.created}
                </span>
              </div>
              <div>
                <span className="text-[var(--color-text-muted)]">Status: </span>
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
            {vendorEvents.map((ev) => (
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
