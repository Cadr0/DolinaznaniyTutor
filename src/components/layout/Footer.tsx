import Link from "next/link";
import { useTranslations } from "next-intl";

export function Footer() {
  const t = useTranslations("footer");
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-[var(--card-border)] bg-[var(--background-soft)] pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="text-sm text-[var(--muted)]">
          © {year} {t("tagline")}
        </p>
        <div className="flex flex-wrap gap-6 text-sm">
          <Link
            href="/api/health"
            className="touch-target inline-flex items-center text-[var(--muted)] transition-colors hover:text-[var(--accent)]"
          >
            {t("health")}
          </Link>
          <Link
            href="/api/version"
            className="touch-target inline-flex items-center text-[var(--muted)] transition-colors hover:text-[var(--accent)]"
          >
            {t("version")}
          </Link>
        </div>
      </div>
    </footer>
  );
}
