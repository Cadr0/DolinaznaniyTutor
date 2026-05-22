import { useTranslations } from "next-intl";

function BenefitsIllustration() {
  return (
    <svg
      viewBox="0 0 360 300"
      className="h-auto w-full max-w-sm"
      aria-hidden
    >
      <path d="M40 250 Q180 180 320 250" fill="#d8f0eb" />
      <path d="M80 250 L180 120 L280 250 Z" fill="#e0f5f1" stroke="#b8e8de" strokeWidth="2" />
      <circle cx="180" cy="100" r="16" fill="#f4a896" />
      <rect x="172" y="116" width="16" height="30" rx="6" fill="#3daa9a" />
      <circle cx="140" cy="200" r="12" fill="#d4c5e8" />
      <circle cx="220" cy="190" r="12" fill="#f5e6c8" />
      <path d="M120 250 L140 200" stroke="#3daa9a" strokeWidth="2" strokeLinecap="round" />
      <path d="M240 250 L220 190" stroke="#3daa9a" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function BenefitsSection() {
  const t = useTranslations("benefits");
  const items = ["rooms", "tasks", "feedback", "mobile"] as const;

  return (
    <section
      id="benefits"
      className="bg-[var(--background-soft)] px-4 py-14 sm:px-6 sm:py-20"
    >
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div className="order-2 flex justify-center lg:order-1">
          <BenefitsIllustration />
        </div>

        <div className="order-1 lg:order-2">
          <h2 className="font-display text-3xl text-[var(--foreground-strong)] sm:text-4xl">
            {t("title")}
          </h2>
          <p className="mt-3 text-lg text-[var(--muted)]">{t("subtitle")}</p>

          <ul className="mt-8 grid gap-4 sm:grid-cols-2">
            {items.map((key) => (
              <li key={key} className="flex gap-3">
                <span
                  className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-xs font-bold text-white"
                  aria-hidden
                >
                  ✓
                </span>
                <div>
                  <h3 className="font-semibold text-[var(--foreground-strong)]">
                    {t(`${key}.title`)}
                  </h3>
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    {t(`${key}.desc`)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
