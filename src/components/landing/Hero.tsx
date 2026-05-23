import { useTranslations } from "next-intl";
import { HeroDoodleBackground } from "@/components/landing/HeroDoodleBackground";
import { RoleChoice } from "@/components/landing/RoleChoice";

export function Hero() {
  const t = useTranslations("hero");

  return (
    <section className="relative flex min-h-[100dvh] flex-col overflow-hidden px-4 pb-16 pt-8 sm:px-6 sm:pb-20 sm:pt-12">
      <HeroDoodleBackground />

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center">
        <div className="max-w-3xl">
          <span className="mb-4 inline-block rounded-full bg-[var(--accent-soft)] px-4 py-1.5 text-sm font-semibold text-[var(--accent)]">
            {t("badge")}
          </span>

          <h1 className="font-display text-4xl leading-tight text-[var(--foreground-strong)] sm:text-5xl lg:text-[3.25rem]">
            {t("title")}
            <br />
            <span className="text-[var(--accent)]">{t("titleAccent")}</span>
          </h1>

          <p className="prose-width mt-5 text-lg leading-relaxed text-[var(--muted)]">
            {t("subtitle")}
          </p>
        </div>

        <RoleChoice />

        <ul className="mt-8 flex flex-col gap-2 text-sm text-[var(--muted)] sm:flex-row sm:gap-6">
          {[t("trustFree"), t("trustMobile"), t("trustSecure")].map((item) => (
            <li key={item} className="flex items-center gap-2">
              <span
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--accent-soft)] text-xs text-[var(--accent)]"
                aria-hidden
              >
                ✓
              </span>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
