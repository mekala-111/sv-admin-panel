import { statusMeta } from "@/lib/status";

export function StatusBadge({ status }: { status: string }) {
  const { bg, fg } = statusMeta(status);
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold"
      style={{ background: bg, color: fg }}
    >
      <span
        className="inline-block h-1.5 w-1.5 rounded-full"
        style={{ background: fg }}
      />
      {status}
    </span>
  );
}
