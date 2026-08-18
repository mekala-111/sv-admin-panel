import { EmptyState } from "@/components/ui/Table";

export default function RecordingsPage() {
  return (
    <div>
      <div className="mb-5 text-[22px] font-extrabold text-[var(--color-text)]">
        Recordings
      </div>
      <EmptyState message="This section hasn't been designed yet." />
    </div>
  );
}
