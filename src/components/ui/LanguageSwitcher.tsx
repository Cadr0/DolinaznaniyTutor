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
      className="inline-flex rounded-full border border-[var(--card-border)] bg-white p-0.5 shadow-sm"
      role="group"
      aria-label="Language"
    >
      {routing.locales.map((loc) => (
        <button
          key={loc}
          type="button"
          onClick={() => switchLocale(loc)}
          className={`touch-target rounded-full px-3 py-1 text-sm font-semibold transition-colors ${
            locale === loc
              ? "bg-[var(--accent)] text-white"
              : "text-[var(--muted)] hover:text-[var(--foreground-strong)]"
          }`}
          aria-pressed={locale === loc}
        >
          {t(loc)}
        </button>
      ))}
    </div>
  );
}
