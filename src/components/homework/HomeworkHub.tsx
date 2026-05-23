"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { StudentTopicAssignmentSummary } from "@/lib/student-assignments";

type HomeworkHubProps = {
  assignments: StudentTopicAssignmentSummary[];
};

export function HomeworkHub({ assignments }: HomeworkHubProps) {
  const t = useTranslations("app.homeworkPage");

  if (assignments.length === 0) {
    return (
      <p className="mt-4 rounded-2xl bg-[var(--background)] p-4 text-sm text-[var(--muted)]">
        {t("empty")}
      </p>
    );
  }

  return (
    <ul className="mt-4 space-y-3">
      {assignments.map((assignment) => {
        const percent =
          assignment.totalTasks > 0
            ? Math.round((assignment.completedTasks / assignment.totalTasks) * 100)
            : 0;
        const isDone = assignment.completedTasks >= assignment.totalTasks && assignment.totalTasks > 0;

        return (
          <li key={assignment.id}>
            <Link
              href={`/dashboard/homework/${assignment.id}`}
              className="block rounded-[1.25rem] border border-[var(--card-border)] bg-[var(--background)] p-4 transition-colors hover:border-[var(--accent)]/40"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[var(--foreground-strong)]">
                    {assignment.topicTitle}
                  </p>
                  <p className="mt-1 text-xs text-[var(--muted)]">
                    {t("roomLabel")}: {assignment.roomTitle}
                  </p>
                </div>
                <span className="rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs font-semibold text-[var(--accent)]">
                  {isDone ? "100%" : `${percent}%`}
                </span>
              </div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white">
                <div
                  className="h-full rounded-full bg-[var(--accent)]"
                  style={{ width: `${percent}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-[var(--muted)]">
                {t("progress", {
                  done: assignment.completedTasks,
                  total: assignment.totalTasks,
                })}
              </p>
              <span className="mt-3 inline-block text-sm font-semibold text-[var(--accent)]">
                {assignment.completedTasks > 0 && !isDone ? t("continue") : t("start")} →
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
