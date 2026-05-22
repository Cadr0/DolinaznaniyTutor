import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

const cardAccents = [
  "bg-[var(--accent-soft)] text-[var(--accent)]",
  "bg-[#fceee9] text-[#e8927a]",
  "bg-[#ede8f5] text-[#9b7ec4]",
  "bg-[#fef6e4] text-[#c9a227]",
];

export function Features() {
  const t = useTranslations("features");

  const items = ["tutor", "student", "marketplace", "progress"] as const;

  return (
    <section id="features" className="px-4 py-14 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-display text-3xl text-[var(--foreground-strong)] sm:text-4xl">
              {t("title")}
            </h2>
            <p className="mt-2 text-lg text-[var(--muted)]">{t("subtitle")}</p>
          </div>
        </div>

        {/* WB/Ozon: горизонтальные карточки с кнопкой внизу */}
        <ul className="scrollbar-hide -mx-4 mt-10 flex gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-4">
          {items.map((key, i) => (
            <li
              key={key}
              className="card-soft flex w-[260px] shrink-0 flex-col p-5 sm:w-auto"
            >
              <div
                className={`mb-4 inline-flex self-start rounded-xl p-2.5 ${cardAccents[i]}`}
              >
                <FeatureIcon name={key} />
              </div>
              <h3 className="font-display text-lg text-[var(--foreground-strong)]">
                {t(`${key}.title`)}
              </h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-[var(--muted)]">
                {t(`${key}.desc`)}
              </p>
              <Link
                href="/"
                className="touch-target mt-4 inline-flex items-center text-sm font-semibold text-[var(--accent)] hover:underline"
              >
                {t("learnMore")} →
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function FeatureIcon({ name }: { name: string }) {
  const cls = "h-5 w-5";
  switch (name) {
    case "tutor":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.62 48.62 0 0112 20.904a48.62 48.62 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.636 50.636 0 00-2.658-.813A59.906 59.906 0 0112 3.493a59.903 59.903 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0112 13.489a50.702 50.702 0 017.74-3.342" />
        </svg>
      );
    case "student":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
        </svg>
      );
    case "marketplace":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64M9 3.75h6M9 3.75v1.5m6-1.5v1.5" />
        </svg>
      );
    default:
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
        </svg>
      );
  }
}
