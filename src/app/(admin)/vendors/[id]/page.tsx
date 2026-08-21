import { notFound } from "next/navigation";
import { BackLink, Button } from "@/components/ui/Button";
import { Card, CardTitle } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Tabs } from "@/components/ui/Tabs";
import { TableCard, Thead, Tr, Td, EmptyState } from "@/components/ui/Table";
import { fetchVendorDetail } from "@/lib/hooks/useAdminVendors";
import { fetchCustomersByVendor } from "@/lib/hooks/useAdminCustomers";
import { fetchEventsByVendor } from "@/lib/hooks/useAdminEvents";
import { fetchPaymentsByVendor } from "@/lib/hooks/useAdminPayments";
import { fetchVendorWallet, fetchVendorWalletTransactions } from "@/lib/hooks/useAdminWallet";
import { fetchAuditLogs } from "@/lib/hooks/useAdminAuditLogs";
import { setVendorStatusAction } from "@/lib/vendors";
import { creditWalletAction } from "@/lib/payments";

const TABS = ["Overview", "Customers", "Events", "Revenue", "Wallet", "Branding", "Activity"];

function toParam(v: string | string[] | undefined): string {
  return Array.isArray(v) ? (v[0] ?? "") : (v ?? "");
}

function statusLabel(status: string): string {
  return status
    .split("_")
    .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
    .join(" ");
}

