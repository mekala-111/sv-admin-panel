import { notFound } from "next/navigation";
import { BackLink, Button } from "@/components/ui/Button";
import { Card, CardTitle } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Tabs } from "@/components/ui/Tabs";
import { SelectOptionsField, TextField, CheckboxField } from "@/components/ui/Field";
import { EmptyState } from "@/components/ui/Table";
import { fetchEventDetail } from "@/lib/hooks/useAdminEvents";
import { fetchVendorNameMap, fetchCustomerNameMap } from "@/lib/hooks/useNameMaps";
import { fetchThemes } from "@/lib/hooks/useAdminThemes";
import { fetchYoutubeChannels } from "@/lib/hooks/useAdminYoutube";
import { fetchRecordings, formatBytes } from "@/lib/hooks/useAdminRecordings";
import {
  publishEventAction,
  unpublishEventAction,
  cancelEventAction,
  setEventThemeConfigAction,
  setEventAccessAction,
} from "@/lib/events";
import { linkYoutubeStreamAction } from "@/lib/youtube";

const TABS = ["Overview", "Live Stream", "Recording", "Settings"];

function toParam(v: string | string[] | undefined): string {
  return Array.isArray(v) ? (v[0] ?? "") : (v ?? "");
}

function statusLabel(status: string): string {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <span className="text-[var(--color-text-muted)]">{label}: </span>
      <span className="font-semibold text-[var(--color-text)]">{value ?? "–"}</span>
    </div>
  );
}

