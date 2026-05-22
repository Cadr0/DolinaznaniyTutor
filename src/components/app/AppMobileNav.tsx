"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { isNavActive, type AppNavItem } from "@/lib/app-nav";

type AppMobileNavProps = {
  nav: AppNavItem[];
};

export function AppMobileNav({ nav }: AppMobileNavProps) {
  const t = useTranslations("app");
  const pathname = usePathname();
  const columns = Math.min(nav.length, 6);

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--card-border)] bg-white/95 p-2 shadow-[0_-4px_24px_rgba(42,62,71,0.08)] backdrop-blur-sm sm:hidden pb-[max(0.5rem,env(safe-area-inset-bottom))]">
      <div
        className="grid items-center gap-1"
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      >
        {nav.map((item) => {
          const active = isNavActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`touch-target inline-flex items-center justify-center rounded-full px-1 py-2 text-center text-[11px] font-semibold leading-tight ${
                active
                  ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                  : "text-[var(--muted)]"
              }`}
            >
              {t(item.labelKey)}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
