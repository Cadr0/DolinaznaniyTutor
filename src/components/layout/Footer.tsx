import Link from "next/link";
import { useTranslations } from "next-intl";

export function Footer() {
  const t = useTranslations("footer");
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-800 bg-slate-950 pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="text-sm text-slate-500">
          © {year} {t("tagline")}
        </p>
        <div className="flex flex-wrap gap-4 text-sm">
          <Link
            href="/api/health"
            className="touch-target inline-flex items-center text-slate-400 hover:text-emerald-400"
          >
            {t("health")}
          </Link>
          <Link
            href="/api/version"
            className="touch-target inline-flex items-center text-slate-400 hover:text-emerald-400"
          >
            {t("version")}
          </Link>
        </div>
      </div>
    </footer>
  );
}
