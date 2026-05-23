"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { StudentProgressPanel } from "@/components/homework/StudentProgressPanel";

type RoomStudent = {
  id: string;
  name: string;
  email: string;
};

type RoomStudentsSectionProps = {
  locale: string;
  roomId: string;
  students: RoomStudent[];
  isTutor: boolean;
};

export function RoomStudentsSection({
  locale,
  roomId,
  students,
  isTutor,
}: RoomStudentsSectionProps) {
  const t = useTranslations("app.homeworkPage");
  const [selectedStudent, setSelectedStudent] = useState<RoomStudent | null>(null);

  return (
    <>
      <div className="mt-6 rounded-[2rem] border border-[var(--card-border)] bg-white p-5 shadow-[var(--shadow-card)] sm:p-6">
        <h2 className="font-display text-2xl text-[var(--foreground-strong)]">Ученики</h2>
        {students.length === 0 ? (
          <p className="mt-3 text-sm text-[var(--muted)]">
            {isTutor
              ? "Пока никто не вступил. Отправьте ссылку-приглашение."
              : "В этой комнате пока только вы."}
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {students.map((student) => (
              <li key={student.id}>
                {isTutor ? (
                  <button
                    type="button"
                    onClick={() => setSelectedStudent(student)}
                    aria-label={t("studentProgress")}
                    className="flex w-full items-center gap-3 rounded-[1.25rem] border border-[var(--card-border)] bg-[var(--background)] p-4 text-left transition-colors hover:border-[var(--accent)]/40"
                  >
                    <StudentAvatar name={student.name} />
                    <StudentInfo name={student.name} email={student.email} />
                    <span className="ml-auto text-xs font-semibold text-[var(--accent)]">
                      {t("progressLink")}
                    </span>
                  </button>
                ) : (
                  <div className="flex items-center gap-3 rounded-[1.25rem] border border-[var(--card-border)] bg-[var(--background)] p-4">
                    <StudentAvatar name={student.name} />
                    <StudentInfo name={student.name} email={student.email} />
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {selectedStudent ? (
        <StudentProgressPanel
          locale={locale}
          roomId={roomId}
          student={selectedStudent}
          open={Boolean(selectedStudent)}
          onClose={() => setSelectedStudent(null)}
        />
      ) : null}
    </>
  );
}

function StudentAvatar({ name }: { name: string }) {
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--accent-soft)] text-sm font-bold text-[var(--accent)]">
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

function StudentInfo({ name, email }: { name: string; email: string }) {
  return (
    <div className="min-w-0">
      <p className="truncate text-sm font-semibold text-[var(--foreground-strong)]">{name}</p>
      <p className="truncate text-xs text-[var(--muted)]">{email}</p>
    </div>
  );
}
