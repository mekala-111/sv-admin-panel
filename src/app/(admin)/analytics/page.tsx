import { Card } from "@/components/ui/Card";
import { PillTabs } from "@/components/ui/Tabs";
import { EmptyState } from "@/components/ui/Table";
import { getAnalyticsBreakdown, getAnalyticsStats } from "@/lib/db";

const TABS = ["Platform", "Vendors", "Events", "Geographic", "Devices"];

export default async function AnalyticsPage({
  searchParams,
}: PageProps<"/analytics">) {
  const sp = await searchParams;
  const tabParam = Array.isArray(sp.tab) ? sp.tab[0] : sp.tab;
  const tab = TABS.includes(tabParam ?? "") ? (tabParam as string) : "Platform";

  const stats = await getAnalyticsStats(tab);
  const breakdown = await getAnalyticsBreakdown(tab);
  const breakdownTotal = breakdown.reduce((sum, b) => sum + b.value, 0) || 1;

  return (
    <div>
      <div className="mb-4 text-[22px] font-extrabold text-[var(--color-text)]">
        Analytics
      </div>
      <PillTabs basePath="/analytics" options={TABS} current={tab} />

      {stats.length === 0 ? (
        <EmptyState message="No analytics data yet." />
      ) : (
        <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {stats.map((s) => (
            <Card key={s.label}>
              <div className="mb-1.5 text-xs text-[var(--color-text-muted)]">
                {s.label}
              </div>
              <div className="text-xl font-extrabold text-[var(--color-text)]">
                {s.value}
              </div>
            </Card>
          ))}
        </div>
      )}

      {breakdown.length === 0 ? (
        <EmptyState message="No breakdown available for this view." />
      ) : (
        <Card>
          <div className="mb-4 text-[14px] font-bold text-[var(--color-text)]">
            Breakdown
          </div>
          <div className="flex flex-col gap-3.5">
            {breakdown.map((b) => {
              const pct = Math.round((b.value / breakdownTotal) * 100);
              return (
                <div key={b.label}>
                  <div className="mb-1.5 flex justify-between text-[13px] text-[var(--color-text)]">
                    <span>{b.label}</span>
                    <span className="font-semibold">{pct}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-[#F0EEEA]">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)]"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}
