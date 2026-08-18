import { SideList } from "@/components/ui/Tabs";
import { SlotImage } from "@/components/ui/SlotImage";
import { FieldDisplay, Toggle } from "@/components/ui/Field";

const SECTIONS = [
  "General",
  "Branding",
  "Streaming",
  "Recording",
  "Payment",
  "Email",
  "Security",
  "Notifications",
];

export default async function SettingsPage({
  searchParams,
}: PageProps<"/settings">) {
  const sp = await searchParams;
  const secParam = Array.isArray(sp.section) ? sp.section[0] : sp.section;
  const section = SECTIONS.includes(secParam ?? "") ? (secParam as string) : "General";

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
        <SectionPanel section={section} />
      </div>
    </div>
  );
}

function SectionPanel({ section }: { section: string }) {
  if (section === "General") {
    return (
      <div>
        <div className="mb-4 text-[15px] font-bold text-[var(--color-text)]">
          General
        </div>
        <div className="mb-4 flex gap-4">
          <SlotImage
            slotId="settings-logo"
            label="Logo"
            shape="rounded"
            radius={12}
            className="h-16 w-16"
          />
          <SlotImage
            slotId="settings-favicon"
            label="Favicon"
            shape="rounded"
            radius={12}
            className="h-16 w-16"
          />
        </div>
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          <FieldDisplay label="Platform Name" value="SV Live" />
          <FieldDisplay label="Contact Email" value="support@svlive.in" />
        </div>
      </div>
    );
  }

  if (section === "Branding") {
    return (
      <div>
        <div className="mb-4 text-[15px] font-bold text-[var(--color-text)]">
          Branding
        </div>
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          <FieldDisplay
            label="Primary Color"
            value={
              <span className="flex items-center gap-2">
                <span className="h-[18px] w-[18px] rounded-[5px] bg-[#FF7A00]" />
                #FF7A00
              </span>
            }
          />
          <FieldDisplay
            label="Secondary Color"
            value={
              <span className="flex items-center gap-2">
                <span className="h-[18px] w-[18px] rounded-[5px] bg-[#F52222]" />
                #F52222
              </span>
            }
          />
          <FieldDisplay label="Typography" value="Helvetica" />
        </div>
      </div>
    );
  }

  if (section === "Streaming") {
    return (
      <div>
        <div className="mb-4 text-[15px] font-bold text-[var(--color-text)]">
          Streaming
        </div>
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          <FieldDisplay label="RTMP URL" value="rtmp://ingest.svlive.in/live" mono />
          <FieldDisplay label="HLS URL" value="https://cdn.svlive.in/hls" mono />
          <FieldDisplay label="CDN Provider" value="CloudFront" />
        </div>
      </div>
    );
  }

  if (section === "Recording") {
    return (
      <div>
        <div className="mb-4 text-[15px] font-bold text-[var(--color-text)]">
          Recording
        </div>
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          <FieldDisplay label="Storage Retention" value="90 days" />
          <FieldDisplay label="Default Resolution" value="1080p" />
        </div>
      </div>
    );
  }

  if (section === "Payment") {
    return (
      <div>
        <div className="mb-4 text-[15px] font-bold text-[var(--color-text)]">
          Payment
        </div>
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          <FieldDisplay label="Razorpay Key ID" value="rzp_live_••••••3F2A" mono />
          <FieldDisplay label="Currency" value="INR (₹)" />
        </div>
      </div>
    );
  }

  if (section === "Email") {
    return (
      <div>
        <div className="mb-4 text-[15px] font-bold text-[var(--color-text)]">
          Email
        </div>
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          <FieldDisplay label="SMTP Host" value="smtp.svlive.in" />
          <FieldDisplay label="From Address" value="no-reply@svlive.in" />
        </div>
      </div>
    );
  }

  if (section === "Security") {
    return (
      <div>
        <div className="mb-4 text-[15px] font-bold text-[var(--color-text)]">
          Security
        </div>
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          <FieldDisplay label="Session Timeout" value="30 minutes" />
          <FieldDisplay label="Login Attempts Limit" value="5 attempts" />
          <div>
            <div className="mb-1.5 text-xs font-semibold text-[var(--color-text-muted)]">
              Two-Factor Authentication
            </div>
            <Toggle on />
          </div>
        </div>
      </div>
    );
  }

  // Notifications
  return (
    <div>
      <div className="mb-4 text-[15px] font-bold text-[var(--color-text)]">
        Notifications
      </div>
      <div className="flex flex-col gap-3">
        {[
          { label: "Email", on: true },
          { label: "SMS", on: false },
          { label: "WhatsApp", on: true },
          { label: "Push", on: false },
        ].map((row) => (
          <div key={row.label} className="flex items-center justify-between">
            <span className="text-[13px] text-[var(--color-text)]">{row.label}</span>
            <Toggle on={row.on} />
          </div>
        ))}
      </div>
    </div>
  );
}
