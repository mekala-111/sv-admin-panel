import { Card } from "@/components/ui/Card";
import { fetchAdminAnalytics } from "@/lib/hooks/useAdminOverview";
import { fetchEventsSummary, fetchTopVendors } from "@/lib/hooks/useAdminReports";

function statusLabel(status: string): string {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

export default async function AnalyticsPage() {
  const [analytics, eventsSummary, topVendors] = await Promise.all([
    fetchAdminAnalytics().catch(() => null),
    fetchEventsSummary().catch(() => []),
    fetchTopVendors().catch(() => []),
  ]);

  const totalEvents = eventsSummary.reduce((s, e) => s + e.count, 0) || 1;

  return (
    <div>
      <div className="mb-1 text-[22px] font-extrabold text-[var(--color-text)]">Analytics</div>
      <p className="mb-4 text-[13px] text-[var(--color-text-muted)]">
        All-time platform totals — the backend&apos;s analytics endpoint doesn&apos;t support a date range yet.
      </p>

      {!analytics ? (
        <div className="rounded-[14px] border border-[var(--color-border)] bg-white p-8 text-center text-[13px] text-[var(--color-text-muted)]">
          Couldn&apos;t load analytics.
        </div>
      ) : (
        <>
          <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Card>
              <div className="mb-1.5 text-xs text-[var(--color-text-muted)]">Vendors</div>
              <div className="text-xl font-extrabold text-[var(--color-text)]">{analytics.vendors}</div>
            </Card>
            <Card>
              <div className="mb-1.5 text-xs text-[var(--color-text-muted)]">Customers</div>
              <div className="text-xl font-extrabold text-[var(--color-text)]">{analytics.customers}</div>
            </Card>
            <Card>
              <div className="mb-1.5 text-xs text-[var(--color-text-muted)]">Events</div>
              <div className="text-xl font-extrabold text-[var(--color-text)]">{analytics.events}</div>
            </Card>
            <Card>
              <div className="mb-1.5 text-xs text-[var(--color-text-muted)]">Live Now</div>
              <div className="text-xl font-extrabold text-[var(--color-danger)]">{analytics.liveEvents}</div>
            </Card>
          </div>

          <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Card>
              <div className="mb-1.5 text-xs text-[var(--color-text-muted)]">Total Revenue</div>
              <div className="text-2xl font-extrabold text-[var(--color-text)]">
                ₹{analytics.revenue.toLocaleString("en-IN")}
              </div>
            </Card>
            <Card>
              <div className="mb-1.5 text-xs text-[var(--color-text-muted)]">Successful Payments</div>
              <div className="text-2xl font-extrabold text-[var(--color-text)]">{analytics.successfulPayments}</div>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card>
              <div className="mb-4 text-[14px] font-bold text-[var(--color-text)]">Events by Status</div>
              <div className="flex flex-col gap-3.5">
                {eventsSummary.length === 0 ? (
                  <div className="text-[13px] text-[var(--color-text-muted)]">No events yet.</div>
                ) : (
                  eventsSummary.map((e) => {
                    const pct = Math.round((e.count / totalEvents) * 100);
                    return (
                      <div key={e.status}>
                        <div className="mb-1.5 flex justify-between text-[13px] text-[var(--color-text)]">
                          <span>{statusLabel(e.status)}</span>
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
                  })
                )}
              </div>
            </Card>

            <Card>
              <div className="mb-4 text-[14px] font-bold text-[var(--color-text)]">Top Vendors by Events</div>
              {topVendors.length === 0 ? (
                <div className="text-[13px] text-[var(--color-text-muted)]">No vendor activity yet.</div>
              ) : (
                <div className="flex flex-col gap-2.5">
                  {topVendors.map((v, i) => (
                    <div key={v.vendorId} className="flex items-center justify-between text-[13px]">
                      <span className="text-[var(--color-text)]">
                        {i + 1}. {v.companyName ?? v.vendorId}
                      </span>
                      <span className="font-semibold text-[var(--color-text-muted)]">{v.eventCount} events</span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
