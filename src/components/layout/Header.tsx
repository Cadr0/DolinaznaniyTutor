import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";

export function Header() {
  const t = useTranslations("nav");

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link
          href="/"
          className="text-lg font-bold tracking-tight text-white"
        >
          {t("brand")}
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-slate-300 md:flex">
          <a href="#features" className="hover:text-white">
            {t("features")}
          </a>
          <span className="text-slate-600">{t("forTutors")}</span>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <LanguageSwitcher />
          <Link
            href="/"
            className="touch-target hidden items-center rounded-lg border border-slate-600 px-4 text-sm font-medium text-slate-200 sm:inline-flex"
          >
            {t("login")}
          </Link>
          <Link
            href="/"
            className="touch-target inline-flex items-center rounded-lg bg-emerald-600 px-4 text-sm font-semibold text-white hover:bg-emerald-500"
          >
            {t("start")}
          </Link>
        </div>
      </div>
    </header>
  );
}
