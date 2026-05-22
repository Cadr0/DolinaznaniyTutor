"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";

const APP_ROUTES = ["/dashboard"];

function isAppRoute(pathname: string) {
  return APP_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

export function MobileActionBar() {
  const t = useTranslations("nav");
  const pathname = usePathname();

  if (!isAppRoute(pathname)) {
    return null;
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-[var(--card-border)] bg-white/95 p-2 shadow-[0_-4px_24px_rgba(42,62,71,0.08)] backdrop-blur-sm sm:hidden pb-[max(0.5rem,env(safe-area-inset-bottom))]">
      <div className="grid grid-cols-3 items-center gap-2">
        <BottomLink href="/dashboard" label={t("dashboard")} />
        <BottomLink href="/dashboard" label={t("profile")} />
        <BottomLink href="/dashboard" label={t("settings")} />
      </div>
    </div>
  );
}

function BottomLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="touch-target inline-flex items-center justify-center rounded-full bg-[var(--background-soft)] px-3 text-sm font-semibold text-[var(--foreground-strong)]"
    >
      {label}
    </Link>
  );
}

export function useMobileAppBarVisible() {
  const pathname = usePathname();
  return isAppRoute(pathname);
}
