type IconProps = { size?: number; color?: string; className?: string };

function Svg({
  size = 18,
  color = "currentColor",
  className,
  children,
}: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={1.6}
      className={className}
    >
      {children}
    </svg>
  );
}

export const DashboardIcon = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3" y="3" width="8" height="8" rx="2" />
    <rect x="13" y="3" width="8" height="5" rx="2" />
    <rect x="13" y="10" width="8" height="11" rx="2" />
    <rect x="3" y="13" width="8" height="8" rx="2" />
  </Svg>
);

export const VendorsIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3 9l1-5h16l1 5" />
    <path d="M4 9v10h16V9" />
    <path d="M9 19v-6h6v6" />
  </Svg>
);

export const CustomersIcon = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="9" cy="8" r="3" />
    <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
    <circle cx="17" cy="9" r="2.5" />
    <path d="M15.5 14a5 5 0 0 1 5.5 6" />
  </Svg>
);

export const EventsIcon = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <path d="M3 10h18" />
    <path d="M8 3v4M16 3v4" />
  </Svg>
);

export const ThemesIcon = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3" y="3" width="18" height="18" rx="3" />
    <path d="M3 15h18M9 9v12" />
  </Svg>
);

export const YoutubeIcon = (p: IconProps) => (
  <Svg {...p}>
    <rect x="2" y="5" width="20" height="14" rx="4" />
    <path d="M10 9l5 3-5 3z" fill={p.color ?? "currentColor"} stroke="none" />
  </Svg>
);

export const RecordingsIcon = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="2.5" />
  </Svg>
);

export const PaymentsIcon = (p: IconProps) => (
  <Svg {...p}>
    <rect x="2" y="5" width="20" height="14" rx="2" />
    <path d="M2 10h20" />
  </Svg>
);

export const WalletIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3 7h15a3 3 0 0 1 3 3v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" />
    <path d="M16 12h4" />
  </Svg>
);

export const PricingIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3 12l8-8h6a2 2 0 0 1 2 2v6l-8 8a2 2 0 0 1-2.8 0l-5.2-5.2a2 2 0 0 1 0-2.8z" />
    <circle cx="9" cy="9" r="1.5" />
  </Svg>
);

export const AnalyticsIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M5 20V10M12 20V4M19 20v-7M2 20h20" />
  </Svg>
);

export const ReportsIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M6 2h9l5 5v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" />
    <path d="M14 2v6h6" />
  </Svg>
);

export const NotificationsIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M6 10a6 6 0 1 1 12 0c0 4 1.5 5 1.5 6H4.5C4.5 15 6 14 6 10z" />
    <path d="M10 20a2 2 0 0 0 4 0" />
  </Svg>
);

export const SupportIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 12a8 8 0 1 1 16 0v5" />
    <rect x="3" y="12" width="4" height="6" rx="1.5" />
    <rect x="17" y="12" width="4" height="6" rx="1.5" />
  </Svg>
);

export const UsersRolesIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 2l8 3v6c0 5-3.5 8.5-8 11-4.5-2.5-8-6-8-11V5z" />
  </Svg>
);

export const SettingsIcon = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="3" />
    <path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" />
  </Svg>
);

export const AuditIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M9 4h11M9 12h11M9 20h11" />
    <circle cx="4" cy="4" r="1.4" />
    <circle cx="4" cy="12" r="1.4" />
    <circle cx="4" cy="20" r="1.4" />
  </Svg>
);

export const SearchIcon = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="M21 21l-4.3-4.3" />
  </Svg>
);

export const ChevronDownIcon = (p: IconProps) => (
  <Svg {...p} color={p.color ?? "#707070"}>
    <path d="M6 9l6 6 6-6" />
  </Svg>
);

export const CalendarClockIcon = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 3" />
  </Svg>
);

export const RevenueIcon = (p: IconProps) => (
  <Svg {...p}>
    <rect x="2" y="5" width="20" height="14" rx="2" />
    <path d="M2 10h20" />
  </Svg>
);

export const LiveIcon = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3" y="6" width="13" height="12" rx="2" />
    <path d="M16 10l5-3v10l-5-3" />
  </Svg>
);

export const MenuIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </Svg>
);
