import { useTranslations } from "next-intl";

const icons = {
  tutor: (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
    </svg>
  ),
  student: (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  ),
  marketplace: (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64M5.64 21H2.36m0 0H.75M5.64 21l1.5-9h12.72l1.5 9M9 3.75h6M9 3.75v1.5m6-1.5v1.5" />
    </svg>
  ),
};

export function Features() {
  const t = useTranslations("features");

  const items = [
    { key: "tutor" as const, icon: icons.tutor },
    { key: "student" as const, icon: icons.student },
    { key: "marketplace" as const, icon: icons.marketplace },
  ];

  return (
    <section id="features" className="px-4 py-16 sm:px-6 sm:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            {t("title")}
          </h2>
          <p className="mt-4 text-lg text-slate-400">{t("subtitle")}</p>
        </div>

        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {items.map(({ key, icon }) => (
            <li
              key={key}
              className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 transition-colors hover:border-emerald-800/50 hover:bg-slate-900/80"
            >
              <div className="mb-4 inline-flex rounded-xl bg-emerald-600/15 p-3 text-emerald-400">
                {icon}
              </div>
              <h3 className="text-lg font-semibold text-white">
                {t(`${key}.title`)}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                {t(`${key}.desc`)}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
