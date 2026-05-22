"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { AppNavIcon } from "@/components/app/AppNavIcon";
import { isNavActive, type AppNavItem } from "@/lib/app-nav";

type AppMobileNavProps = {
  nav: AppNavItem[];
};

export function AppMobileNav({ nav }: AppMobileNavProps) {
  const t = useTranslations("app");
  const pathname = usePathname();
  const columns = Math.min(nav.length, 6);

  return (
    <nav
      aria-label="Навигация"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--card-border)] bg-white/95 px-2 py-2 shadow-[0_-4px_24px_rgba(42,62,71,0.08)] backdrop-blur-sm sm:hidden pb-[max(0.35rem,env(safe-area-inset-bottom))]"
    >
      <div
        className="grid items-center gap-1"
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      >
        {nav.map((item) => {
          const active = isNavActive(pathname, item.href);
          const label = t(item.labelKey);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={label}
              aria-current={active ? "page" : undefined}
              title={label}
              className={`touch-target inline-flex flex-col items-center justify-center gap-1 rounded-2xl px-1 py-2 ${
                active
                  ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                  : "text-[var(--muted)]"
              }`}
            >
              <AppNavIcon icon={item.iconKey} active={active} />
              <span className="sr-only">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
