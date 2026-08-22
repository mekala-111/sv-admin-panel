"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { svLiveLogo } from "@/lib/images";
import {
  AnalyticsIcon,
  AuditIcon,
  CustomersIcon,
  DashboardIcon,
  EventsIcon,
  NotificationsIcon,
  PaymentsIcon,
  PricingIcon,
  RecordingsIcon,
  ReportsIcon,
  SettingsIcon,
  SupportIcon,
  ThemesIcon,
  UsersRolesIcon,
  VendorsIcon,
  WalletIcon,
  YoutubeIcon,
} from "../ui/Icons";

type NavItem = {
  label: string;
  href: string;
  icon: (p: { size?: number; color?: string }) => React.ReactNode;
  match: (path: string) => boolean;
  badge?: string;
};

type Section = { title: string; items: NavItem[] };

const SECTIONS: Section[] = [
  {
    title: "MAIN",
    items: [
      {
        label: "Dashboard",
        href: "/dashboard",
        icon: DashboardIcon,
        match: (p) => p === "/dashboard",
      },
    ],
  },
  {
    title: "MANAGEMENT",
    items: [
      {
        label: "Vendors",
        href: "/vendors",
        icon: VendorsIcon,
        match: (p) => p.startsWith("/vendors"),
      },
      {
        label: "Customers",
        href: "/customers",
        icon: CustomersIcon,
        match: (p) => p.startsWith("/customers"),
      },
      {
        label: "Events",
        href: "/events",
        icon: EventsIcon,
        match: (p) => p.startsWith("/events"),
      },
      {
        label: "Themes",
        href: "/themes",
        icon: ThemesIcon,
        match: (p) => p.startsWith("/themes"),
      },
    ],
  },
  {
    title: "STREAMING",
    items: [
      {
        label: "YouTube",
        href: "/youtube",
        icon: YoutubeIcon,
        match: (p) => p.startsWith("/youtube"),
      },
      {
        label: "Recordings",
        href: "/recordings",
        icon: RecordingsIcon,
        match: (p) => p.startsWith("/recordings"),
      },
    ],
  },
  {
    title: "FINANCE",
    items: [
      {
        label: "Payments",
        href: "/payments",
        icon: PaymentsIcon,
        match: (p) => p.startsWith("/payments"),
      },
      {
        label: "Wallets",
        href: "/wallet",
        icon: WalletIcon,
        match: (p) => p.startsWith("/wallet"),
      },
      {
        label: "Pricing & Plans",
        href: "/pricing",
        icon: PricingIcon,
        match: (p) => p.startsWith("/pricing"),
      },
    ],
  },
  {
    title: "INSIGHTS",
    items: [
      {
        label: "Analytics",
        href: "/analytics",
        icon: AnalyticsIcon,
        match: (p) => p.startsWith("/analytics"),
      },
      {
        label: "Reports",
        href: "/reports",
        icon: ReportsIcon,
        match: (p) => p.startsWith("/reports"),
      },
    ],
  },
  {
    title: "COMMUNICATION",
    items: [
      {
        label: "Notifications",
        href: "/notifications",
        icon: NotificationsIcon,
        match: (p) => p.startsWith("/notifications"),
      },
      {
        label: "Support Tickets",
        href: "/support",
        icon: SupportIcon,
        match: (p) => p.startsWith("/support"),
      },
    ],
  },
  {
    title: "SYSTEM",
    items: [
      {
        label: "Users & Roles",
        href: "/users-roles",
        icon: UsersRolesIcon,
        match: (p) => p.startsWith("/users-roles"),
      },
      {
        label: "Settings",
        href: "/settings",
        icon: SettingsIcon,
        match: (p) => p.startsWith("/settings"),
      },
      {
        label: "Audit Logs",
        href: "/audit-logs",
        icon: AuditIcon,
        match: (p) => p.startsWith("/audit-logs"),
      },
    ],
  },
];

function closeNav() {
  const el = document.getElementById("admin-nav");
  if (el instanceof HTMLInputElement) el.checked = false;
}

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div>
      <div className="flex items-center gap-2.5 border-b border-[var(--color-border)] px-5 py-[18px] pt-[22px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={svLiveLogo}
          alt="SV Live"
          className="h-9 w-9 rounded-[10px] object-cover"
        />
        <div>
          <div className="text-[17px] font-extrabold tracking-wide text-[var(--color-text)]">
            SV LIVE
          </div>
          <div className="text-[10px] font-bold tracking-[1.5px] text-[var(--color-text-muted)]">
            EVENTS
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-[22px] p-3">
        {SECTIONS.map((section) => (
          <div key={section.title}>
            <div className="px-2.5 pb-2 text-[11px] font-bold tracking-wide text-[var(--color-text-faint)]">
              {section.title}
            </div>
            {section.items.map((item) => {
              const active = item.match(pathname);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeNav}
                  className="mb-0.5 flex w-full items-center gap-2.5 rounded-[9px] px-3 py-2.5 text-left text-[13.5px]"
                  style={{
                    background: active ? "#FFF0E1" : "transparent",
                    color: active ? "var(--color-primary)" : "#5C5C5C",
                    fontWeight: active ? 700 : 600,
                  }}
                >
                  {item.icon({
                    size: 18,
                    color: active ? "var(--color-primary)" : "#5C5C5C",
                  })}
                  {item.label}
                  {item.badge && (
                    <span className="ml-auto rounded-full bg-[#FFF0E1] px-[7px] py-[1px] text-[11px] font-bold text-[var(--color-primary)]">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
