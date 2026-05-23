import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export function RoleChoice() {
  const t = useTranslations("roleChoice");

  return (
    <div className="mt-8 grid w-full gap-3 sm:grid-cols-2 sm:gap-4">
      <RoleCard
        href="/register?role=student"
        eyebrow={t("studentEyebrow")}
        title={t("studentTitle")}
        text={t("studentText")}
        action={t("studentButton")}
      />
      <RoleCard
        href="/register?role=teacher"
        eyebrow={t("tutorEyebrow")}
        title={t("tutorTitle")}
        text={t("tutorText")}
        action={t("tutorButton")}
      />
    </div>
  );
}

function RoleCard({
  href,
  eyebrow,
  title,
  text,
  action,
}: {
  href: string;
  eyebrow: string;
  title: string;
  text: string;
  action: string;
}) {
  return (
    <Link
      href={href}
      className="group flex min-h-[11rem] flex-col rounded-[1.75rem] border-2 border-[var(--card-border)] bg-white p-5 shadow-[var(--shadow-card)] outline-none transition-all hover:border-[var(--accent)] hover:bg-[var(--accent-soft)] focus-visible:border-[var(--accent)] focus-visible:bg-[var(--accent-soft)] focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 sm:min-h-[12.5rem] sm:p-6"
    >
      <p className="text-sm font-semibold text-[var(--muted)] transition-colors group-hover:text-[var(--accent)] group-focus-visible:text-[var(--accent)]">
        {eyebrow}
      </p>
      <h2 className="mt-2 font-display text-2xl leading-tight text-[var(--foreground-strong)] sm:text-3xl">
        {title}
      </h2>
      <p className="mt-3 flex-1 text-sm leading-relaxed text-[var(--muted)] sm:text-base">
        {text}
      </p>
      <span className="mt-4 inline-flex w-full touch-target items-center justify-center rounded-full border-2 border-[var(--card-border)] bg-[var(--background-soft)] px-5 text-sm font-semibold text-[var(--foreground-strong)] transition-colors group-hover:border-[var(--accent)] group-hover:bg-[var(--accent)] group-hover:text-white group-focus-visible:border-[var(--accent)] group-focus-visible:bg-[var(--accent)] group-focus-visible:text-white sm:w-auto">
        {action}
      </span>
    </Link>
  );
}
