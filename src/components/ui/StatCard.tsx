import { Card } from "./Card";

export function StatCard({
  icon,
  iconBg,
  iconFg,
  label,
  value,
  trend,
  trendTone = "success",
}: {
  icon?: React.ReactNode;
  iconBg?: string;
  iconFg?: string;
  label: string;
  value: string | number;
  trend?: string;
  trendTone?: "success" | "danger" | "muted";
}) {
  const trendColor =
    trendTone === "success"
      ? "var(--color-success)"
      : trendTone === "danger"
        ? "var(--color-danger)"
        : "var(--color-text-muted)";

  return (
    <Card>
      {icon && (
        <div
          className="mb-3 flex h-[38px] w-[38px] items-center justify-center rounded-[10px]"
          style={{ background: iconBg, color: iconFg }}
        >
          {icon}
        </div>
      )}
      <div className="mb-1 text-xs text-[var(--color-text-muted)]">
        {label}
      </div>
      <div className="mb-1.5 text-[22px] font-extrabold text-[var(--color-text)]">
        {value}
      </div>
      {trend && (
        <div
          className="flex items-center gap-1 text-xs font-semibold"
          style={{ color: trendColor }}
        >
          {trend}
        </div>
      )}
    </Card>
  );
}
