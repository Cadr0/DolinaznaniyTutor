"use client";

import { useTranslations } from "next-intl";
import { ButtonLink } from "@/components/ui/Button";
import { Link, usePathname } from "@/i18n/navigation";

export function MobileActionBar() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const isAppArea = pathname.startsWith("/dashboard") || pathname.startsWith("/onboarding");

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-[var(--card-border)] bg-white/95 p-2 shadow-[0_-4px_24px_rgba(42,62,71,0.08)] backdrop-blur-sm sm:hidden pb-[max(0.5rem,env(safe-area-inset-bottom))]">
      {isAppArea ? (
        <div className="grid grid-cols-3 items-center gap-2">
          <BottomLink href="/dashboard" label={t("dashboard")} />
          <BottomLink href="/onboarding" label={t("profile")} />
          <BottomLink href="/dashboard" label={t("settings")} />
        </div>
      ) : (
        <div className="grid grid-cols-[1fr_1fr_1.2fr] items-center gap-2">
          <BottomLink href="/register?role=student" label={t("student")} />
          <BottomLink href="/register?role=teacher" label={t("teacher")} />
          <ButtonLink href="/login" className="px-3 text-sm">
            {t("login")}
          </ButtonLink>
        </div>
      )}
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