function Thumb({ src, label }: { src: string | null; label: string }) {
  if (!src) return null;
  return (
    <div>
      <div className="mb-1 text-[11px] text-[var(--color-text-muted)]">{label}</div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={label} className="h-20 w-20 rounded-lg border border-[var(--color-border)] object-cover" />
    </div>
  );
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

  const [vendorNames, customerNames, themes, channels] = await Promise.all([
    fetchVendorNameMap().catch(() => new Map<string, string>()),
    fetchCustomerNameMap().catch(() => new Map<string, string>()),
    fetchThemes().catch(() => []),
    fetchYoutubeChannels().catch(() => []),
  ]);

  const themeName = new Map(themes.map((t) => [t.id, t.name]));
  const channelName = new Map(channels.map((c) => [c.id, c.channelName ?? c.channelId]));

  return (
    <div>
      <BackLink href="/events" label="Back to Events" />
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="text-2xl font-extrabold text-[var(--color-text)]">{event.eventName}</div>
          <StatusBadge status={statusLabel(event.status)} />
        </div>
        <div className="flex flex-wrap gap-2.5">
          <Button href={`/events/${id}/edit`} variant="secondary">Edit Event</Button>
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
        <div className="flex flex-col gap-3.5">
          <Card>
            <CardTitle>Event Information</CardTitle>
            <div className="grid grid-cols-1 gap-3.5 text-[13px] sm:grid-cols-2">
              <InfoRow label="Vendor" value={vendorNames.get(event.vendorId)} />
              <InfoRow label="Customer" value={event.customerId ? customerNames.get(event.customerId) : null} />
              <InfoRow label="Event Type" value={event.eventType} />
              <InfoRow label="Location" value={event.location} />
              <InfoRow
                label="Google Maps"
                value={
                  event.googleMapsUrl ? (
                    <a href={event.googleMapsUrl} target="_blank" rel="noreferrer">
                      Open map
                    </a>
                  ) : null
                }
              />
              <InfoRow
                label="Date"
                value={
                  event.eventDate
                    ? new Date(event.eventDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                    : null
                }
              />
              <InfoRow label="Live Timings" value={event.liveTiming} />
              <InfoRow label="Event Code" value={event.eventCode} />
              <InfoRow label="Public Page" value={`/${event.eventSlug}`} />
              <InfoRow label="Published" value={event.isPublished ? "Yes" : "No"} />
              <InfoRow label="Theme" value={event.themeId ? themeName.get(event.themeId) ?? event.themeId : null} />
              <InfoRow label="Font" value={event.fontFamily} />
              <InfoRow label="Watch Live Button" value={event.showWatchLive ? "Shown" : "Hidden"} />
              <InfoRow label="Social Share Button" value={event.showSocialShare ? "Shown" : "Hidden"} />
              <InfoRow
                label="WhatsApp Support"
                value={event.whatsappEnabled ? event.whatsappNumber ?? "Enabled" : "Disabled"}
              />
              <InfoRow
                label="Teaser"
                value={
                  event.teaserUrl ? (
                    <a href={event.teaserUrl} target="_blank" rel="noreferrer">
                      Open teaser
                    </a>
                  ) : null
                }
              />
              <InfoRow label="Scroll Message" value={event.scrollMessage} />
            </div>
          </Card>

          {(event.remarks1 || event.remarks2) && (
            <Card>
              <CardTitle>Remarks</CardTitle>
              <div className="grid grid-cols-1 gap-3.5 text-[13px] sm:grid-cols-2">
                <InfoRow label="Remarks 1" value={event.remarks1} />
                <InfoRow label="Remarks 2" value={event.remarks2} />
              </div>
            </Card>
          )}

          {(event.metaTitle || event.metaDescription) && (
            <Card>
              <CardTitle>SEO</CardTitle>
              <div className="grid grid-cols-1 gap-3.5 text-[13px] sm:grid-cols-2">
                <InfoRow label="Meta Title" value={event.metaTitle} />
                <InfoRow label="Meta Description" value={event.metaDescription} />
              </div>
            </Card>
          )}

          {(event.coverImage || event.logoImage || event.customImage || event.whatsappImage || event.galleryImages.length > 0) && (
            <Card>
              <CardTitle>Media</CardTitle>
              <div className="flex flex-wrap gap-4">
                <Thumb src={event.coverImage} label="Cover" />
                <Thumb src={event.logoImage} label="Logo" />
                <Thumb src={event.customImage} label="Custom" />
                <Thumb src={event.whatsappImage} label="WhatsApp" />
                {event.galleryImages.map((src, i) => (
                  <Thumb key={i} src={src} label={`Gallery ${i + 1}`} />
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      {tab === "Live Stream" && (
        <div className="flex flex-col gap-3.5">
          {event.youtubeStreams.length === 0 ? (
            <Card>
              <CardTitle>Link a YouTube Stream</CardTitle>
              {channels.length === 0 ? (
                <EmptyState message="No connected YouTube channels yet — connect one from the YouTube section first." />
              ) : (
                <form action={linkYoutubeStreamAction.bind(null, id)} className="flex flex-col gap-3.5">
                  <SelectOptionsField
                    label="YouTube Channel"
                    name="youtubeChannelId"
                    placeholder="Select a channel…"
                    required
                    options={channels.map((c) => ({ value: c.id, label: c.channelName ?? c.channelId }))}
                  />
                  <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
                    <TextField label="Live Video ID" name="youtubeVideoId" placeholder="e.g. _eZppUQh9kU" />
                    <TextField label="Live URL" name="youtubeLiveUrl" placeholder="https://youtube.com/live/…" />
                    <TextField label="Live Key" name="youtubeLiveKey" placeholder="e.g. rt56-t6dt-1kga-kc8a-bkf7" />
                  </div>
                  <button
                    type="submit"
                    className="w-fit rounded-[9px] bg-[var(--color-primary)] px-4 py-2.5 text-[13px] font-bold text-white"
                  >
                    Link Stream
                  </button>
                </form>
              )}
            </Card>
          ) : (
            event.youtubeStreams.map((s) => (
              <Card key={s.id}>
                <div className="mb-2.5 flex items-center justify-between">
                  <div className="text-[14px] font-bold text-[var(--color-text)]">
                    {channelName.get(s.youtubeChannelId) ?? `Channel ${s.youtubeChannelId}`}
                  </div>
                  <StatusBadge status={statusLabel(s.status)} />
                </div>
                <div className="grid grid-cols-1 gap-2 text-[13px] sm:grid-cols-2">
                  <InfoRow label="Video ID" value={s.youtubeVideoId} />
                  <InfoRow label="Live URL" value={s.youtubeLiveUrl} />
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {tab === "Recording" && <RecordingTab eventId={id} />}

      {tab === "Settings" && (
        <div className="flex flex-col gap-3.5">
          <Card>
            <CardTitle>Theme</CardTitle>
            <form action={setEventThemeConfigAction.bind(null, id)} className="flex flex-col gap-3.5">
              <div>
                <label htmlFor="themeId" className="mb-1.5 block text-xs font-semibold text-[var(--color-text-muted)]">
                  Design
                </label>
                <select
                  id="themeId"
                  name="themeId"
                  defaultValue={event.themeId ?? ""}
                  className="w-full max-w-[360px] rounded-lg border border-[var(--color-border)] px-3 py-2.5 text-[13px] text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
                >
                  <option value="">Select a theme…</option>
                  {themes
                    .filter((t) => t.status === "ACTIVE" || t.id === event.themeId)
                    .map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                </select>
              </div>
              <button
                type="submit"
                className="w-fit rounded-[9px] border border-[var(--color-border)] bg-white px-4 py-2.5 text-[13px] font-semibold text-[var(--color-text)]"
              >
                Save Theme
              </button>
            </form>
          </Card>

          <Card>
            <CardTitle>Access</CardTitle>
            <form action={setEventAccessAction.bind(null, id)} className="flex flex-col gap-3.5">
              <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                <SelectOptionsField
                  label="Access Type"
                  name="accessType"
                  defaultValue={event.access?.accessType ?? "PUBLIC"}
                  options={[
                    { value: "PUBLIC", label: "Public" },
                    { value: "PRIVATE", label: "Private (password protected)" },
                  ]}
                />
                <TextField label="Password (only if Private)" name="password" type="password" placeholder="Leave blank to keep current" />
              </div>
              <CheckboxField label="Enabled" name="isEnabled" defaultChecked={event.access?.isEnabled ?? true} />
              <button
                type="submit"
                className="w-fit rounded-[9px] border border-[var(--color-border)] bg-white px-4 py-2.5 text-[13px] font-semibold text-[var(--color-text)]"
              >
                Save Access
              </button>
            </form>
          </Card>
        </div>
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
            <InfoRow label="Status" value={rc.status} />
            <InfoRow label="Size" value={formatBytes(rc.sizeBytes)} />
            <InfoRow label="Duration" value={`${Math.round(rc.durationSec / 60)} min`} />
            <InfoRow
              label="Recorded"
              value={new Date(rc.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            />
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
