export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <div className="text-[22px] font-extrabold text-[var(--color-text)]">
          {title}
        </div>
        {subtitle && (
          <div className="mt-1 text-[13px] text-[var(--color-text-muted)]">
            {subtitle}
          </div>
        )}
      </div>
      {actions && <div className="flex flex-wrap gap-2.5">{actions}</div>}
    </div>
  );
}
