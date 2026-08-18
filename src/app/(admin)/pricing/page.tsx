import Link from "next/link";
import { Card, CardTitle } from "@/components/ui/Card";
import { listPlans } from "@/lib/db";

export default async function PricingPage({
  searchParams,
}: PageProps<"/pricing">) {
  const sp = await searchParams;
  const planParam = Array.isArray(sp.plan) ? sp.plan[0] : sp.plan;
  const plans = listPlans();
  const selected =
    plans.find((p) => p.name === planParam) ??
    plans.find((p) => p.name === "Professional") ??
    plans[0];

  return (
    <div>
      <div className="mb-5 text-[22px] font-extrabold text-[var(--color-text)]">
        Pricing &amp; Plans
      </div>

      <div className="mb-6 grid grid-cols-1 gap-[18px] sm:grid-cols-2 lg:grid-cols-3">
        {plans.map((p) => {
          const active = p.name === selected.name;
          return (
            <Link
              key={p.name}
              href={`/pricing?plan=${encodeURIComponent(p.name)}`}
              className="rounded-[14px] bg-white p-[22px]"
              style={{
                border: active
                  ? "2px solid var(--color-primary)"
                  : "1px solid var(--color-border)",
              }}
            >
              <div className="mb-1 text-[15px] font-bold text-[var(--color-text)]">
                {p.name}
              </div>
              <div className="mb-3.5 text-[22px] font-extrabold text-[var(--color-primary)]">
                {p.price}
              </div>
              <div className="flex flex-col gap-2 text-xs text-[var(--color-text-muted)]">
                <div>
                  Events:{" "}
                  <span className="font-semibold text-[var(--color-text)]">
                    {p.eventLimit}
                  </span>
                </div>
                <div>
                  Streaming:{" "}
                  <span className="font-semibold text-[var(--color-text)]">
                    {p.hours}
                  </span>
                </div>
                <div>
                  Storage:{" "}
                  <span className="font-semibold text-[var(--color-text)]">
                    {p.storage}
                  </span>
                </div>
                <div>
                  Viewers:{" "}
                  <span className="font-semibold text-[var(--color-text)]">
                    {p.viewerLimit}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <Card>
        <CardTitle>Configure &mdash; {selected.name}</CardTitle>
        <div className="grid grid-cols-1 gap-3.5 text-[13px] sm:grid-cols-2 lg:grid-cols-3">
          <ConfigField label="Event Price / Limit" value={selected.eventLimit} />
          <ConfigField label="Streaming Hours" value={selected.hours} />
          <ConfigField label="Storage" value={selected.storage} />
          <ConfigField label="Viewer Limit" value={selected.viewerLimit} />
          <ConfigField label="Recording" value={selected.recording} />
          <ConfigField label="Branding" value={selected.branding} />
          <ConfigField label="Support" value={selected.support} />
        </div>
      </Card>
    </div>
  );
}

function ConfigField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="mb-1 text-[var(--color-text-muted)]">{label}</div>
      <div className="font-semibold text-[var(--color-text)]">{value}</div>
    </div>
  );
}
