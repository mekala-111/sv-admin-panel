import Link from "next/link";
import { PillTabs } from "@/components/ui/Tabs";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { TableCard, Thead, Tr, Td } from "@/components/ui/Table";
import { listEvents } from "@/lib/db";

const FILTERS = ["All", "Live", "Upcoming", "Completed", "Cancelled"];

export default async function EventsPage({
  searchParams,
}: PageProps<"/events">) {
  const sp = await searchParams;
  const tabParam = Array.isArray(sp.tab) ? sp.tab[0] : sp.tab;
  const tab = FILTERS.includes(tabParam ?? "") ? (tabParam as string) : "All";

  const events = (await listEvents()).filter(
    (e) => tab === "All" || e.status === tab
  );

  return (
    <div>
      <div className="mb-4 text-[22px] font-extrabold text-[var(--color-text)]">
        Event Management
      </div>
      <PillTabs basePath="/events" options={FILTERS} current={tab} />
      <TableCard>
        <Thead
          columns={[
            "EVENT",
            "CUSTOMER",
            "VENDOR",
            "DATE",
            "VIEWERS",
            "REVENUE",
            "STATUS",
            "",
          ]}
        />
        <tbody>
          {events.map((ev) => (
            <Tr key={ev.id}>
              <Td strong>{ev.name}</Td>
              <Td muted>{ev.customer}</Td>
              <Td muted>{ev.vendor}</Td>
              <Td muted>{ev.date}</Td>
              <Td>{ev.viewers.toLocaleString("en-IN")}</Td>
              <Td strong>{ev.revenue}</Td>
              <Td>
                <StatusBadge status={ev.status} />
              </Td>
              <Td>
                <Link
                  href={`/events/${ev.id}`}
                  className="rounded-[7px] border border-[var(--color-border)] bg-white px-3 py-1.5 text-xs font-semibold text-[var(--color-primary)]"
                >
                  View
                </Link>
              </Td>
            </Tr>
          ))}
        </tbody>
      </TableCard>
    </div>
  );
}
