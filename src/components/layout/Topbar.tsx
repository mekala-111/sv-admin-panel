"use client";

import Link from "next/link";
import { SlotImage } from "../ui/SlotImage";
import {
  ChevronDownIcon,
  MenuIcon,
  NotificationsIcon,
  SearchIcon,
  SupportIcon,
} from "../ui/Icons";

export function Topbar() {
  return (
    <div className="flex h-[60px] shrink-0 items-center justify-between gap-3 border-b border-[var(--color-border)] bg-[var(--color-card)] px-4 md:h-[72px] md:gap-5 md:px-7">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <label
          htmlFor="admin-nav"
          aria-label="Open menu"
          className="shrink-0 cursor-pointer rounded-lg p-1.5 text-[var(--color-text)] lg:hidden"
        >
          <MenuIcon size={22} />
        </label>
        <div className="flex min-w-0 max-w-[340px] flex-1 items-center gap-2 rounded-[10px] border border-[var(--color-border)] bg-[var(--color-bg)] px-3.5 py-2.5">
          <SearchIcon size={17} color="#707070" />
          <span className="truncate text-sm text-[var(--color-text-faint)]">
            Search here...
          </span>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-3 md:gap-[22px]">
        <div className="relative text-[var(--color-text-muted)]">
          <NotificationsIcon size={21} />
          <span className="absolute -right-2 -top-1.5 rounded-lg bg-[var(--color-secondary)] px-[5px] text-[10px] font-bold text-white">
            12
          </span>
        </div>
        <SupportIcon size={21} color="#707070" />
        <div className="hidden h-[26px] w-px bg-[var(--color-border)] sm:block" />
        <Link href="/profile" className="flex items-center gap-2.5">
          <SlotImage
            slotId="admin-avatar"
            label="photo"
            shape="circle"
            className="h-[38px] w-[38px]"
          />
          <div className="hidden text-left md:block">
            <div className="text-[13px] font-bold text-[var(--color-text)]">
              Super Admin
            </div>
            <div className="text-[11px] text-[var(--color-text-muted)]">
              Super Admin
            </div>
          </div>
          <ChevronDownIcon size={14} className="hidden sm:block" />
        </Link>
      </div>
    </div>
  );
}
