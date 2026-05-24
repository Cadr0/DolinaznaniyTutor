"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { TeacherStudentOverview } from "@/lib/student-assignments";

type StudentsListProps = {
  students: TeacherStudentOverview[];
};

export function StudentsList({ students }: StudentsListProps) {
  const t = useTranslations("app.studentsPage");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return students;
    }

    return students.filter(
      (student) =>
        student.name.toLowerCase().includes(normalized) ||
        student.email.toLowerCase().includes(normalized) ||
        student.rooms.some((room) => room.roomTitle.toLowerCase().includes(normalized)),
    );
  }, [query, students]);

  if (students.length === 0) {
    return (
      <p className="mt-8 rounded-[1.5rem] border border-dashed border-[var(--card-border)] bg-[var(--background)] p-8 text-center text-sm text-[var(--muted)]">
        {t("empty")}
      </p>
    );
  }

  return (
    <div className="mt-8">
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={t("searchPlaceholder")}
        className="touch-target w-full rounded-2xl border-2 border-[var(--card-border)] px-4 py-3 text-sm outline-none focus:border-[var(--accent)] sm:max-w-md"
      />

      <ul className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((student) => (
          <li key={student.id}>
            <Link
              href={`/dashboard/students/${student.id}?roomId=${student.rooms[0]?.roomId ?? ""}`}
              className="flex h-full flex-col rounded-[1.5rem] border border-[var(--card-border)] bg-white p-5 shadow-[var(--shadow-card)] transition-colors hover:border-[var(--accent)]/40"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--accent-soft)] text-sm font-bold text-[var(--accent)]">
                  {student.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-[var(--foreground-strong)]">
                    {student.name}
                  </p>
                  <p className="truncate text-xs text-[var(--muted)]">{student.email}</p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 text-center">
                <MiniStat
                  value={`${student.totals.completedTasks}/${student.totals.assignedTasks}`}
                  label={t("statsCompleted")}
                />
                <MiniStat value={String(student.totals.errorTasks)} label={t("statsErrors")} />
              </div>

              <p className="mt-3 text-xs text-[var(--muted)]">
                {student.rooms.map((room) => room.roomTitle).join(" · ")}
              </p>

              {student.totals.pendingReview > 0 ? (
                <span className="mt-3 inline-flex w-fit rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                  {t("pendingReview", { count: student.totals.pendingReview })}
                </span>
              ) : null}

              <span className="mt-auto pt-4 text-sm font-semibold text-[var(--accent)]">
                {t("openCard")} →
              </span>
            </Link>
          </li>
        ))}
      </ul>

      {filtered.length === 0 ? (
        <p className="mt-6 text-sm text-[var(--muted)]">{t("noResults")}</p>
      ) : null}
    </div>
  );
}

function MiniStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-xl bg-[var(--background)] p-2">
      <p className="text-sm font-bold text-[var(--foreground-strong)]">{value}</p>
      <p className="text-[10px] text-[var(--muted)]">{label}</p>
    </div>
  );
}
