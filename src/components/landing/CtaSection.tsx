import { useTranslations } from "next-intl";
import { ButtonLink } from "@/components/ui/Button";

export function CtaSection() {
  const t = useTranslations("cta");

  return (
    <section className="px-4 pb-24 pt-4 sm:px-6 sm:pb-28">
      <div className="relative mx-auto max-w-3xl overflow-hidden rounded-3xl bg-[var(--accent-soft)] px-6 py-12 text-center sm:px-12 sm:py-16">
        <div
          className="blob blob-mint -right-10 -top-10 h-40 w-40 opacity-80"
          aria-hidden
        />
        <div className="relative">
          <h2 className="font-display text-2xl text-[var(--foreground-strong)] sm:text-3xl">
            {t("title")}
          </h2>
          <p className="prose-width mx-auto mt-4 text-[var(--muted)]">
            {t("subtitle")}
          </p>
          <ButtonLink href="/register" className="mt-8 px-8">
            {t("button")}
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
