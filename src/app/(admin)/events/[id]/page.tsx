import { notFound } from "next/navigation";
import { BackLink } from "@/components/ui/Button";
import { Card, CardTitle } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { SlotImage } from "@/components/ui/SlotImage";
import { Tabs } from "@/components/ui/Tabs";
import { EmptyState } from "@/components/ui/Table";
import { getEvent } from "@/lib/db";

const TABS = [
  "Overview",
  "Live Stream",
  "Viewers",
  "Recording",
  "Analytics",
  "Settings",
  "Activity",
];

export default async function EventDetailPage({
  params,
  searchParams,
}: PageProps<"/events/[id]">) {
  const { id } = await params;
  const sp = await searchParams;
  const event = await getEvent(id);
  if (!event) notFound();

  const tabParam = Array.isArray(sp.tab) ? sp.tab[0] : sp.tab;
  const tab = TABS.includes(tabParam ?? "") ? (tabParam as string) : "Overview";

  const stats = [
    { label: "Current Viewers", value: event.viewers.toLocaleString("en-IN") },
    { label: "Peak Viewers", value: event.peak.toLocaleString("en-IN") },
    { label: "Total Viewers", value: event.viewers.toLocaleString("en-IN") },
    { label: "Duration", value: event.duration },
    { label: "Bandwidth", value: "5.8 Mbps" },
    { label: "Storage", value: "18 GB" },
  ];

  return (
    <div>
      <BackLink href="/events" label="Back to Events" />
      <SlotImage
        slotId={event.heroId}
        label="Event banner"
        shape="rounded"
        radius={14}
        className="mb-4 h-[180px] w-full"
      />
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="text-2xl font-extrabold text-[var(--color-text)]">
          {event.name}
        </div>
        <StatusBadge status={event.status} />
      </div>

      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        {stats.map((s) => (
          <Card key={s.label}>
            <div className="mb-1.5 text-[11px] text-[var(--color-text-muted)]">
              {s.label}
            </div>
            <div className="text-lg font-extrabold text-[var(--color-text)]">
              {s.value}
            </div>
          </Card>
        ))}
      </div>

      <Tabs basePath={`/events/${id}`} options={TABS} current={tab} />

      {tab === "Overview" ? (
        <Card>
          <CardTitle>Event Information</CardTitle>
          <div className="grid grid-cols-1 gap-3.5 text-[13px] sm:grid-cols-2">
            <div>
              <span className="text-[var(--color-text-muted)]">
                Customer:{" "}
              </span>
              <span className="font-semibold text-[var(--color-text)]">
                {event.customer}
              </span>
            </div>
            <div>
              <span className="text-[var(--color-text-muted)]">
                Vendor:{" "}
              </span>
              <span className="font-semibold text-[var(--color-text)]">
                {event.vendor}
              </span>
            </div>
            <div>
              <span className="text-[var(--color-text-muted)]">
                Date:{" "}
              </span>
              <span className="font-semibold text-[var(--color-text)]">
                {event.date}
              </span>
            </div>
            <div>
              <span className="text-[var(--color-text-muted)]">
                Revenue:{" "}
              </span>
              <span className="font-semibold text-[var(--color-text)]">
                {event.revenue}
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
