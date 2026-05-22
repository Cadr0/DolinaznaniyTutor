"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";

export function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("lang");

  function switchLocale(next: Locale) {
    router.replace(pathname, { locale: next });
  }

  return (
    <div
      className="flex items-center gap-1 text-xs text-[var(--muted)]"
      role="group"
      aria-label="Language"
    >
      {routing.locales.map((loc, index) => (
        <span key={loc} className="inline-flex items-center gap-1">
          {index > 0 ? (
            <span className="text-[var(--card-border)]" aria-hidden>
              /
            </span>
          ) : null}
          <button
            type="button"
            onClick={() => switchLocale(loc)}
            className={`rounded px-1 py-0.5 font-medium transition-colors hover:text-[var(--foreground-strong)] ${
              locale === loc
                ? "text-[var(--foreground-strong)]"
                : "text-[var(--muted)]"
            }`}
            aria-pressed={locale === loc}
          >
            {t(loc)}
          </button>
        </span>
      ))}
    </div>
  );
}
