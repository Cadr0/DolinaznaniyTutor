import { useTranslations } from "next-intl";
import { ButtonLink } from "@/components/ui/Button";

export function RoleChoice() {
  const t = useTranslations("roleChoice");

  return (
    <div className="mt-8 grid max-w-xl gap-3 sm:grid-cols-2">
      <div className="rounded-[1.75rem] border border-[var(--card-border)] bg-white p-4 shadow-[var(--shadow-card)]">
        <p className="text-sm font-semibold text-[var(--accent)]">{t("studentEyebrow")}</p>
        <h2 className="mt-2 font-display text-2xl text-[var(--foreground-strong)]">
          {t("studentTitle")}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{t("studentText")}</p>
        <ButtonLink href="/register?role=student" className="mt-4 w-full">
          {t("studentButton")}
        </ButtonLink>
      </div>

      <div className="rounded-[1.75rem] border border-[var(--card-border)] bg-white p-4 shadow-[var(--shadow-card)]">
        <p className="text-sm font-semibold text-[var(--accent)]">{t("tutorEyebrow")}</p>
        <h2 className="mt-2 font-display text-2xl text-[var(--foreground-strong)]">
          {t("tutorTitle")}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{t("tutorText")}</p>
        <ButtonLink href="/register?role=teacher" variant="secondary" className="mt-4 w-full">
          {t("tutorButton")}
        </ButtonLink>
      </div>
    </div>
  );
}
