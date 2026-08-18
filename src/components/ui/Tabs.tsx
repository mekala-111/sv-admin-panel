import Link from "next/link";

function withParam(basePath: string, paramName: string, value: string) {
  const params = new URLSearchParams();
  params.set(paramName, value);
  return `${basePath}?${params.toString()}`;
}

/** Underlined tab row (matches vendor/customer/event detail tabs). */
export function Tabs({
  basePath,
  paramName = "tab",
  options,
  current,
}: {
  basePath: string;
  paramName?: string;
  options: string[];
  current: string;
}) {
  return (
    <div className="mb-5 flex gap-1.5 overflow-x-auto border-b border-[var(--color-border)]">
      {options.map((name) => {
        const active = name === current;
        return (
          <Link
            key={name}
            href={withParam(basePath, paramName, name)}
            className="shrink-0 rounded-t-lg border-b-2 px-4 py-2.5 text-[13px] font-semibold"
            style={{
              color: active ? "var(--color-primary)" : "var(--color-text-muted)",
              borderBottomColor: active ? "var(--color-primary)" : "transparent",
              fontWeight: active ? 700 : 600,
            }}
          >
            {name}
          </Link>
        );
      })}
    </div>
  );
}

/** Pill-shaped filter row (matches events/payments/notifications filters). */
export function PillTabs({
  basePath,
  paramName = "tab",
  options,
  current,
  extraParams,
}: {
  basePath: string;
  paramName?: string;
  options: string[];
  current: string;
  extraParams?: Record<string, string>;
}) {
  return (
    <div className="mb-4 flex flex-wrap gap-1.5">
      {options.map((name) => {
        const active = name === current;
        const params = new URLSearchParams(extraParams);
        params.set(paramName, name);
        return (
          <Link
            key={name}
            href={`${basePath}?${params.toString()}`}
            className="rounded-lg px-4 py-2 text-[13px] font-semibold"
            style={{
              background: active ? "var(--color-primary)" : "#fff",
              color: active ? "#fff" : "var(--color-text-muted)",
              border: active ? "none" : "1px solid var(--color-border)",
            }}
          >
            {name}
          </Link>
        );
      })}
    </div>
  );
}

/** Vertical sidebar-style list (matches Settings sections / theme editor components). */
export function SideList({
  basePath,
  paramName,
  options,
  current,
}: {
  basePath: string;
  paramName: string;
  options: string[];
  current: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      {options.map((name) => {
        const active = name === current;
        return (
          <Link
            key={name}
            href={withParam(basePath, paramName, name)}
            className="rounded-[9px] px-3.5 py-2.5 text-left text-[13px]"
            style={{
              background: active ? "#FFF0E1" : "transparent",
              color: active ? "var(--color-primary)" : "#5C5C5C",
              fontWeight: active ? 700 : 600,
            }}
          >
            {name}
          </Link>
        );
      })}
    </div>
  );
}
