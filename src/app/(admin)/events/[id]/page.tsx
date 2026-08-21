import { notFound } from "next/navigation";
import { BackLink, Button } from "@/components/ui/Button";
import { Card, CardTitle } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Tabs } from "@/components/ui/Tabs";
import { EmptyState } from "@/components/ui/Table";
import { fetchEventDetail } from "@/lib/hooks/useAdminEvents";
import { fetchVendorNameMap, fetchCustomerNameMap } from "@/lib/hooks/useNameMaps";
import { fetchRecordings, formatBytes } from "@/lib/hooks/useAdminRecordings";
import { publishEventAction, unpublishEventAction, cancelEventAction } from "@/lib/events";

const TABS = ["Overview", "Live Stream", "Recording", "Settings"];

function toParam(v: string | string[] | undefined): string {
  return Array.isArray(v) ? (v[0] ?? "") : (v ?? "");
}

function statusLabel(status: string): string {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

export default async function EventDetailPage({
  params,
  searchParams,
}: PageProps<"/events/[id]">) {
  const { id } = await params;
  const sp = await searchParams;
  const event = await fetchEventDetail(id);
  if (!event) notFound();

  const tabParam = Array.isArray(sp.tab) ? sp.tab[0] : sp.tab;
  const tab = TABS.includes(tabParam ?? "") ? (tabParam as string) : "Overview";
  const error = toParam(sp.error);

  const [vendorNames, customerNames] = await Promise.all([
    fetchVendorNameMap().catch(() => new Map<string, string>()),
    fetchCustomerNameMap().catch(() => new Map<string, string>()),
  ]);

  return (
    <div>
      <BackLink href="/events" label="Back to Events" />
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="text-2xl font-extrabold text-[var(--color-text)]">{event.eventName}</div>
          <StatusBadge status={statusLabel(event.status)} />
        </div>
        <div className="flex flex-wrap gap-2.5">
          {event.isPublished ? (
            <form action={unpublishEventAction.bind(null, id)}>
              <button type="submit" className="rounded-[9px] border border-[var(--color-border)] bg-white px-4 py-2.5 text-[13px] font-semibold text-[var(--color-text)]">
                Unpublish
              </button>
            </form>
          ) : (
            <form action={publishEventAction.bind(null, id)}>
              <button type="submit" className="rounded-[9px] bg-[var(--color-primary)] px-4 py-2.5 text-[13px] font-bold text-white">
                Publish
              </button>
            </form>
          )}
          {event.status !== "CANCELLED" && (
            <form action={cancelEventAction.bind(null, id)}>
              <button type="submit" className="rounded-[9px] border border-[var(--color-border)] bg-white px-4 py-2.5 text-[13px] font-semibold text-[var(--color-danger)]">
                Cancel Event
              </button>
            </form>
          )}
        </div>
      </div>

      {error ? (
        <p className="mb-4 text-xs font-semibold text-[var(--color-danger)]" role="alert">
          {error}
        </p>
      ) : null}

      <Tabs basePath={`/events/${id}`} options={TABS} current={tab} />

      {tab === "Overview" && (
        <Card>
          <CardTitle>Event Information</CardTitle>
          <div className="grid grid-cols-1 gap-3.5 text-[13px] sm:grid-cols-2">
            <div>
              <span className="text-[var(--color-text-muted)]">Vendor: </span>
              <span className="font-semibold text-[var(--color-text)]">{vendorNames.get(event.vendorId) ?? "–"}</span>
            </div>
            <div>
              <span className="text-[var(--color-text-muted)]">Customer: </span>
              <span className="font-semibold text-[var(--color-text)]">
                {event.customerId ? customerNames.get(event.customerId) ?? "–" : "–"}
              </span>
            </div>
            <div>
              <span className="text-[var(--color-text-muted)]">Event Type: </span>
              <span className="font-semibold text-[var(--color-text)]">{event.eventType ?? "–"}</span>
            </div>
            <div>
              <span className="text-[var(--color-text-muted)]">Location: </span>
              <span className="font-semibold text-[var(--color-text)]">{event.location ?? "–"}</span>
            </div>
            <div>
              <span className="text-[var(--color-text-muted)]">Date: </span>
              <span className="font-semibold text-[var(--color-text)]">
                {event.eventDate ? new Date(event.eventDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "–"}
              </span>
            </div>
            <div>
              <span className="text-[var(--color-text-muted)]">Event Code: </span>
              <span className="font-semibold text-[var(--color-text)]">{event.eventCode}</span>
            </div>
            <div>
              <span className="text-[var(--color-text-muted)]">Public Page: </span>
              <span className="font-semibold text-[var(--color-text)]">/{event.eventSlug}</span>
            </div>
            <div>
              <span className="text-[var(--color-text-muted)]">Published: </span>
              <span className="font-semibold text-[var(--color-text)]">{event.isPublished ? "Yes" : "No"}</span>
            </div>
          </div>
        </Card>
      )}

      {tab === "Live Stream" && (
        event.youtubeStreams.length === 0 ? (
          <EmptyState message="No YouTube stream linked to this event yet." />
        ) : (
          <div className="flex flex-col gap-3.5">
            {event.youtubeStreams.map((s) => (
              <Card key={s.id}>
                <div className="mb-2.5 flex items-center justify-between">
                  <div className="text-[14px] font-bold text-[var(--color-text)]">Channel {s.youtubeChannelId}</div>
                  <StatusBadge status={statusLabel(s.status)} />
                </div>
                <div className="grid grid-cols-1 gap-2 text-[13px] sm:grid-cols-2">
                  <div>
                    <span className="text-[var(--color-text-muted)]">Video ID: </span>
                    <span className="font-mono font-semibold text-[var(--color-text)]">{s.youtubeVideoId ?? "–"}</span>
                  </div>
                  <div>
                    <span className="text-[var(--color-text-muted)]">Live URL: </span>
                    <span className="font-semibold text-[var(--color-text)]">{s.youtubeLiveUrl ?? "–"}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )
      )}

      {tab === "Recording" && <RecordingTab eventId={id} />}

      {tab === "Settings" && (
        <Card>
          <CardTitle>Access</CardTitle>
          <div className="grid grid-cols-1 gap-3.5 text-[13px] sm:grid-cols-2">
            <div>
              <span className="text-[var(--color-text-muted)]">Access Type: </span>
              <span className="font-semibold text-[var(--color-text)]">{event.access?.accessType ?? "PUBLIC"}</span>
            </div>
            <div>
              <span className="text-[var(--color-text-muted)]">Enabled: </span>
              <span className="font-semibold text-[var(--color-text)]">{event.access?.isEnabled ?? true ? "Yes" : "No"}</span>
            </div>
            <div>
              <span className="text-[var(--color-text-muted)]">Theme: </span>
              <span className="font-semibold text-[var(--color-text)]">{event.themeId ?? "None assigned"}</span>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

async function RecordingTab({ eventId }: { eventId: string }) {
  const { items } = await fetchRecordings({ eventId }).catch(() => ({ items: [], page: 1, totalPages: 1, total: 0 }));
  if (items.length === 0) return <EmptyState message="No recording available for this event yet." />;
  return (
    <div className="flex flex-col gap-3.5">
      {items.map((rc) => (
        <Card key={rc.id}>
          <div className="grid grid-cols-1 gap-2 text-[13px] sm:grid-cols-2">
            <div>
              <span className="text-[var(--color-text-muted)]">Status: </span>
              <span className="font-semibold text-[var(--color-text)]">{rc.status}</span>
            </div>
            <div>
              <span className="text-[var(--color-text-muted)]">Size: </span>
              <span className="font-semibold text-[var(--color-text)]">{formatBytes(rc.sizeBytes)}</span>
            </div>
            <div>
              <span className="text-[var(--color-text-muted)]">Duration: </span>
              <span className="font-semibold text-[var(--color-text)]">{Math.round(rc.durationSec / 60)} min</span>
            </div>
            <div>
              <span className="text-[var(--color-text-muted)]">Recorded: </span>
              <span className="font-semibold text-[var(--color-text)]">
                {new Date(rc.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </span>
            </div>
          </div>
          {rc.fileUrl ? (
            <div className="mt-3">
              <Button href={rc.fileUrl} variant="secondary">Open Recording</Button>
            </div>
          ) : null}
        </Card>
      ))}
    </div>
  );
}
