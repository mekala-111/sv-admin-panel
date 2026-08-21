import { Card, CardTitle } from "@/components/ui/Card";
import { fetchSettings } from "@/lib/hooks/useAdminSettings";
import { updateSettingAction } from "@/lib/settings";

function toParam(v: string | string[] | undefined): string {
  return Array.isArray(v) ? (v[0] ?? "") : (v ?? "");
}

export default async function SettingsPage(props: PageProps<"/settings">) {
  const sp = await props.searchParams;
  const error = toParam(sp.error);

  const settings = await fetchSettings().catch(() => []);

  return (
    <div>
      <div className="mb-2 text-[22px] font-extrabold text-[var(--color-text)]">
        Settings
      </div>
      <p className="mb-5 text-[13px] text-[var(--color-text-muted)]">
        Generic key-value platform settings. Nothing is seeded by default — keys like{" "}
        <code className="font-mono text-xs">payment.qrImage</code>,{" "}
        <code className="font-mono text-xs">payment.payeeName</code> and{" "}
        <code className="font-mono text-xs">payment.instructions</code> must be created here for
        the vendor event-creation payment flow to show real values.
      </p>

      {error ? (
        <p className="mb-4 text-xs font-semibold text-[var(--color-danger)]" role="alert">
          {error}
        </p>
      ) : null}

      <Card className="mb-5">
        <CardTitle>Existing Settings</CardTitle>
        {settings.length === 0 ? (
          <div className="py-4 text-center text-[13px] text-[var(--color-text-muted)]">No settings configured yet.</div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {settings.map((s) => (
              <div key={s.key} className="rounded-xl border border-[var(--color-border)] p-3.5">
                <div className="mb-1 font-mono text-[13px] font-bold text-[var(--color-text)]">{s.key}</div>
                <div className="mb-2 break-all font-mono text-xs text-[var(--color-text-muted)]">
                  {JSON.stringify(s.value)}
                </div>
                <div className="text-[11px] text-[var(--color-text-faint)]">
                  Updated {new Date(s.updatedAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="max-w-[520px]">
        <CardTitle>Add / Update a Setting</CardTitle>
        <form action={updateSettingAction} className="flex flex-col gap-3.5">
          <div>
            <label htmlFor="key" className="mb-1.5 block text-xs font-semibold text-[var(--color-text-muted)]">
              Key
            </label>
            <input
              id="key"
              name="key"
              required
              placeholder="e.g. payment.qrImage"
              className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2.5 text-[13px] outline-none focus:border-[var(--color-primary)]"
            />
          </div>
          <div>
            <label htmlFor="value" className="mb-1.5 block text-xs font-semibold text-[var(--color-text-muted)]">
              Value (JSON or plain text)
            </label>
            <textarea
              id="value"
              name="value"
              required
              rows={3}
              placeholder='e.g. "https://cdn.svlive.in/qr.png" or true or 42'
              className="w-full resize-none rounded-lg border border-[var(--color-border)] px-3 py-2.5 font-mono text-[13px] outline-none focus:border-[var(--color-primary)]"
            />
          </div>
          <button type="submit" className="w-fit rounded-[9px] bg-[var(--color-primary)] px-5 py-2.5 text-[13px] font-bold text-white">
            Save Setting
          </button>
        </form>
      </Card>
    </div>
  );
}
