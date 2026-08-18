import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { TableCard, Thead, Tr, Td } from "@/components/ui/Table";
import { listTickets } from "@/lib/db";

export default function SupportPage() {
  const tickets = listTickets();
  const counts = {
    Open: tickets.filter((t) => t.status === "Open").length,
    Pending: tickets.filter((t) => t.status === "Pending").length,
    Resolved: tickets.filter((t) => t.status === "Resolved").length,
    Critical: tickets.filter((t) => t.status === "Critical").length,
  };

  return (
    <div>
      <div className="mb-5 text-[22px] font-extrabold text-[var(--color-text)]">
        Support Tickets
      </div>

      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card>
          <div className="mb-1.5 text-xs text-[var(--color-text-muted)]">Open</div>
          <div className="text-xl font-extrabold text-[var(--color-danger)]">
            {counts.Open}
          </div>
        </Card>
        <Card>
          <div className="mb-1.5 text-xs text-[var(--color-text-muted)]">Pending</div>
          <div className="text-xl font-extrabold text-[var(--color-warning)]">
            {counts.Pending}
          </div>
        </Card>
        <Card>
          <div className="mb-1.5 text-xs text-[var(--color-text-muted)]">Resolved</div>
          <div className="text-xl font-extrabold text-[var(--color-success)]">
            {counts.Resolved}
          </div>
        </Card>
        <Card>
          <div className="mb-1.5 text-xs text-[var(--color-text-muted)]">Critical</div>
          <div className="text-xl font-extrabold text-[var(--color-danger)]">
            {counts.Critical}
          </div>
        </Card>
      </div>

      <TableCard>
        <Thead
          columns={[
            "TICKET",
            "CUSTOMER",
            "VENDOR",
            "CATEGORY",
            "PRIORITY",
            "ASSIGNED",
            "STATUS",
          ]}
        />
        <tbody>
          {tickets.map((t) => (
            <Tr key={t.id}>
              <Td mono muted>
                {t.id}
              </Td>
              <Td>{t.customer}</Td>
              <Td muted>{t.vendor}</Td>
              <Td muted>{t.category}</Td>
              <Td>{t.priority}</Td>
              <Td muted>{t.assigned}</Td>
              <Td>
                <StatusBadge status={t.status} />
              </Td>
            </Tr>
          ))}
        </tbody>
      </TableCard>
    </div>
  );
}
