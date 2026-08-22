import { notFound } from "next/navigation";
import { BackLink } from "@/components/ui/Button";
import { Card, CardTitle } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { getEventStream } from "@/lib/db";

export default async function StreamDetailPage({
  params,
}: PageProps<"/youtube/streams/[id]">) {
  const { id } = await params;
  const stream = await getEventStream(id);
  if (!stream) notFound();

  const youtubeHref =
    stream.liveUrl ||
    (stream.videoId && stream.videoId !== "—"
      ? `https://www.youtube.com/watch?v=${stream.videoId}`
      : null);

  return (
    <div>
      <BackLink href="/youtube?tab=Event%20Streams" label="Back to YouTube" />
      <div className="mb-5 flex flex-wrap items-center gap-2.5">
        <div className="text-2xl font-extrabold text-[var(--color-text)]">
          {stream.event}
        </div>
        <StatusBadge status={stream.status} />
      </div>
      <Card className="mb-4">
        <CardTitle>Stream Information</CardTitle>
        <div className="grid grid-cols-1 gap-3.5 text-[13px] sm:grid-cols-2">
          <div>
            <span className="text-[var(--color-text-muted)]">
              YouTube Video ID:{" "}
            </span>
            <span className="font-mono font-semibold text-[var(--color-text)]">
              {stream.videoId}
            </span>
          </div>
          <div>
            <span className="text-[var(--color-text-muted)]">Channel: </span>
            <span className="font-semibold text-[var(--color-text)]">
              {stream.channel}
            </span>
          </div>
          <div>
            <span className="text-[var(--color-text-muted)]">Vendor: </span>
            <span className="font-semibold text-[var(--color-text)]">
              {stream.vendor}
            </span>
          </div>
          <div>
            <span className="text-[var(--color-text-muted)]">Customer: </span>
            <span className="font-semibold text-[var(--color-text)]">
              {stream.customer}
            </span>
          </div>
          <div>
            <span className="text-[var(--color-text-muted)]">Views: </span>
            <span className="font-semibold text-[var(--color-text)]">
              {stream.views.toLocaleString("en-IN")}
            </span>
          </div>
          <div>
            <span className="text-[var(--color-text-muted)]">Start Time: </span>
            <span className="font-semibold text-[var(--color-text)]">
              {stream.date}
            </span>
          </div>
        </div>
      </Card>
      <div className="flex flex-wrap gap-2.5">
        {youtubeHref ? (
          <a
            href={youtubeHref}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-[9px] border-none bg-[var(--color-primary)] px-4 py-2.5 text-[13px] font-bold text-white"
          >
            Open YouTube
          </a>
        ) : null}
      </div>
    </div>
  );
}
