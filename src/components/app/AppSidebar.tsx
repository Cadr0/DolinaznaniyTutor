"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { AppNavIcon } from "@/components/app/AppNavIcon";
import { AppUserCard } from "@/components/app/AppUserCard";
import { isNavActive, type AppNavItem } from "@/lib/app-nav";

type AppSidebarProps = {
  nav: AppNavItem[];
  userName: string;
  userRole: string;
};

export function AppSidebar({ nav, userName, userRole }: AppSidebarProps) {
  const t = useTranslations("app");
  const tNav = useTranslations("nav");
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col border-r border-[var(--card-border)] bg-white lg:w-64 sm:flex">
      <div className="px-4 pb-2 pt-5">
        <Link
          href="/dashboard"
          className="font-display text-lg font-semibold text-[var(--foreground-strong)]"
        >
          {tNav("brand")}
        </Link>
      </div>

      <nav className="flex flex-col gap-1 px-3">
        {nav.map((item) => {
          const active = isNavActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
                active
                  ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                  : "text-[var(--muted)] hover:bg-[var(--background-soft)] hover:text-[var(--foreground-strong)]"
              }`}
            >
              <AppNavIcon icon={item.iconKey} active={active} />
              <span>{t(item.labelKey)}</span>
            </Link>
          );
        })}
      </nav>

      <div className="flex-1" aria-hidden />

      <div className="p-3">
        <AppUserCard name={userName} role={userRole} />
      </div>
    </aside>
  );
}
