import { TableCard, Thead, Tr, Td } from "@/components/ui/Table";
import { listAuditLogs } from "@/lib/db";

export default function AuditLogsPage() {
  const logs = listAuditLogs();

  return (
    <div>
      <div className="mb-5 text-[22px] font-extrabold text-[var(--color-text)]">
        Audit Logs
      </div>
      <TableCard>
        <Thead columns={["USER", "ACTION", "MODULE", "IP", "DATE", "DETAILS"]} />
        <tbody>
          {logs.map((l, i) => (
            <Tr key={i}>
              <Td strong>{l.user}</Td>
              <Td muted>{l.action}</Td>
              <Td muted>{l.module}</Td>
              <Td mono muted>
                {l.ip}
              </Td>
              <Td muted>{l.date}</Td>
              <Td muted>{l.details}</Td>
            </Tr>
          ))}
        </tbody>
      </TableCard>
    </div>
  );
}
