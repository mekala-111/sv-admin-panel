import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { TableCard, Thead, Tr, Td } from "@/components/ui/Table";
import {
  CustomersIcon,
  EventsIcon,
  LiveIcon,
  RevenueIcon,
  VendorsIcon,
} from "@/components/ui/Icons";
import { fetchAdminOverview, fetchAdminAnalytics } from "@/lib/hooks/useAdminOverview";
import { fetchEvents } from "@/lib/hooks/useAdminEvents";
import { fetchEventsSummary } from "@/lib/hooks/useAdminReports";
import { fetchTopVendors } from "@/lib/hooks/useAdminReports";
import { getAdminUser } from "@/lib/auth";

const STATUS_COLORS: Record<string, string> = {
  UPCOMING: "#2563EB",
  LIVE: "#16A34A",
  COMPLETED: "#FF7A00",
  CANCELLED: "#DC2626",
  DRAFT: "#707070",
  EXPIRED: "#707070",
};

function statusLabel(status: string): string {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

export default async function DashboardPage() {
  const [user, overview, analytics, recentEvents, eventsSummary, topVendors] = await Promise.all([
    getAdminUser(),
    fetchAdminOverview().catch(() => null),
    fetchAdminAnalytics().catch(() => null),
    fetchEvents({ limit: 5 }).catch(() => ({ items: [], page: 1, totalPages: 1, total: 0 })),
    fetchEventsSummary().catch(() => []),
    fetchTopVendors().catch(() => []),
  ]);

  const total = eventsSummary.reduce((s, e) => s + e.count, 0) || 1;
  let acc = 0;
  const conicStops = eventsSummary
    .map((e) => {
      const from = (acc / total) * 100;
      acc += e.count;
      const to = (acc / total) * 100;
      return `${STATUS_COLORS[e.status] ?? "#707070"} ${from.toFixed(1)}% ${to.toFixed(1)}%`;
    })
    .join(", ");

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="mb-1 text-2xl font-extrabold text-[var(--color-text)]">
            Good evening, {user?.name ?? "Admin"} 👋
          </div>
          <div className="text-sm text-[var(--color-text-muted)]">
            Live platform overview from your SV Live backend.
          </div>
        </div>
      </div>

      {!overview ? (
        <Card className="mb-5 text-[var(--color-text-muted)]">
          Couldn&apos;t load dashboard data. Please try again.
        </Card>
      ) : (
        <>
          <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
            <StatCard
              icon={<VendorsIcon color="#FF7A00" size={18} />}
              iconBg="#FFF0E1"
              label="Total Vendors"
              value={overview.vendors}
            />
            <StatCard
              icon={<CustomersIcon color="#F52222" size={18} />}
              iconBg="#FDEAEA"
              label="Total Customers"
              value={overview.customers}
            />
            <StatCard
              icon={<EventsIcon color="#FFB000" size={18} />}
              iconBg="#FEF3E2"
              label="Total Events"
              value={overview.events}
            />
            <StatCard
              icon={<LiveIcon color="#DC2626" size={18} />}
              iconBg="#FDEAEA"
              label="Live Now"
              value={overview.liveEvents}
              trend={overview.liveEvents > 0 ? "🔴 LIVE" : "–"}
              trendTone="danger"
            />
            <StatCard
              icon={<CalendarClockIcon color="#2563EB" size={18} />}
              iconBg="#EAF0FE"
              label="Pending Vendors"
              value={overview.pendingVendors}
            />
            <StatCard
              icon={<RevenueIcon color="#8B5CF6" size={18} />}
              iconBg="#F3EEFB"
              label="Total Revenue"
              value={`₹${(analytics?.revenue ?? 0).toLocaleString("en-IN")}`}
            />
          </div>

          <div className="mb-5 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1fr]">
            <Card>
              <div className="mb-4 text-[15px] font-bold text-[var(--color-text)]">
                Events Overview
              </div>
              <div
                className="mx-auto mb-4 flex h-[150px] w-[150px] items-center justify-center rounded-full"
                style={{ background: eventsSummary.length ? `conic-gradient(${conicStops})` : "#F0EEEA" }}
              >
                <div className="flex h-24 w-24 flex-col items-center justify-center rounded-full bg-white">
                  <div className="text-lg font-extrabold text-[var(--color-text)]">
                    {overview.events}
                  </div>
                  <div className="text-[10px] text-[var(--color-text-muted)]">
                    Total Events
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2 text-xs">
                {eventsSummary.length === 0 ? (
                  <div className="text-[var(--color-text-muted)]">No events yet.</div>
                ) : (
                  eventsSummary.map((e) => (
                    <div key={e.status} className="flex items-center gap-2">
                      <span
                        className="h-2 w-2 rounded-sm"
                        style={{ background: STATUS_COLORS[e.status] ?? "#707070" }}
                      />
                      <span className="flex-1 text-[var(--color-text-muted)]">
                        {statusLabel(e.status)}
                      </span>
                      <span className="font-bold text-[var(--color-text)]">
                        {e.count.toLocaleString("en-IN")}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </Card>

            <Card className="flex flex-col">
              <div className="mb-3.5 flex items-center justify-between">
                <div className="text-[15px] font-bold text-[var(--color-text)]">
                  Top Vendors
                </div>
                <Link href="/vendors" className="text-xs font-semibold">
                  View All
                </Link>
              </div>
              <div className="flex flex-col gap-3 overflow-y-auto">
                {topVendors.length === 0 ? (
                  <div className="text-[13px] text-[var(--color-text-muted)]">No vendor activity yet.</div>
                ) : (
                  topVendors.slice(0, 6).map((v) => (
                    <div key={v.vendorId} className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-[13px] font-bold text-[var(--color-text)]">
                          {v.companyName ?? v.vendorId}
                        </div>
                      </div>
                      <div className="text-[13px] font-semibold text-[var(--color-text-muted)]">
                        {v.eventCount} events
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>

          <Card padded={false}>
            <div className="flex items-center justify-between p-5 pb-3.5">
              <div className="text-[15px] font-bold text-[var(--color-text)]">
                Recent Events
              </div>
              <Link href="/events" className="text-xs font-semibold">
                View All
              </Link>
            </div>
            <TableCard>
              <Thead columns={["EVENT", "LOCATION", "DATE", "STATUS", "PUBLISHED"]} />
              <tbody>
                {recentEvents.items.length === 0 ? (
                  <tr>
                    <Td muted>No events yet.</Td>
                  </tr>
                ) : (
                  recentEvents.items.map((e) => (
                    <Tr key={e.id}>
                      <Td strong>
                        <Link href={`/events/${e.id}`}>{e.eventName}</Link>
                      </Td>
                      <Td muted>{e.location ?? "–"}</Td>
                      <Td muted>
                        {e.eventDate ? new Date(e.eventDate).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "–"}
                      </Td>
                      <Td>
                        <StatusBadge status={statusLabel(e.status)} />
                      </Td>
                      <Td muted>{e.isPublished ? "Yes" : "No"}</Td>
                    </Tr>
                  ))
                )}
              </tbody>
            </TableCard>
          </Card>
        </>
      )}
    </div>
  );
}
