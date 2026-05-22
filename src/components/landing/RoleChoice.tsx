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
        variant="primary"
      />
      <RoleCard
        href="/register?role=teacher"
        eyebrow={t("tutorEyebrow")}
        title={t("tutorTitle")}
        text={t("tutorText")}
        action={t("tutorButton")}
        variant="secondary"
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
  variant,
}: {
  href: string;
  eyebrow: string;
  title: string;
  text: string;
  action: string;
  variant: "primary" | "secondary";
}) {
  const isPrimary = variant === "primary";

  return (
    <Link
      href={href}
      className={`group flex min-h-[11rem] flex-col rounded-[1.75rem] border-2 p-5 shadow-[var(--shadow-card)] transition-all sm:min-h-[12.5rem] sm:p-6 ${
        isPrimary
          ? "border-[var(--accent)] bg-white hover:bg-[var(--accent-soft)]"
          : "border-[var(--card-border)] bg-white hover:border-[var(--accent)] hover:bg-[var(--accent-soft)]"
      }`}
    >
      <p className="text-sm font-semibold text-[var(--accent)]">{eyebrow}</p>
      <h2 className="mt-2 font-display text-2xl leading-tight text-[var(--foreground-strong)] sm:text-3xl">
        {title}
      </h2>
      <p className="mt-3 flex-1 text-sm leading-relaxed text-[var(--muted)] sm:text-base">
        {text}
      </p>
      <span
        className={`mt-4 inline-flex touch-target w-full items-center justify-center rounded-full px-5 text-sm font-semibold transition-colors sm:w-auto ${
          isPrimary
            ? "bg-[var(--accent)] text-white group-hover:bg-[var(--accent-hover)]"
            : "border-2 border-[var(--accent)] text-[var(--accent)] group-hover:bg-[var(--accent)] group-hover:text-white"
        }`}
      >
        {action}
      </span>
    </Link>
  );
}
