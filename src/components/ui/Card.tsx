export function Card({
  children,
  className = "",
  padded = true,
}: {
  children: React.ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return (
    <div
      className={`rounded-[14px] border border-[var(--color-border)] bg-[var(--color-card)] shadow-[0_1px_2px_rgba(0,0,0,0.03)] ${
        padded ? "p-5" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}

export function CardTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-3.5 text-[15px] font-bold text-[var(--color-text)]">
      {children}
    </div>
  );
}
