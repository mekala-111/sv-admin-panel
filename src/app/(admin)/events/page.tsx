import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { PillTabs } from "@/components/ui/Tabs";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { TableCard, Thead, Tr, Td } from "@/components/ui/Table";
import { fetchEvents, type EventStatus } from "@/lib/hooks/useAdminEvents";
import { fetchVendorNameMap } from "@/lib/hooks/useNameMaps";

const FILTERS: { label: string; status: EventStatus | "" }[] = [
  { label: "All", status: "" },
  { label: "Draft", status: "DRAFT" },
  { label: "Upcoming", status: "UPCOMING" },
  { label: "Live", status: "LIVE" },
  { label: "Completed", status: "COMPLETED" },
  { label: "Cancelled", status: "CANCELLED" },
];

function statusLabel(status: string): string {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

export default async function EventsPage({
  searchParams,
}: PageProps<"/events">) {
  const sp = await searchParams;
  const tabParam = Array.isArray(sp.tab) ? sp.tab[0] : sp.tab;
  const active = FILTERS.find((f) => f.label === tabParam) ?? FILTERS[0];
  const page = Math.max(1, Number(Array.isArray(sp.page) ? sp.page[0] : sp.page) || 1);

  let result: Awaited<ReturnType<typeof fetchEvents>> | null = null;
  let vendorNames = new Map<string, string>();
  let loadError: string | null = null;
  try {
    [result, vendorNames] = await Promise.all([
      fetchEvents({ page, status: active.status }),
      fetchVendorNameMap().catch(() => new Map<string, string>()),
    ]);
  } catch {
    loadError = "Couldn't load events. Please try again.";
  }

  return (
    <div>
      <PageHeader
        title="Event Management"
        actions={<Button href="/events/create" variant="primary">+ Add Event</Button>}
      />
      <PillTabs basePath="/events" options={FILTERS.map((f) => f.label)} current={active.label} />

      {loadError ? (
        <div className="rounded-[14px] border border-[var(--color-border)] bg-white p-8 text-center text-[13px] text-[var(--color-text-muted)]">
          {loadError}
        </div>
      ) : (
        <>
          <TableCard>
            <Thead columns={["EVENT", "VENDOR", "LOCATION", "DATE", "STATUS", "PUBLISHED", ""]} />
            <tbody>
              {result!.items.length === 0 ? (
                <tr>
                  <Td muted>No events found.</Td>
                </tr>
              ) : (
                result!.items.map((ev) => (
                  <Tr key={ev.id}>
                    <Td strong>{ev.eventName}</Td>
                    <Td muted>{vendorNames.get(ev.vendorId) ?? "–"}</Td>
                    <Td muted>{ev.location ?? "–"}</Td>
                    <Td muted>{ev.eventDate ? new Date(ev.eventDate).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "–"}</Td>
                    <Td>
                      <StatusBadge status={statusLabel(ev.status)} />
                    </Td>
                    <Td muted>{ev.isPublished ? "Yes" : "No"}</Td>
                    <Td>
                      <Link
                        href={`/events/${ev.id}`}
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

          {result!.totalPages > 1 && (
            <div className="mt-4 flex items-center justify-center gap-3 text-[13px]">
              <Link
                href={`/events?tab=${active.label}&page=${page - 1}`}
                className="rounded-[7px] border border-[var(--color-border)] bg-white px-3.5 py-1.5 text-xs font-semibold"
                aria-disabled={page <= 1}
                style={page <= 1 ? { pointerEvents: "none", opacity: 0.5 } : undefined}
              >
                ← Previous
              </Link>
              <span className="text-[var(--color-text-muted)]">
                Page {result!.page} of {result!.totalPages} · {result!.total} events
              </span>
              <Link
                href={`/events?tab=${active.label}&page=${page + 1}`}
                className="rounded-[7px] border border-[var(--color-border)] bg-white px-3.5 py-1.5 text-xs font-semibold"
                aria-disabled={page >= result!.totalPages}
                style={page >= result!.totalPages ? { pointerEvents: "none", opacity: 0.5 } : undefined}
              >
                Next →
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}
