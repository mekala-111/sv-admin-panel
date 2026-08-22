import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { SlotImage } from "@/components/ui/SlotImage";
import { TableCard, Thead, Tr, Td, EmptyState } from "@/components/ui/Table";
import {
  CustomersIcon,
  EventsIcon,
  LiveIcon,
  RevenueIcon,
  VendorsIcon,
} from "@/components/ui/Icons";
import {
  getAdminOverview,
  getAnalyticsBreakdown,
  getRevenueSummary,
  listEvents,
  listLiveNow,
  getSessionUser,
} from "@/lib/db";

const STATUS_COLORS: Record<string, string> = {
  UPCOMING: "#2563EB",
  LIVE: "#16A34A",
  COMPLETED: "#FF7A00",
  CANCELLED: "#DC2626",
  DRAFT: "#707070",
  EXPIRED: "#707070",
};

export default async function DashboardPage() {
  const [events, liveNow, overview, breakdown, revenue, user] = await Promise.all([
    listEvents(),
    listLiveNow(),
    getAdminOverview(),
    getAnalyticsBreakdown("Platform"),
    getRevenueSummary(),
    getSessionUser(),
  ]);
  const recentEvents = events.slice(0, 5);

  const eventBreakdown = breakdown.length
    ? breakdown.map((b) => ({
        label: b.label,
        color: STATUS_COLORS[b.label] ?? "#707070",
        value: b.value,
      }))
    : [];
  const total = eventBreakdown.reduce((s, e) => s + e.value, 0) || 1;
  let acc = 0;
  const conicStops =
    eventBreakdown.length === 0
      ? "#E5E5E5 0% 100%"
      : eventBreakdown
          .map((e) => {
            const from = (acc / total) * 100;
            acc += e.value;
            const to = (acc / total) * 100;
            return `${e.color} ${from.toFixed(1)}% ${to.toFixed(1)}%`;
          })
          .join(", ");

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="mb-1 text-2xl font-extrabold text-[var(--color-text)]">
            Welcome{user?.name ? `, ${user.name}` : ""}
          </div>
          <div className="text-sm text-[var(--color-text-muted)]">
            Live platform overview from your SV Live backend.
          </div>
        </div>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
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
          value={overview.customers.toLocaleString("en-IN")}
        />
        <StatCard
          icon={<EventsIcon color="#FFB000" size={18} />}
          iconBg="#FEF3E2"
          label="Total Events"
          value={overview.events.toLocaleString("en-IN")}
        />
        <StatCard
          icon={<LiveIcon color="#DC2626" size={18} />}
          iconBg="#FDEAEA"
          label="Live Now"
          value={overview.liveEvents}
          trend={overview.liveEvents > 0 ? "LIVE" : undefined}
          trendTone="danger"
        />
        <StatCard
          icon={<RevenueIcon color="#8B5CF6" size={18} />}
          iconBg="#F3EEFB"
          label="Total Revenue"
          value={revenue.totalRevenue}
        />
      </div>

      <div className="mb-5 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1fr]">
        <Card>
          <div className="mb-4 text-[15px] font-bold text-[var(--color-text)]">
            Events Overview
          </div>
          <div
            className="mx-auto mb-4 flex h-[150px] w-[150px] items-center justify-center rounded-full"
            style={{ background: `conic-gradient(${conicStops})` }}
          >
            <div className="flex h-24 w-24 flex-col items-center justify-center rounded-full bg-white">
              <div className="text-lg font-extrabold text-[var(--color-text)]">
                {overview.events.toLocaleString("en-IN")}
              </div>
              <div className="text-[10px] text-[var(--color-text-muted)]">Total Events</div>
            </div>
          </div>
          <div className="flex flex-col gap-2 text-xs">
            {eventBreakdown.length === 0 ? (
              <div className="text-[var(--color-text-muted)]">No event data yet.</div>
            ) : (
              eventBreakdown.map((e) => (
                <div key={e.label} className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-sm" style={{ background: e.color }} />
                  <span className="flex-1 text-[var(--color-text-muted)]">{e.label}</span>
                  <span className="font-bold text-[var(--color-text)]">
                    {e.value.toLocaleString("en-IN")}
                  </span>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card className="flex flex-col">
          <div className="mb-3.5 flex items-center justify-between">
            <div className="text-[15px] font-bold text-[var(--color-text)]">Live Now</div>
            <Link href="/events" className="text-xs font-semibold">
              View All
            </Link>
          </div>
          <div className="mb-3 text-[13px] font-bold text-[var(--color-danger)]">
            {liveNow.length} Active Stream{liveNow.length === 1 ? "" : "s"}
          </div>
          <div className="flex flex-col gap-3 overflow-y-auto">
            {liveNow.length === 0 ? (
              <div className="text-[13px] text-[var(--color-text-muted)]">No live events.</div>
            ) : (
              liveNow.map((item) => (
                <div key={`${item.name}-${item.vendor}`} className="flex items-center gap-2.5">
                  <SlotImage
                    slotId={item.imgId}
                    label="thumb"
                    shape="rounded"
                    radius={8}
                    className="h-[38px] w-[52px] shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[13px] font-bold text-[var(--color-text)]">
                      {item.name}
                    </div>
                    <div className="text-[11px] text-[var(--color-text-muted)]">
                      {item.vendor} &middot; {item.viewers} viewers
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      <Card padded={false}>
        <div className="flex items-center justify-between p-5 pb-3.5">
          <div className="text-[15px] font-bold text-[var(--color-text)]">Recent Events</div>
          <Link href="/events" className="text-xs font-semibold">
            View All
          </Link>
        </div>
        {recentEvents.length === 0 ? (
          <EmptyState message="No events yet." />
        ) : (
          <TableCard>
            <Thead columns={["EVENT", "VENDOR", "DATE", "VIEWERS", "STATUS"]} />
            <tbody>
              {recentEvents.map((e) => (
                <Tr key={e.id}>
                  <Td strong>
                    <Link href={`/events/${e.id}`}>{e.name}</Link>
                  </Td>
                  <Td muted>{e.vendor}</Td>
                  <Td muted>{e.date}</Td>
                  <Td muted>{e.viewers.toLocaleString("en-IN")}</Td>
                  <Td>
                    <StatusBadge status={e.status} />
                  </Td>
                </Tr>
              ))}
            </tbody>
          </TableCard>
        )}
      </Card>
    </div>
  );
}
