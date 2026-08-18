import { notFound } from "next/navigation";
import { BackLink } from "@/components/ui/Button";
import { Card, CardTitle } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { getChannel } from "@/lib/db";

export default async function ChannelDetailPage({
  params,
}: PageProps<"/youtube/channels/[id]">) {
  const { id } = await params;
  const channel = getChannel(Number(id));
  if (!channel) notFound();

  return (
    <div>
      <BackLink href="/youtube" label="Back to YouTube" />
      <div className="mb-5 flex flex-wrap items-center gap-2.5">
        <div className="text-2xl font-extrabold text-[var(--color-text)]">
          {channel.name}
        </div>
        <StatusBadge status={channel.status} />
      </div>
      <Card>
        <CardTitle>Channel Information</CardTitle>
        <div className="grid grid-cols-1 gap-3.5 text-[13px] sm:grid-cols-2">
          <div>
            <span className="text-[var(--color-text-muted)]">Vendor: </span>
            <span className="font-semibold text-[var(--color-text)]">
              {channel.vendor}
            </span>
          </div>
          <div>
            <span className="text-[var(--color-text-muted)]">
              Channel ID:{" "}
            </span>
            <span className="font-mono font-semibold text-[var(--color-text)]">
              {channel.channelId}
            </span>
          </div>
          <div>
            <span className="text-[var(--color-text-muted)]">
              Connected:{" "}
            </span>
            <span className="font-semibold text-[var(--color-text)]">
              {channel.connectedDate}
            </span>
          </div>
          <div>
            <span className="text-[var(--color-text-muted)]">
              Total Events:{" "}
            </span>
            <span className="font-semibold text-[var(--color-text)]">
              {channel.totalStreams}
            </span>
          </div>
          <div>
            <span className="text-[var(--color-text-muted)]">
              Live Events:{" "}
            </span>
            <span className="font-semibold text-[var(--color-text)]">0</span>
          </div>
          <div>
            <span className="text-[var(--color-text-muted)]">
              Last Sync:{" "}
            </span>
            <span className="font-semibold text-[var(--color-text)]">
              5 minutes ago
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}
