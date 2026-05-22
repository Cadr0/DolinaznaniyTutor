"use client";

import { useTranslations } from "next-intl";
import { ButtonLink } from "@/components/ui/Button";

export function HeroEmailForm() {
  const t = useTranslations("hero");

  return (
    <form
      className="mt-8 flex max-w-md flex-col gap-3 sm:flex-row sm:items-center sm:rounded-full sm:border-2 sm:border-[var(--card-border)] sm:bg-white sm:p-1.5 sm:shadow-[var(--shadow-soft)]"
      onSubmit={(e) => e.preventDefault()}
    >
      <input
        type="email"
        placeholder={t("emailPlaceholder")}
        className="touch-target w-full rounded-full border-2 border-[var(--card-border)] bg-white px-5 text-[var(--foreground-strong)] placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:outline-none sm:border-0 sm:shadow-none"
        aria-label={t("emailPlaceholder")}
      />
      <ButtonLink href="/" className="shrink-0 px-6 sm:rounded-full">
        {t("ctaPrimary")}
      </ButtonLink>
    </form>
  );
}
