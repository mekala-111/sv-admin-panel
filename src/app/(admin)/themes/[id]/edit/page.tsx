import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { SideList } from "@/components/ui/Tabs";
import { SlotImage } from "@/components/ui/SlotImage";
import { Toggle } from "@/components/ui/Field";
import { getTheme } from "@/lib/db";

const COMPONENTS = [
  "Hero",
  "Player",
  "Event Details",
  "Gallery",
  "Schedule",
  "Footer",
];

export default async function ThemeEditorPage({
  params,
  searchParams,
}: PageProps<"/themes/[id]/edit">) {
  const { id } = await params;
  const sp = await searchParams;
  const theme = getTheme(Number(id));
  if (!theme) notFound();

  const compParam = Array.isArray(sp.component)
    ? sp.component[0]
    : sp.component;
  const component = COMPONENTS.includes(compParam ?? "")
    ? (compParam as string)
    : "Hero";
  const basePath = `/themes/${id}/edit`;

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/themes"
          className="text-[13px] font-semibold text-[var(--color-text-muted)]"
        >
          &larr; Back to Themes &middot;{" "}
          <span className="font-bold text-[var(--color-text)]">
            {theme.name}
          </span>
        </Link>
        <div className="flex flex-wrap gap-2.5">
          <Button variant="secondary">Save Draft</Button>
          <Button variant="primary">Publish</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:h-[600px] lg:grid-cols-[200px_1fr_260px]">
        <div className="flex flex-col gap-1 rounded-[14px] border border-[var(--color-border)] bg-white p-3.5">
          <div className="mb-2 px-1 text-[11px] font-bold tracking-wide text-[var(--color-text-faint)]">
            COMPONENTS
          </div>
          <SideList
            basePath={basePath}
            paramName="component"
            options={COMPONENTS}
            current={component}
          />
        </div>

        <div className="flex items-center justify-center rounded-[14px] border border-[var(--color-border)] bg-[#F0EEEA] p-6">
          <div className="w-full max-w-[360px] overflow-hidden rounded-[14px] bg-white shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
            <SlotImage
              slotId="theme-editor-hero"
              label="Hero image"
              shape="rect"
              className="h-[140px] w-full"
            />
            <div
              className="p-4 text-white"
              style={{ background: theme.primary }}
            >
              <div className="text-[15px] font-extrabold">
                Rahul &amp; Priya Wedding
              </div>
              <div className="text-[11px] opacity-85">
                May 24, 2025 &middot; 6:00 PM
              </div>
            </div>
            <div className="flex flex-col gap-2.5 p-4">
              <div className="flex h-[70px] items-center justify-center rounded-lg bg-[#252525] text-[11px] text-white">
                &#9654; Live Player
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                <div className="h-11 w-full rounded-md bg-[#F0EEEA]" />
                <div className="h-11 w-full rounded-md bg-[#F0EEEA]" />
                <div className="h-11 w-full rounded-md bg-[#F0EEEA]" />
              </div>
              <div
                className="flex h-[26px] items-center justify-center rounded-md text-[10px] font-bold text-white"
                style={{ background: theme.secondary }}
              >
                RSVP NOW
              </div>
            </div>
            <div className="border-t border-[var(--color-border)] p-2.5 text-center text-[10px] text-[var(--color-text-muted)]">
              Powered by SV Live
            </div>
          </div>
        </div>

        <div className="overflow-y-auto rounded-[14px] border border-[var(--color-border)] bg-white p-[18px]">
          <div className="mb-3.5 text-[11px] font-bold tracking-wide text-[var(--color-text-faint)]">
            PROPERTIES
          </div>
          <PropertiesPanel component={component} theme={theme} />
        </div>
      </div>
    </div>
  );
}

function PropertiesPanel({
  component,
  theme,
}: {
  component: string;
  theme: { primary: string; secondary: string };
}) {
  if (component === "Hero") {
    return (
      <div className="flex flex-col gap-3.5">
        <div>
          <div className="mb-1.5 text-xs font-semibold text-[var(--color-text-muted)]">
            Heading
          </div>
          <div className="rounded-lg border border-[var(--color-border)] px-2.5 py-2 text-[13px] text-[var(--color-text)]">
            Rahul &amp; Priya Wedding
          </div>
        </div>
        <div>
          <div className="mb-1.5 text-xs font-semibold text-[var(--color-text-muted)]">
            Overlay Opacity
          </div>
          <div className="h-1.5 rounded-[3px] bg-[#F0EEEA]">
            <div
              className="h-1.5 w-[45%] rounded-[3px]"
              style={{ background: theme.primary }}
            />
          </div>
        </div>
      </div>
    );
  }
  if (component === "Player") {
    return (
      <div className="flex flex-col gap-3.5">
        <div>
          <div className="mb-1.5 text-xs font-semibold text-[var(--color-text-muted)]">
            Controls Color
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-[var(--color-border)] px-2.5 py-2">
            <span
              className="h-4 w-4 rounded-[4px]"
              style={{ background: theme.primary }}
            />
            <span className="text-[13px] text-[var(--color-text)]">
              {theme.primary}
            </span>
          </div>
        </div>
        <div>
          <div className="mb-1.5 text-xs font-semibold text-[var(--color-text-muted)]">
            Autoplay
          </div>
          <Toggle on />
        </div>
      </div>
    );
  }
  if (component === "Event Details") {
    return (
      <div>
        <div className="mb-1.5 text-xs font-semibold text-[var(--color-text-muted)]">
          Layout
        </div>
        <div className="rounded-lg border border-[var(--color-border)] px-2.5 py-2 text-[13px] text-[var(--color-text)]">
          Centered
        </div>
      </div>
    );
  }
  if (component === "Gallery") {
    return (
      <div>
        <div className="mb-1.5 text-xs font-semibold text-[var(--color-text-muted)]">
          Columns
        </div>
        <div className="rounded-lg border border-[var(--color-border)] px-2.5 py-2 text-[13px] text-[var(--color-text)]">
          3
        </div>
      </div>
    );
  }
  if (component === "Schedule") {
    return (
      <div>
        <div className="mb-1.5 text-xs font-semibold text-[var(--color-text-muted)]">
          Show Countdown
        </div>
        <Toggle on />
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-3.5">
      <div>
        <div className="mb-1.5 text-xs font-semibold text-[var(--color-text-muted)]">
          Footer Text
        </div>
        <div className="rounded-lg border border-[var(--color-border)] px-2.5 py-2 text-[13px] text-[var(--color-text)]">
          Powered by SV Live
        </div>
      </div>
      <div>
        <div className="mb-1.5 text-xs font-semibold text-[var(--color-text-muted)]">
          Show Watermark
        </div>
        <Toggle />
      </div>
    </div>
  );
}
