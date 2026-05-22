import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export function CtaSection() {
  const t = useTranslations("cta");

  return (
    <section className="px-4 pb-20 pt-4 sm:px-6 sm:pb-28">
      <div className="mx-auto max-w-3xl rounded-2xl border border-emerald-800/40 bg-gradient-to-br from-emerald-950/80 to-slate-900 px-6 py-10 text-center sm:px-12 sm:py-14">
        <h2 className="text-2xl font-bold text-white sm:text-3xl">
          {t("title")}
        </h2>
        <p className="prose-width mx-auto mt-4 text-slate-300">{t("subtitle")}</p>
        <Link
          href="/"
          className="touch-target mt-8 inline-flex items-center justify-center rounded-xl bg-white px-8 text-base font-semibold text-slate-900 hover:bg-slate-100"
        >
          {t("button")}
        </Link>
      </div>
    </section>
  );
}
