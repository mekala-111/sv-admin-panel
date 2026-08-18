export function TableCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-[14px] border border-[var(--color-border)] bg-[var(--color-card)]">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-[13px]">
          {children}
        </table>
      </div>
    </div>
  );
}

export function Thead({ columns }: { columns: string[] }) {
  return (
    <thead>
      <tr className="bg-[var(--color-bg)] text-left text-[11px] font-semibold text-[var(--color-text-muted)]">
        {columns.map((c) => (
          <th key={c} className="px-4 py-3">
            {c}
          </th>
        ))}
      </tr>
    </thead>
  );
}

export function Tr({ children }: { children: React.ReactNode }) {
  return (
    <tr className="border-t border-[var(--color-border)] hover:bg-[var(--color-bg)]">
      {children}
    </tr>
  );
}

export function Td({
  children,
  strong = false,
  mono = false,
  muted = false,
}: {
  children: React.ReactNode;
  strong?: boolean;
  mono?: boolean;
  muted?: boolean;
}) {
  return (
    <td
      className={`px-4 py-3 ${strong ? "font-bold" : ""} ${mono ? "font-mono text-xs" : ""}`}
      style={{ color: muted ? "var(--color-text-muted)" : "var(--color-text)" }}
    >
      {children}
    </td>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div
      className="rounded-[14px] border border-dashed border-[var(--color-border)] p-16 text-center text-[13px]"
      style={{ color: "var(--color-text-faint)" }}
    >
      {message}
    </div>
  );
}