export default async function VendorDetailPage({
  params,
  searchParams,
}: PageProps<"/vendors/[id]">) {
  const { id } = await params;
  const sp = await searchParams;
  const vendor = await fetchVendorDetail(id);
  if (!vendor) notFound();

  const tabParam = Array.isArray(sp.tab) ? sp.tab[0] : sp.tab;
  const tab = TABS.includes(tabParam ?? "") ? (tabParam as string) : "Overview";
  const basePath = `/vendors/${id}`;
  const error = toParam(sp.error);

  const isActive = vendor.status === "ACTIVE";

  return (
    <div>
      <BackLink href="/vendors" label="Back to Vendors" />
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-[22px] font-extrabold text-[var(--color-text)]">
              {vendor.companyName}
            </span>
            <StatusBadge status={statusLabel(vendor.status)} />
          </div>
          <div className="mt-0.5 text-[13px] text-[var(--color-text-muted)]">
            {vendor.vendorCode} &middot; {vendor.email}
          </div>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <Button href={`/vendors/${id}/edit`} variant="secondary">Edit</Button>
          <form action={setVendorStatusAction.bind(null, id, isActive ? "SUSPENDED" : "ACTIVE")}>
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
      </div>

      {error ? (
        <p className="mb-4 text-xs font-semibold text-[var(--color-danger)]" role="alert">
          {error}
        </p>
      ) : null}

      <Tabs basePath={basePath} options={TABS} current={tab} />

      {tab === "Overview" && (
        <Card>
          <CardTitle>Vendor Information</CardTitle>
          <div className="grid grid-cols-1 gap-3.5 text-[13px] sm:grid-cols-2">
            <div>
              <span className="text-[var(--color-text-muted)]">Company: </span>
              <span className="font-semibold text-[var(--color-text)]">{vendor.companyName}</span>
            </div>
            <div>
              <span className="text-[var(--color-text-muted)]">Email: </span>
              <span className="font-semibold text-[var(--color-text)]">{vendor.email ?? "–"}</span>
            </div>
            <div>
              <span className="text-[var(--color-text-muted)]">Phone: </span>
              <span className="font-semibold text-[var(--color-text)]">{vendor.phone ?? "–"}</span>
            </div>
            <div>
              <span className="text-[var(--color-text-muted)]">Address: </span>
              <span className="font-semibold text-[var(--color-text)]">{vendor.address ?? "–"}</span>
            </div>
            <div>
              <span className="text-[var(--color-text-muted)]">WhatsApp: </span>
              <span className="font-semibold text-[var(--color-text)]">
                {vendor.whatsappNumber ?? "–"} {vendor.whatsappEnabled ? "(enabled)" : ""}
              </span>
            </div>
            <div>
              <span className="text-[var(--color-text-muted)]">Event Creation Fee: </span>
              <span className="font-semibold text-[var(--color-text)]">₹{vendor.eventCreationFee}</span>
            </div>
            <div>
              <span className="text-[var(--color-text-muted)]">Created: </span>
              <span className="font-semibold text-[var(--color-text)]">
                {new Date(vendor.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </span>
            </div>
            <div>
              <span className="text-[var(--color-text-muted)]">Status: </span>
              <span className="font-semibold text-[var(--color-text)]">{statusLabel(vendor.status)}</span>
            </div>
          </div>
        </Card>
      )}

      {tab === "Customers" && <CustomersTab vendorId={id} />}
      {tab === "Events" && <EventsTab vendorId={id} />}
      {tab === "Revenue" && <RevenueTab vendorId={id} />}
      {tab === "Wallet" && <WalletTab vendorId={id} error={error} />}
      {tab === "Branding" && <BrandingTab branding={vendor.branding} />}
      {tab === "Activity" && <ActivityTab userId={vendor.userId} />}
    </div>
  );
}

async function CustomersTab({ vendorId }: { vendorId: string }) {
  const customers = await fetchCustomersByVendor(vendorId).catch(() => []);
  if (customers.length === 0) return <EmptyState message="No customers for this vendor yet." />;
  return (
    <TableCard>
      <Thead columns={["CUSTOMER", "EMAIL", "EVENTS", "STATUS", "JOINED"]} />
      <tbody>
        {customers.map((c) => (
          <Tr key={c.id}>
            <Td strong>{c.name}</Td>
            <Td muted>{c.email ?? "–"}</Td>
            <Td>{c.eventsCount}</Td>
            <Td>
              <StatusBadge status={statusLabel(c.status)} />
            </Td>
            <Td muted>{new Date(c.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}</Td>
          </Tr>
        ))}
      </tbody>
    </TableCard>
  );
}

async function EventsTab({ vendorId }: { vendorId: string }) {
  const events = await fetchEventsByVendor(vendorId).catch(() => []);
  if (events.length === 0) return <EmptyState message="No events for this vendor yet." />;
  return (
    <TableCard>
      <Thead columns={["EVENT", "LOCATION", "DATE", "STATUS"]} />
      <tbody>
        {events.map((ev) => (
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

async function RevenueTab({ vendorId }: { vendorId: string }) {
  const payments = await fetchPaymentsByVendor(vendorId).catch(() => []);
  const successTotal = payments.filter((p) => p.status === "SUCCESS").reduce((s, p) => s + p.amount, 0);
  if (payments.length === 0) return <EmptyState message="No payments for this vendor yet." />;
  return (
    <>
      <Card className="mb-4">
        <div className="mb-1.5 text-xs text-[var(--color-text-muted)]">Total Successful Revenue</div>
        <div className="text-[22px] font-extrabold text-[var(--color-text)]">₹{successTotal.toLocaleString("en-IN")}</div>
      </Card>
      <TableCard>
        <Thead columns={["PURPOSE", "AMOUNT", "STATUS", "DATE"]} />
        <tbody>
          {payments.map((p) => (
            <Tr key={p.id}>
              <Td strong>{p.purpose === "EVENT_CREATION" ? "Event Creation" : "Customer"}</Td>
              <Td>₹{p.amount.toLocaleString("en-IN")}</Td>
              <Td>
                <StatusBadge status={statusLabel(p.status)} />
              </Td>
              <Td muted>{new Date(p.paidAt ?? p.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</Td>
            </Tr>
          ))}
        </tbody>
      </TableCard>
    </>
  );
}

async function WalletTab({ vendorId, error }: { vendorId: string; error?: string }) {
  let wallet: Awaited<ReturnType<typeof fetchVendorWallet>> | null = null;
  let transactions: Awaited<ReturnType<typeof fetchVendorWalletTransactions>> | null = null;
  try {
    [wallet, transactions] = await Promise.all([
      fetchVendorWallet(vendorId),
      fetchVendorWalletTransactions(vendorId, { limit: 20 }),
    ]);
  } catch {
    return <EmptyState message="Couldn't load wallet data." />;
  }

  return (
    <>
      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card>
          <div className="mb-1.5 text-xs text-[var(--color-text-muted)]">Wallet Balance</div>
          <div className="text-[22px] font-extrabold text-[var(--color-text)]">
            ₹{wallet.balance.toLocaleString("en-IN")}
          </div>
        </Card>
        <Card>
          <CardTitle>Credit Wallet</CardTitle>
          <form action={creditWalletAction.bind(null, vendorId)} className="flex flex-wrap items-end gap-2.5">
            <div className="flex-1 min-w-[120px]">
              <label htmlFor="amount" className="mb-1.5 block text-xs font-semibold text-[var(--color-text-muted)]">
                Amount (₹)
              </label>
              <input
                id="amount"
                name="amount"
                type="number"
                min={1}
                step="0.01"
                required
                className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2.5 text-[13px] outline-none focus:border-[var(--color-primary)]"
              />
            </div>
            <div className="flex-1 min-w-[120px]">
              <label htmlFor="description" className="mb-1.5 block text-xs font-semibold text-[var(--color-text-muted)]">
                Reason (optional)
              </label>
              <input
                id="description"
                name="description"
                className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2.5 text-[13px] outline-none focus:border-[var(--color-primary)]"
              />
            </div>
            <button type="submit" className="rounded-[9px] bg-[var(--color-primary)] px-4 py-2.5 text-[13px] font-bold text-white">
              Credit
            </button>
          </form>
        </Card>
      </div>

      {error ? (
        <p className="mb-4 text-xs font-semibold text-[var(--color-danger)]" role="alert">
          {error}
        </p>
      ) : null}

      {transactions.items.length === 0 ? (
        <EmptyState message="No transactions yet." />
      ) : (
        <TableCard>
          <Thead columns={["TYPE", "AMOUNT", "DESCRIPTION", "DATE"]} />
          <tbody>
            {transactions.items.map((tx) => (
              <Tr key={tx.id}>
                <Td strong>{statusLabel(tx.type)}</Td>
                <Td>
                  <span style={{ color: tx.type === "CREDIT" || tx.type === "REFUND" ? "#16A34A" : "#DC2626", fontWeight: 700 }}>
                    {tx.type === "CREDIT" || tx.type === "REFUND" ? "+" : "-"}₹{Math.abs(tx.amount).toLocaleString("en-IN")}
                  </span>
                </Td>
                <Td muted>{tx.description ?? tx.referenceType ?? "–"}</Td>
                <Td muted>{new Date(tx.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</Td>
              </Tr>
            ))}
          </tbody>
        </TableCard>
      )}
    </>
  );
}

function BrandingTab({ branding }: { branding: { primaryColor?: string; secondaryColor?: string; accentColor?: string; logo?: string; favicon?: string; customDomain?: string; supportEmail?: string } }) {
  const entries: [string, string | undefined][] = [
    ["Primary Color", branding.primaryColor],
    ["Secondary Color", branding.secondaryColor],
    ["Accent Color", branding.accentColor],
    ["Logo URL", branding.logo],
    ["Favicon URL", branding.favicon],
    ["Custom Domain", branding.customDomain],
    ["Support Email", branding.supportEmail],
  ];
  return (
    <Card>
      <CardTitle>Branding (read-only — set by the vendor)</CardTitle>
      <div className="grid grid-cols-1 gap-3.5 text-[13px] sm:grid-cols-2">
        {entries.map(([label, value]) => (
          <div key={label}>
            <span className="text-[var(--color-text-muted)]">{label}: </span>
            <span className="font-semibold text-[var(--color-text)]">{value ?? "–"}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

async function ActivityTab({ userId }: { userId: string }) {
  const { items } = await fetchAuditLogs({ userId }).catch(() => ({ items: [], page: 1, totalPages: 1, total: 0 }));
  if (items.length === 0) return <EmptyState message="No recorded activity for this vendor yet." />;
  return (
    <TableCard>
      <Thead columns={["ACTION", "MODULE", "DATE"]} />
      <tbody>
        {items.map((l) => (
          <Tr key={l.id}>
            <Td strong>{l.action}</Td>
            <Td muted>{l.module}</Td>
            <Td muted>{new Date(l.createdAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</Td>
          </Tr>
        ))}
      </tbody>
    </TableCard>
  );
}
