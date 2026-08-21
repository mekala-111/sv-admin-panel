import { notFound } from "next/navigation";
import { BackLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { fetchSupportTicketDetail, type TicketStatus } from "@/lib/hooks/useAdminSupport";
import { fetchVendorNameMap, fetchCustomerNameMap } from "@/lib/hooks/useNameMaps";
import { addTicketMessageAction, setTicketStatusAction } from "@/lib/support";

const STATUSES: TicketStatus[] = ["OPEN", "PENDING", "RESOLVED", "CLOSED"];

function toParam(v: string | string[] | undefined): string {
  return Array.isArray(v) ? (v[0] ?? "") : (v ?? "");
}

function statusLabel(status: string): string {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

export default async function SupportTicketDetailPage(props: PageProps<"/support/[id]">) {
  const { id } = await props.params;
  const sp = await props.searchParams;
  const error = toParam(sp.error);

  const ticket = await fetchSupportTicketDetail(id);
  if (!ticket) notFound();

  const [vendorNames, customerNames] = await Promise.all([
    fetchVendorNameMap().catch(() => new Map<string, string>()),
    fetchCustomerNameMap().catch(() => new Map<string, string>()),
  ]);
  const from = ticket.vendorId
    ? vendorNames.get(ticket.vendorId) ?? "Vendor"
    : ticket.customerId
      ? customerNames.get(ticket.customerId) ?? "Customer"
      : "–";

  return (
    <div>
      <BackLink href="/support" label="Back to Support" />

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-[22px] font-extrabold text-[var(--color-text)]">{ticket.subject}</div>
          <div className="mt-0.5 text-[13px] text-[var(--color-text-muted)]">
            {ticket.ticketCode} &middot; {ticket.category} &middot; From {from}
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <StatusBadge status={statusLabel(ticket.priority)} />
          <StatusBadge status={statusLabel(ticket.status)} />
        </div>
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        {STATUSES.filter((s) => s !== ticket.status).map((s) => (
          <form key={s} action={setTicketStatusAction.bind(null, ticket.id, s)}>
            <button type="submit" className="rounded-[7px] border border-[var(--color-border)] bg-white px-3.5 py-1.5 text-xs font-semibold text-[var(--color-text)]">
              Mark {statusLabel(s)}
            </button>
          </form>
        ))}
      </div>

      {error ? (
        <p className="mb-4 text-xs font-semibold text-[var(--color-danger)]" role="alert">
          {error}
        </p>
      ) : null}

      <div className="mb-4 text-[15px] font-bold text-[var(--color-text)]">Messages</div>
      <Card className="mb-5">
        {ticket.messages.length === 0 ? (
          <div className="py-6 text-center text-[13px] text-[var(--color-text-muted)]">No messages yet.</div>
        ) : (
          <div className="flex flex-col gap-3.5">
            {ticket.messages.map((m, i) => (
              <div key={i} className="border-b border-[var(--color-border)] pb-3.5 text-[13px] last:border-b-0 last:pb-0">
                <div className="mb-1 font-bold text-[var(--color-text)]">{m.authorRole}</div>
                <div className="mb-1 text-[var(--color-text)]">{m.body}</div>
                <div className="text-[11px] text-[var(--color-text-muted)]">
                  {new Date(m.createdAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="max-w-[560px]">
        <div className="mb-3.5 text-[14px] font-bold text-[var(--color-text)]">Reply</div>
        <form action={addTicketMessageAction.bind(null, ticket.id)} className="flex flex-col gap-3.5">
          <textarea
            name="message"
            required
            rows={3}
            className="w-full resize-none rounded-lg border border-[var(--color-border)] px-3 py-2.5 text-[13px] text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
          />
          <button type="submit" className="w-fit rounded-[9px] bg-[var(--color-primary)] px-5 py-2.5 text-[13px] font-bold text-white">
            Send
          </button>
        </form>
      </Card>
    </div>
  );
}
