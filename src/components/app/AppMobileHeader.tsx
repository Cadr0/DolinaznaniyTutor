"use client";

import { AppUserCard } from "@/components/app/AppUserCard";

type AppMobileHeaderProps = {
  userName: string;
  userRole: string;
};

function NotificationIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 4.5a4.5 4.5 0 0 0-4.5 4.5v2.8l-1.4 2.1a1 1 0 0 0 .83 1.55h10.14a1 1 0 0 0 .83-1.55l-1.4-2.1V9a4.5 4.5 0 0 0-4.5-4.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M10 18.5a2 2 0 0 0 4 0"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function AppMobileHeader({ userName, userRole }: AppMobileHeaderProps) {
  return (
    <header className="flex items-center justify-between gap-3 border-b border-[var(--card-border)] bg-white/95 px-4 py-3 backdrop-blur-sm sm:hidden">
      <AppUserCard name={userName} role={userRole} compact showRole />
      <button
        type="button"
        aria-label="Уведомления"
        className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[var(--card-border)] bg-[var(--background)] text-[var(--muted)]"
        disabled
      >
        <NotificationIcon />
      </button>
    </header>
  );
}
