import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Tabs } from "@/components/ui/Tabs";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { TableCard, Thead, Tr, Td, EmptyState } from "@/components/ui/Table";
import { listChannels, listEventStreams } from "@/lib/db";

const TABS = ["Overview", "Channels", "Event Streams"];

export default async function YoutubePage({
  searchParams,
}: PageProps<"/youtube">) {
  const sp = await searchParams;
  const tabParam = Array.isArray(sp.tab) ? sp.tab[0] : sp.tab;
  const tab = TABS.includes(tabParam ?? "") ? (tabParam as string) : "Overview";

  const [channels, streams] = await Promise.all([listChannels(), listEventStreams()]);
  const overview = {
    connectedChannels: channels.filter((c) => c.status === "Active").length,
    liveStreams: streams.filter((s) => s.status === "Live").length,
    upcomingStreams: streams.filter((s) => s.status === "Upcoming").length,
    completedStreams: streams.filter((s) => s.status === "Completed").length,
  };

  return (
    <div>
      <div className="mb-4 text-[22px] font-extrabold text-[var(--color-text)]">
        YouTube
      </div>
      <Tabs basePath="/youtube" options={TABS} current={tab} />

      {tab === "Overview" && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Card>
            <div className="mb-1.5 text-xs text-[var(--color-text-muted)]">
              Connected Channels
            </div>
            <div className="text-[22px] font-extrabold text-[var(--color-text)]">
              {overview.connectedChannels.toLocaleString("en-IN")}
            </div>
          </Card>
          <Card>
            <div className="mb-1.5 text-xs text-[var(--color-text-muted)]">
              Live Streams
            </div>
            <div className="text-[22px] font-extrabold text-[var(--color-danger)]">
              {overview.liveStreams.toLocaleString("en-IN")}
            </div>
          </Card>
          <Card>
            <div className="mb-1.5 text-xs text-[var(--color-text-muted)]">
              Upcoming Streams
            </div>
            <div className="text-[22px] font-extrabold text-[var(--color-info)]">
              {overview.upcomingStreams.toLocaleString("en-IN")}
            </div>
          </Card>
          <Card>
            <div className="mb-1.5 text-xs text-[var(--color-text-muted)]">
              Completed Streams
            </div>
            <div className="text-[22px] font-extrabold text-[var(--color-text)]">
              {overview.completedStreams.toLocaleString("en-IN")}
            </div>
          </Card>
        </div>
      )}

      {tab === "Channels" &&
        (channels.length === 0 ? (
          <EmptyState message="No YouTube channels connected yet." />
        ) : (
          <TableCard>
            <Thead
              columns={[
                "CHANNEL",
                "VENDOR",
                "CHANNEL ID",
                "CONNECTED",
                "STATUS",
                "STREAMS",
                "",
              ]}
            />
            <tbody>
              {channels.map((c) => (
                <Tr key={String(c.id)}>
                  <Td strong>{c.name}</Td>
                  <Td muted>{c.vendor}</Td>
                  <Td mono muted>
                    {c.channelId}
                  </Td>
                  <Td muted>{c.connectedDate}</Td>
                  <Td>
                    <StatusBadge status={c.status} />
                  </Td>
                  <Td>{c.totalStreams}</Td>
                  <Td>
                    <Link
                      href={`/youtube/channels/${c.id}`}
                      className="rounded-[7px] border border-[var(--color-border)] bg-white px-3 py-1.5 text-xs font-semibold text-[var(--color-primary)]"
                    >
                      View
                    </Link>
                  </Td>
                </Tr>
              ))}
            </tbody>
          </TableCard>
        ))}

      {tab === "Event Streams" &&
        (streams.length === 0 ? (
          <EmptyState message="No YouTube event streams yet." />
        ) : (
          <TableCard>
            <Thead
              columns={[
                "EVENT",
                "VENDOR",
                "CUSTOMER",
                "VIDEO ID",
                "DATE",
                "VIEWS",
                "STATUS",
                "",
              ]}
            />
            <tbody>
              {streams.map((s) => (
                <Tr key={String(s.id)}>
                  <Td strong>{s.event}</Td>
                  <Td muted>{s.vendor}</Td>
                  <Td muted>{s.customer}</Td>
                  <Td mono muted>
                    {s.videoId}
                  </Td>
                  <Td muted>{s.date}</Td>
                  <Td>{s.views.toLocaleString("en-IN")}</Td>
                  <Td>
                    <StatusBadge status={s.status} />
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
              ))}
            </tbody>
          </TableCard>
        ))}
    </div>
  );
}
