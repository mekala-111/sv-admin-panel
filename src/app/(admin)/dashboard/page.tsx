import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { SlotImage } from "@/components/ui/SlotImage";
import { TableCard, Thead, Tr, Td } from "@/components/ui/Table";
import {
  ChevronDownIcon,
  CustomersIcon,
  EventsIcon,
  LiveIcon,
  RevenueIcon,
  CalendarClockIcon,
  VendorsIcon,
} from "@/components/ui/Icons";
import { listEvents, listLiveNow, listServers } from "@/lib/db";

export default function DashboardPage() {
  const events = listEvents();
  const liveNow = listLiveNow();
  const servers = listServers();
  const recentEvents = events.slice(0, 5);

  const eventBreakdown = [
    { label: "Upcoming", color: "#2563EB", value: 3215 },
    { label: "Live", color: "#16A34A", value: 18 },
    { label: "Completed", color: "#FF7A00", value: 8842 },
    { label: "Cancelled", color: "#DC2626", value: 363 },
  ];
  const total = eventBreakdown.reduce((s, e) => s + e.value, 0);
  let acc = 0;
  const conicStops = eventBreakdown
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
            Good evening, Admin 👋
          </div>
          <div className="text-sm text-[var(--color-text-muted)]">
            Here&apos;s what&apos;s happening across SV Live today.
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-[10px] border border-[var(--color-border)] bg-white px-4 py-2.5 text-[13px] font-semibold text-[var(--color-text)]">
          Today
          <ChevronDownIcon size={13} />
        </div>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        <StatCard
          icon={<VendorsIcon color="#FF7A00" size={18} />}
          iconBg="#FFF0E1"
          label="Total Vendors"
          value={248}
          trend="↑ 12.5% vs last week"
        />
        <StatCard
          icon={<CustomersIcon color="#F52222" size={18} />}
          iconBg="#FDEAEA"
          label="Total Customers"
          value="8,642"
          trend="↑ 18.2% vs last week"
        />
        <StatCard
          icon={<EventsIcon color="#FFB000" size={18} />}
          iconBg="#FEF3E2"
          label="Total Events"
          value="12,438"
          trend="↑ 14.7% vs last week"
        />
        <StatCard
          icon={<LiveIcon color="#DC2626" size={18} />}
          iconBg="#FDEAEA"
          label="Live Now"
          value={18}
          trend="🔴 LIVE"
          trendTone="danger"
        />
        <StatCard
          icon={<RevenueIcon color="#8B5CF6" size={18} />}
          iconBg="#F3EEFB"
          label="Monthly Revenue"
          value="₹18.42L"
          trend="↑ 21.4% vs last month"
        />
        <StatCard
          icon={<CalendarClockIcon color="#2563EB" size={18} />}
          iconBg="#EAF0FE"
          label="Streaming Hours"
          value="4,829 hrs"
          trend="↑ 16.8% vs last month"
        />
      </div>

      <div className="mb-5 grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_1fr_1fr]">
        <Card>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-[15px] font-bold text-[var(--color-text)]">
              Revenue Overview
            </div>
            <div className="flex flex-wrap gap-1.5">
              {["7 Days", "30 Days", "3 Months", "1 Year"].map((p) => (
                <span
                  key={p}
                  className="rounded-md px-3 py-1 text-xs font-semibold"
                  style={{
                    background: p === "30 Days" ? "var(--color-primary)" : "var(--color-bg)",
                    color: p === "30 Days" ? "#fff" : "var(--color-text-muted)",
                  }}
                >
                  {p}
                </span>
              ))}
            </div>
          </div>
          <svg viewBox="0 0 480 180" className="h-[170px] w-full">
            <defs>
              <linearGradient id="rg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FF7A00" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#FF7A00" stopOpacity={0} />
              </linearGradient>
            </defs>
            <path
              d="M0,120 L40,110 L80,130 L120,90 L160,100 L200,60 L240,85 L280,50 L320,70 L360,30 L400,55 L440,15 L480,35 L480,180 L0,180 Z"
              fill="url(#rg)"
            />
            <path
              d="M0,120 L40,110 L80,130 L120,90 L160,100 L200,60 L240,85 L280,50 L320,70 L360,30 L400,55 L440,15 L480,35"
              fill="none"
              stroke="#FF7A00"
              strokeWidth={2.5}
            />
          </svg>
          <div className="mt-1 flex justify-between text-[11px] text-[var(--color-text-faint)]">
            <span>Apr 25</span>
            <span>Apr 30</span>
            <span>May 05</span>
            <span>May 10</span>
            <span>May 15</span>
            <span>May 20</span>
            <span>May 24</span>
          </div>
        </Card>

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
                12,438
              </div>
              <div className="text-[10px] text-[var(--color-text-muted)]">
                Total Events
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2 text-xs">
            {eventBreakdown.map((e) => (
              <div key={e.label} className="flex items-center gap-2">
                <span
                  className="h-2 w-2 rounded-sm"
                  style={{ background: e.color }}
                />
                <span className="flex-1 text-[var(--color-text-muted)]">
                  {e.label}
                </span>
                <span className="font-bold text-[var(--color-text)]">
                  {e.value.toLocaleString("en-IN")}
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="flex flex-col">
          <div className="mb-3.5 flex items-center justify-between">
            <div className="text-[15px] font-bold text-[var(--color-text)]">
              Live Now
            </div>
            <Link href="/youtube" className="text-xs font-semibold">
              View All
            </Link>
          </div>
          <div className="mb-3 text-[13px] font-bold text-[var(--color-danger)]">
            18 Active Streams
          </div>
          <div className="flex flex-col gap-3 overflow-y-auto">
            {liveNow.map((item) => (
              <div key={item.imgId} className="flex items-center gap-2.5">
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
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_1fr]">
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
        </Card>

        <Card>
          <div className="mb-3.5 flex items-center justify-between">
            <div className="text-[15px] font-bold text-[var(--color-text)]">
              Server Status
            </div>
            <span className="text-xs font-semibold text-[var(--color-primary)]">
              View All
            </span>
          </div>
          <div className="flex flex-col gap-3.5">
            {servers.map((s) => (
              <div key={s.name}>
                <div className="mb-1 flex justify-between">
                  <div className="text-[13px] font-bold text-[var(--color-text)]">
                    {s.name} - {s.location}
                  </div>
                  <div className="text-[11px] font-semibold text-[var(--color-success)]">
                    {s.status}
                  </div>
                </div>
                <div className="flex gap-3.5 text-[11px] text-[var(--color-text-muted)]">
                  <span>CPU {s.cpu}%</span>
                  <span>RAM {s.ram}%</span>
                  <span>Network {s.network}%</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

