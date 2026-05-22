import { useTranslations } from "next-intl";

const icons = {
  learn: (
    <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
    </svg>
  ),
  practice: (
    <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
    </svg>
  ),
  grow: (
    <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
    </svg>
  ),
};

const iconBg = ["bg-[var(--accent-soft)]", "bg-[#fceee9]", "bg-[#ede8f5]"];
const iconColor = ["text-[var(--accent)]", "text-[#e8927a]", "text-[#9b7ec4]"];

export function ValuesSection() {
  const t = useTranslations("values");
  const keys = ["learn", "practice", "grow"] as const;

  return (
    <section
      id="values"
      className="bg-[var(--background-soft)] px-4 py-14 sm:px-6 sm:py-20"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl text-[var(--foreground-strong)] sm:text-4xl">
            {t("title")}
          </h2>
          <p className="mt-3 text-lg text-[var(--muted)]">{t("subtitle")}</p>
        </div>

        <ul className="mt-12 grid gap-8 sm:grid-cols-3 sm:gap-6">
          {keys.map((key, i) => (
            <li key={key} className="text-center">
              <div
                className={`mx-auto mb-4 inline-flex rounded-2xl p-4 ${iconBg[i]} ${iconColor[i]}`}
              >
                {icons[key]}
              </div>
              <h3 className="font-display text-xl text-[var(--foreground-strong)]">
                {t(`${key}.title`)}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
                {t(`${key}.desc`)}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
