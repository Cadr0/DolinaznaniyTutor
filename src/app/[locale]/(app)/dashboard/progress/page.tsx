import { redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getStudentAssignments } from "@/lib/student-assignments";
import { requireSession } from "@/lib/session";
import { localePath } from "@/lib/routes";

type Props = { params: Promise<{ locale: string }> };

export const dynamic = "force-dynamic";

export default async function ProgressPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const session = await requireSession(locale);
  const t = await getTranslations("app.homeworkPage");

  if (session.user.role !== "STUDENT") {
    redirect(localePath(locale, "/dashboard"));
  }

  const assignments = await getStudentAssignments(session.user.id);
  const totals = assignments.reduce(
    (acc, assignment) => ({
      assigned: acc.assigned + assignment.totalTasks,
      completed: acc.completed + assignment.completedTasks,
      errors: acc.errors + assignment.errorTasks,
      hints: acc.hints + assignment.hintsUsed,
    }),
    { assigned: 0, completed: 0, errors: 0, hints: 0 },
  );

  return (
    <section className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
      <p className="text-sm font-semibold uppercase tracking-wide text-[var(--accent)]">
        {t("progressPageEyebrow")}
      </p>
      <h1 className="mt-2 font-display text-3xl text-[var(--foreground-strong)]">
        {t("progressPageTitle")}
      </h1>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label={t("statsCompleted")} value={`${totals.completed}/${totals.assigned}`} />
        <StatCard label={t("statsErrors")} value={String(totals.errors)} />
        <StatCard label={t("statsHints")} value={String(totals.hints)} />
        <StatCard label={t("topicsCount")} value={String(assignments.length)} />
      </div>

      {assignments.length === 0 ? (
        <p className="mt-6 text-sm text-[var(--muted)]">{t("empty")}</p>
      ) : (
        <ul className="mt-6 space-y-3">
          {assignments.map((assignment) => (
            <li
              key={assignment.id}
              className="rounded-[1.25rem] border border-[var(--card-border)] bg-white p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-[var(--foreground-strong)]">
                    {assignment.topicTitle}
                  </p>
                  <p className="text-xs text-[var(--muted)]">{assignment.roomTitle}</p>
                </div>
                <Link
                  href={`/dashboard/homework/${assignment.id}`}
                  className="text-sm font-semibold text-[var(--accent)] hover:underline"
                >
                  {t("continue")} →
                </Link>
              </div>
              <p className="mt-2 text-xs text-[var(--muted)]">
                {t("progress", {
                  done: assignment.completedTasks,
                  total: assignment.totalTasks,
                })}
                {assignment.errorTasks > 0 ? ` · ${assignment.errorTasks} ${t("statsErrors").toLowerCase()}` : ""}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[var(--card-border)] bg-white p-4 text-center shadow-[var(--shadow-card)]">
      <p className="text-xl font-bold text-[var(--foreground-strong)]">{value}</p>
      <p className="mt-1 text-xs text-[var(--muted)]">{label}</p>
    </div>
  );
}
