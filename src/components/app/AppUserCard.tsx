import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

type AppUserCardProps = {
  name: string;
  role: string;
  compact?: boolean;
  showRole?: boolean;
};

export function AppUserCard({ name, role, compact = false, showRole = false }: AppUserCardProps) {
  const t = useTranslations("app");
  const initial = name.trim().charAt(0).toUpperCase() || "?";
  const roleLabel = role === "TUTOR" ? t("roleTeacher") : t("roleStudent");

  if (compact) {
    return (
      <Link href="/dashboard/settings" className="flex min-w-0 items-center gap-2">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--accent-soft)] text-sm font-bold text-[var(--accent)]">
          {initial}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-[var(--foreground-strong)]">{name}</p>
          {showRole ? (
            <p className="truncate text-xs text-[var(--muted)]">{roleLabel}</p>
          ) : null}
        </div>
      </Link>
    );
  }

  return (
    <Link
      href="/dashboard/settings"
      className="flex items-center gap-3 rounded-2xl border border-[var(--card-border)] bg-[var(--background)] p-3 transition-colors hover:border-[var(--accent)]/30 hover:bg-[var(--accent-soft)]/40"
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--accent-soft)] text-base font-bold text-[var(--accent)]">
        {initial}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-[var(--foreground-strong)]">{name}</p>
        <p className="truncate text-xs text-[var(--muted)]">{roleLabel}</p>
      </div>
    </Link>
  );
}
