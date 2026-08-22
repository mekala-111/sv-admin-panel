import { EmptyState, TableCard, Thead, Tr, Td } from "@/components/ui/Table";
import { listRecordings } from "@/lib/db";

export default async function RecordingsPage() {
  const recordings = await listRecordings();

  return (
    <div>
      <div className="mb-5 text-[22px] font-extrabold text-[var(--color-text)]">
        Recordings
      </div>
      {recordings.length === 0 ? (
        <EmptyState message="No recordings yet." />
      ) : (
        <TableCard>
          <Thead columns={["EVENT", "VENDOR", "SIZE", "STORAGE"]} />
          <tbody>
            {recordings.map((r, i) => (
              <Tr key={`${r.event}-${i}`}>
                <Td>{r.event}</Td>
                <Td>{r.vendor}</Td>
                <Td>{r.size}</Td>
                <Td>{r.storage}</Td>
              </Tr>
            ))}
          </tbody>
        </TableCard>
      )}
    </div>
  );
}
