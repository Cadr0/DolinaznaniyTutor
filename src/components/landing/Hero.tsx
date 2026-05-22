import { useTranslations } from "next-intl";
import { HeroEmailForm } from "@/components/landing/HeroEmailForm";

function HeroIllustration() {
  return (
    <svg
      viewBox="0 0 400 320"
      className="h-auto w-full max-w-md"
      aria-hidden
      role="img"
    >
      <ellipse cx="200" cy="280" rx="160" ry="20" fill="#d8f0eb" />
      <rect x="60" y="120" width="120" height="90" rx="16" fill="#e0f5f1" />
      <rect x="80" y="140" width="80" height="8" rx="4" fill="#b8e8de" />
      <rect x="80" y="160" width="60" height="6" rx="3" fill="#b8e8de" />
      <rect x="80" y="175" width="70" height="6" rx="3" fill="#b8e8de" />
      <circle cx="120" cy="100" r="28" fill="#f4a896" />
      <rect x="108" y="128" width="24" height="40" rx="8" fill="#3daa9a" />
      <circle cx="260" cy="110" r="24" fill="#d4c5e8" />
      <rect x="250" y="134" width="20" height="36" rx="8" fill="#349786" />
      <path
        d="M180 180 Q200 160 220 180"
        stroke="#3daa9a"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
      <circle cx="200" cy="155" r="8" fill="#f5e6c8" stroke="#3daa9a" strokeWidth="2" />
    </svg>
  );
}

export function Hero() {
  const t = useTranslations("hero");

  return (
    <section className="relative overflow-hidden px-4 pb-12 pt-8 sm:px-6 sm:pb-20 sm:pt-12">
      <div className="blob blob-mint -left-20 top-10 h-64 w-64 opacity-60" aria-hidden />
      <div className="blob blob-lavender -right-16 top-32 h-48 w-48" aria-hidden />

      <div className="relative mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <div>
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

          <HeroEmailForm />

          <ul className="mt-8 flex flex-col gap-2 text-sm text-[var(--muted)] sm:flex-row sm:gap-6">
            {[t("trustFree"), t("trustMobile"), t("trustSecure")].map(
              (item) => (
                <li key={item} className="flex items-center gap-2">
                  <span
                    className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--accent-soft)] text-xs text-[var(--accent)]"
                    aria-hidden
                  >
                    ✓
                  </span>
                  {item}
                </li>
              )
            )}
          </ul>
        </div>

        <div className="flex justify-center lg:justify-end">
          <HeroIllustration />
        </div>
      </div>
    </section>
  );
}
