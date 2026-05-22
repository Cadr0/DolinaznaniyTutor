"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { ButtonLink } from "@/components/ui/Button";

function matchesRoute(pathname: string, route: string) {
  return pathname === route || pathname.startsWith(`${route}/`);
}

export function HeaderActions() {
  const t = useTranslations("nav");
  const pathname = usePathname();

  const showRegisterLink = matchesRoute(pathname, "/login");
  const showLoginLink = matchesRoute(pathname, "/register");

  return (
    <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
      {showRegisterLink ? (
        <Link
          href="/register"
          className="text-xs font-semibold text-[var(--accent)] sm:hidden"
        >
          {t("start")}
        </Link>
      ) : null}
      {showLoginLink ? (
        <Link
          href="/login"
          className="text-xs font-semibold text-[var(--muted)] sm:hidden"
        >
          {t("login")}
        </Link>
      ) : null}

      <LanguageSwitcher />

      <div className="hidden items-center gap-2 sm:flex sm:gap-3">
        <ButtonLink href="/login" variant="ghost" className="px-4">
          {t("login")}
        </ButtonLink>
        <ButtonLink href="/register" className="px-5 sm:px-6">
          {t("start")}
        </ButtonLink>
      </div>
    </div>
  );
}
