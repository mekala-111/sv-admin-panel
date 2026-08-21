import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Tabs } from "@/components/ui/Tabs";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { TableCard, Thead, Tr, Td } from "@/components/ui/Table";
import { fetchYoutubeChannels, fetchYoutubeStreams } from "@/lib/hooks/useAdminYoutube";

const TABS = ["Overview", "Channels", "Event Streams"];

function toParam(v: string | string[] | undefined): string {
  return Array.isArray(v) ? (v[0] ?? "") : (v ?? "");
}

function statusLabel(status: string): string {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

export default async function YoutubePage({
  searchParams,
}: PageProps<"/youtube">) {
  const sp = await searchParams;
  const tabParam = toParam(sp.tab);
  const tab = TABS.includes(tabParam) ? tabParam : "Overview";
  const error = toParam(sp.error);

  const [channels, streams] = await Promise.all([
    fetchYoutubeChannels().catch(() => []),
    fetchYoutubeStreams().catch(() => []),
  ]);

  return (
    <div>
      <div className="mb-4 text-[22px] font-extrabold text-[var(--color-text)]">
        YouTube
      </div>
      <Tabs basePath="/youtube" options={TABS} current={tab} />

      {error ? (
        <p className="mb-4 text-xs font-semibold text-[var(--color-danger)]" role="alert">
          {error}
        </p>
      ) : null}

      {tab === "Overview" && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Card>
            <div className="mb-1.5 text-xs text-[var(--color-text-muted)]">Connected Channels</div>
            <div className="text-[22px] font-extrabold text-[var(--color-text)]">
              {channels.filter((c) => c.status === "CONNECTED").length}
            </div>
          </Card>
          <Card>
            <div className="mb-1.5 text-xs text-[var(--color-text-muted)]">Live Streams</div>
            <div className="text-[22px] font-extrabold text-[var(--color-danger)]">
              {streams.filter((s) => s.status === "LIVE").length}
            </div>
          </Card>
          <Card>
            <div className="mb-1.5 text-xs text-[var(--color-text-muted)]">Upcoming Streams</div>
            <div className="text-[22px] font-extrabold text-[var(--color-info)]">
              {streams.filter((s) => s.status === "SCHEDULED").length}
            </div>
          </Card>
          <Card>
            <div className="mb-1.5 text-xs text-[var(--color-text-muted)]">Completed Streams</div>
            <div className="text-[22px] font-extrabold text-[var(--color-text)]">
              {streams.filter((s) => s.status === "ENDED").length}
            </div>
          </Card>
        </div>
      )}

      {tab === "Channels" && (
        <TableCard>
          <Thead columns={["CHANNEL", "VENDOR", "CHANNEL ID", "STATUS", "STREAMS", ""]} />
          <tbody>
            {channels.length === 0 ? (
              <tr>
                <Td muted>No channels connected yet.</Td>
              </tr>
            ) : (
              channels.map((c) => (
                <Tr key={c.id}>
                  <Td strong>{c.channelName ?? c.channelId}</Td>
                  <Td muted>{c.vendorName ?? "–"}</Td>
                  <Td mono muted>{c.channelId}</Td>
                  <Td>
                    <StatusBadge status={statusLabel(c.status)} />
                  </Td>
                  <Td>{c.streamsCount}</Td>
                  <Td>
                    <Link
                      href={`/youtube/channels/${c.id}`}
                      className="rounded-[7px] border border-[var(--color-border)] bg-white px-3 py-1.5 text-xs font-semibold text-[var(--color-primary)]"
                    >
                      View
                    </Link>
                  </Td>
                </Tr>
              ))
            )}
          </tbody>
        </TableCard>
      )}

      {tab === "Event Streams" && (
        <TableCard>
          <Thead columns={["EVENT", "VENDOR", "CUSTOMER", "VIDEO ID", "STATUS", ""]} />
          <tbody>
            {streams.length === 0 ? (
              <tr>
                <Td muted>No streams yet.</Td>
              </tr>
            ) : (
              streams.map((s) => (
                <Tr key={s.id}>
                  <Td strong>{s.event?.eventName ?? "–"}</Td>
                  <Td muted>{s.vendorName ?? "–"}</Td>
                  <Td muted>{s.customerName ?? "–"}</Td>
                  <Td mono muted>{s.youtubeVideoId ?? "–"}</Td>
                  <Td>
                    <StatusBadge status={statusLabel(s.status)} />
                  </Td>
                  <Td>
                    <Link
                      href={`/youtube/streams/${s.id}`}
                      className="rounded-[7px] border border-[var(--color-border)] bg-white px-3 py-1.5 text-xs font-semibold text-[var(--color-primary)]"
                    >
                      View
                    </Link>
                  </Td>
                </Tr>
              ))
            )}
          </tbody>
        </TableCard>
      )}
    </div>
  );
}
