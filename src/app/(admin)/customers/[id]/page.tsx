import { notFound } from "next/navigation";
import { BackLink } from "@/components/ui/Button";
import { Card, CardTitle } from "@/components/ui/Card";
import { SlotImage } from "@/components/ui/SlotImage";
import { Tabs } from "@/components/ui/Tabs";
import { EmptyState } from "@/components/ui/Table";
import { getCustomer } from "@/lib/db";

const TABS = ["Overview", "Events", "Payments", "Wallet", "Activity"];

export default async function CustomerDetailPage({
  params,
  searchParams,
}: PageProps<"/customers/[id]">) {
  const { id } = await params;
  const sp = await searchParams;
  const customer = await getCustomer(id);
  if (!customer) notFound();

  const tabParam = Array.isArray(sp.tab) ? sp.tab[0] : sp.tab;
  const tab = TABS.includes(tabParam ?? "") ? (tabParam as string) : "Overview";

  return (
    <div>
      <BackLink href="/customers" label="Back to Customers" />
      <div className="mb-5 flex items-center gap-3.5">
        <SlotImage
          slotId={customer.avatarId}
          label="photo"
          shape="circle"
          className="h-14 w-14"
        />
        <div>
          <div className="text-[22px] font-extrabold text-[var(--color-text)]">
            {customer.name}
          </div>
          <div className="text-[13px] text-[var(--color-text-muted)]">
            Vendor: {customer.vendor} &middot; Joined {customer.joined}
          </div>
        </div>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-2">
        <Card>
          <div className="mb-1.5 text-xs text-[var(--color-text-muted)]">
            Total Events
          </div>
          <div className="text-xl font-extrabold text-[var(--color-text)]">
            {customer.events}
          </div>
        </Card>
        <Card>
          <div className="mb-1.5 text-xs text-[var(--color-text-muted)]">
            Total Spending
          </div>
          <div className="text-xl font-extrabold text-[var(--color-text)]">
            {customer.spending}
          </div>
        </Card>
      </div>

      <Tabs basePath={`/customers/${id}`} options={TABS} current={tab} />

      {tab === "Overview" ? (
        <Card>
          <CardTitle>Customer Information</CardTitle>
          <div className="grid grid-cols-1 gap-3.5 text-[13px] sm:grid-cols-2">
            <div>
              <span className="text-[var(--color-text-muted)]">
                Vendor:{" "}
              </span>
              <span className="font-semibold text-[var(--color-text)]">
                {customer.vendor}
              </span>
            </div>
            <div>
              <span className="text-[var(--color-text-muted)]">
                Status:{" "}
              </span>
              <span className="font-semibold text-[var(--color-text)]">
                {customer.status}
              </span>
            </div>
            <div>
              <span className="text-[var(--color-text-muted)]">
                Last Event:{" "}
              </span>
              <span className="font-semibold text-[var(--color-text)]">
                {customer.lastEvent}
              </span>
            </div>
            <div>
              <span className="text-[var(--color-text-muted)]">
                Joined:{" "}
              </span>
              <span className="font-semibold text-[var(--color-text)]">
                {customer.joined}
              </span>
            </div>
          </div>
        </Card>
      ) : (
        <EmptyState message="No data yet for this section." />
      )}
    </div>
  );
}
