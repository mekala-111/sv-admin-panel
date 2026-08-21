import { notFound } from "next/navigation";
import { BackLink } from "@/components/ui/Button";
import { Card, CardTitle } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { fetchYoutubeChannelDetail } from "@/lib/hooks/useAdminYoutube";

function statusLabel(status: string): string {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

export default async function ChannelDetailPage({
  params,
}: PageProps<"/youtube/channels/[id]">) {
  const { id } = await params;
  const channel = await fetchYoutubeChannelDetail(id);
  if (!channel) notFound();

  return (
    <div>
      <BackLink href="/youtube?tab=Channels" label="Back to YouTube" />
      <div className="mb-5 flex flex-wrap items-center gap-2.5">
        <div className="text-2xl font-extrabold text-[var(--color-text)]">
          {channel.channelName ?? channel.channelId}
        </div>
        <StatusBadge status={statusLabel(channel.status)} />
      </div>
      <Card>
        <CardTitle>Channel Information</CardTitle>
        <div className="grid grid-cols-1 gap-3.5 text-[13px] sm:grid-cols-2">
          <div>
            <span className="text-[var(--color-text-muted)]">Vendor: </span>
            <span className="font-semibold text-[var(--color-text)]">{channel.vendorName ?? "–"}</span>
          </div>
          <div>
            <span className="text-[var(--color-text-muted)]">Channel ID: </span>
            <span className="font-mono font-semibold text-[var(--color-text)]">{channel.channelId}</span>
          </div>
          <div>
            <span className="text-[var(--color-text-muted)]">Connected: </span>
            <span className="font-semibold text-[var(--color-text)]">
              {new Date(channel.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </span>
          </div>
          <div>
            <span className="text-[var(--color-text-muted)]">Total Streams: </span>
            <span className="font-semibold text-[var(--color-text)]">{channel.streamsCount}</span>
          </div>
          <div>
            <span className="text-[var(--color-text-muted)]">Live Streams: </span>
            <span className="font-semibold text-[var(--color-text)]">{channel.liveStreamsCount}</span>
          </div>
          <div>
            <span className="text-[var(--color-text-muted)]">Token Expiry: </span>
            <span className="font-semibold text-[var(--color-text)]">
              {channel.tokenExpiry ? new Date(channel.tokenExpiry).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "–"}
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}
