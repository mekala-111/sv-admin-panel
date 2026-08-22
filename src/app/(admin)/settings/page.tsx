import { SideList } from "@/components/ui/Tabs";
import { FieldDisplay } from "@/components/ui/Field";
import { EmptyState } from "@/components/ui/Table";
import { getPaymentSettings, listSettingsMap } from "@/lib/db";
import { PaymentSettingsForm } from "./PaymentSettingsForm";

const SECTIONS = ["General", "Streaming", "Payment", "Email", "Security", "Notifications"];

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const secParam = Array.isArray(sp.section) ? sp.section[0] : sp.section;
  const section = SECTIONS.includes(secParam ?? "") ? (secParam as string) : "General";
  const saved = Array.isArray(sp.saved) ? sp.saved[0] : sp.saved;
  const error = Array.isArray(sp.error) ? sp.error[0] : sp.error;

  if (section === "Payment") {
    const payment = await getPaymentSettings();
    return (
      <div className="flex flex-col gap-4 lg:flex-row lg:gap-5">
        <div className="w-full shrink-0 lg:w-[200px]">
          <SideList
            basePath="/settings"
            paramName="section"
            options={SECTIONS}
            current={section}
          />
        </div>
        <div className="flex-1 rounded-[14px] border border-[var(--color-border)] bg-white p-6">
          <div className="mb-4 text-[15px] font-bold text-[var(--color-text)]">Payment</div>
          {saved ? (
            <div className="mb-4 rounded-[10px] border border-[#B7E4C7] bg-[#E8F8EF] px-4 py-3 text-[13px] font-semibold text-[#1B7A3D]">
              Payment settings saved.
            </div>
          ) : null}
          {error ? (
            <div className="mb-4 rounded-[10px] border border-[var(--color-danger)] bg-[#FDEAEA] px-4 py-3 text-[13px] font-semibold text-[var(--color-danger)]">
              Could not save payment settings. Try again.
            </div>
          ) : null}
          <PaymentSettingsForm
            payeeName={payment.payeeName}
            qrImage={payment.qrImage}
            instructions={payment.instructions}
          />
        </div>
      </div>
    );
  }

  const settings = await listSettingsMap();
  const entries = Object.entries(settings);
  const filtered =
    section === "General"
      ? entries
      : entries.filter(([k]) => k.toLowerCase().includes(section.toLowerCase()));

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:gap-5">
      <div className="w-full shrink-0 lg:w-[200px]">
        <SideList
          basePath="/settings"
          paramName="section"
          options={SECTIONS}
          current={section}
        />
      </div>
      <div className="flex-1 rounded-[14px] border border-[var(--color-border)] bg-white p-6">
        <div className="mb-4 text-[15px] font-bold text-[var(--color-text)]">{section}</div>
        {filtered.length === 0 ? (
          <EmptyState message="No settings stored in the database for this section yet." />
        ) : (
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            {filtered.map(([key, value]) => (
              <FieldDisplay
                key={key}
                label={key}
                value={typeof value === "string" ? value : JSON.stringify(value)}
                mono={typeof value !== "string"}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
