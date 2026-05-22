import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { HeaderActions } from "@/components/layout/HeaderActions";

export function Header() {
  const t = useTranslations("nav");

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--card-border)] bg-white/95 shadow-sm backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center gap-2 px-3 py-2.5 sm:gap-3 sm:px-6 sm:py-3">
        <Link
          href="/"
          className="min-w-0 flex-1 truncate font-display text-base font-semibold text-[var(--foreground-strong)] sm:flex-none sm:text-xl"
        >
          {t("brand")}
        </Link>

        <nav className="hidden flex-1 items-center justify-center gap-8 text-sm font-medium text-[var(--muted)] md:flex">
          <a
            href="#values"
            className="transition-colors hover:text-[var(--accent)]"
          >
            {t("about")}
          </a>
          <a
            href="#features"
            className="transition-colors hover:text-[var(--accent)]"
          >
            {t("features")}
          </a>
          <a
            href="#benefits"
            className="transition-colors hover:text-[var(--accent)]"
          >
            {t("forTutors")}
          </a>
        </nav>

        <HeaderActions />
      </div>
    </header>
  );
}
