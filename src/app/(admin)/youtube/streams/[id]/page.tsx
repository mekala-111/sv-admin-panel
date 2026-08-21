import { notFound } from "next/navigation";
import { BackLink, Button } from "@/components/ui/Button";
import { Card, CardTitle } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { fetchYoutubeStreamDetail } from "@/lib/hooks/useAdminYoutube";
import { syncYoutubeAction } from "@/lib/youtube";

function statusLabel(status: string): string {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

export default async function StreamDetailPage({
  params,
}: PageProps<"/youtube/streams/[id]">) {
  const { id } = await params;
  const stream = await fetchYoutubeStreamDetail(id);
  if (!stream) notFound();

  return (
    <div>
      <BackLink href="/youtube" label="Back to YouTube" />
      <div className="mb-5 flex flex-wrap items-center gap-2.5">
        <div className="text-2xl font-extrabold text-[var(--color-text)]">
          {stream.event?.eventName ?? "Untitled event"}
        </div>
        <StatusBadge status={statusLabel(stream.status)} />
      </div>
      <Card className="mb-4">
        <CardTitle>Stream Information</CardTitle>
        <div className="grid grid-cols-1 gap-3.5 text-[13px] sm:grid-cols-2">
          <div>
            <span className="text-[var(--color-text-muted)]">YouTube Video ID: </span>
            <span className="font-mono font-semibold text-[var(--color-text)]">{stream.youtubeVideoId ?? "–"}</span>
          </div>
          <div>
            <span className="text-[var(--color-text-muted)]">Channel: </span>
            <span className="font-semibold text-[var(--color-text)]">{stream.channelName ?? "–"}</span>
          </div>
          <div>
            <span className="text-[var(--color-text-muted)]">Vendor: </span>
            <span className="font-semibold text-[var(--color-text)]">{stream.vendorName ?? "–"}</span>
          </div>
          <div>
            <span className="text-[var(--color-text-muted)]">Customer: </span>
            <span className="font-semibold text-[var(--color-text)]">{stream.customerName ?? "–"}</span>
          </div>
          <div>
            <span className="text-[var(--color-text-muted)]">Live URL: </span>
            <span className="font-semibold text-[var(--color-text)]">{stream.youtubeLiveUrl ?? "–"}</span>
          </div>
          <div>
            <span className="text-[var(--color-text-muted)]">Scheduled At: </span>
            <span className="font-semibold text-[var(--color-text)]">
              {stream.scheduledAt ? new Date(stream.scheduledAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "–"}
            </span>
          </div>
        </div>
      </Card>
      <div className="flex flex-wrap gap-2.5">
        {stream.youtubeLiveUrl ? (
          <Button href={stream.youtubeLiveUrl} variant="primary">Open YouTube</Button>
        ) : null}
        {stream.event ? (
          <form action={syncYoutubeAction.bind(null, stream.event.id)}>
            <button type="submit" className="rounded-[9px] border border-[var(--color-border)] bg-white px-4 py-2.5 text-[13px] font-semibold text-[var(--color-text)]">
              Refresh Status
            </button>
          </form>
        ) : null}
      </div>
    </div>
  );
}
