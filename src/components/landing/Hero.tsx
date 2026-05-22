import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export function Hero() {
  const t = useTranslations("hero");

  return (
    <section className="relative overflow-hidden px-4 pb-16 pt-10 sm:px-6 sm:pb-24 sm:pt-16">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/30 via-slate-950 to-slate-950"
        aria-hidden
      />
      <div className="relative mx-auto max-w-6xl text-center">
        <span className="mb-6 inline-block rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-sm font-medium text-emerald-300">
          {t("badge")}
        </span>

        <h1 className="mx-auto max-w-3xl text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
          {t("title")}
          <br />
          <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
            {t("titleAccent")}
          </span>
        </h1>

        <p className="prose-width mx-auto mt-6 text-lg leading-relaxed text-slate-300 sm:text-xl">
          {t("subtitle")}
        </p>

        <div className="mt-10 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
          <Link
            href="/"
            className="touch-target inline-flex items-center justify-center rounded-xl bg-emerald-600 px-8 text-base font-semibold text-white shadow-lg shadow-emerald-900/30 hover:bg-emerald-500"
          >
            {t("ctaPrimary")}
          </Link>
          <a
            href="#features"
            className="touch-target inline-flex items-center justify-center rounded-xl border border-slate-600 px-8 text-base font-medium text-slate-200 hover:border-slate-400"
          >
            {t("ctaSecondary")}
          </a>
        </div>

        <ul className="mt-10 flex flex-col items-center justify-center gap-3 text-sm text-slate-400 sm:flex-row sm:gap-8">
          <li className="flex items-center gap-2">
            <span className="text-emerald-400" aria-hidden>
              ✓
            </span>
            {t("trustFree")}
          </li>
          <li className="flex items-center gap-2">
            <span className="text-emerald-400" aria-hidden>
              ✓
            </span>
            {t("trustMobile")}
          </li>
          <li className="flex items-center gap-2">
            <span className="text-emerald-400" aria-hidden>
              ✓
            </span>
            {t("trustSecure")}
          </li>
        </ul>
      </div>
    </section>
  );
}
