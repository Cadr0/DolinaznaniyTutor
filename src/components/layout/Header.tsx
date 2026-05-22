import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { ButtonLink } from "@/components/ui/Button";

export function Header() {
  const t = useTranslations("nav");

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--card-border)] bg-white/95 shadow-sm backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:px-6">
        {/* Logo — Ozon/WB: слева */}
        <Link
          href="/"
          className="font-display shrink-0 text-lg font-semibold text-[var(--foreground-strong)] sm:text-xl"
        >
          {t("brand")}
        </Link>

        {/* Nav — по центру на desktop, как каталог у маркетплейсов */}
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

        {/* Actions — справа: Войти + главная кнопка */}
        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <LanguageSwitcher />
          <ButtonLink
            href="/login"
            variant="ghost"
            className="hidden px-4 sm:inline-flex"
          >
            {t("login")}
          </ButtonLink>
          <ButtonLink href="/register" className="px-5 sm:px-6">
            {t("start")}
          </ButtonLink>
        </div>
      </div>
    </header>
  );
}
