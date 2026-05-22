"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { AppUserCard } from "@/components/app/AppUserCard";

type AppMobileHeaderProps = {
  userName: string;
  userRole: string;
};

export function AppMobileHeader({ userName, userRole }: AppMobileHeaderProps) {
  const tNav = useTranslations("nav");

  return (
    <header className="flex items-center justify-between border-b border-[var(--card-border)] bg-white/95 px-4 py-3 backdrop-blur-sm sm:hidden">
      <Link
        href="/dashboard"
        className="font-display text-base font-semibold text-[var(--foreground-strong)]"
      >
        {tNav("brand")}
      </Link>
      <AppUserCard name={userName} role={userRole} compact />
    </header>
  );
}
