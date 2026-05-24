"use client";

import { useMemo, useState } from "react";
import { Link } from "@/i18n/navigation";
import type { TeacherStudent } from "@/lib/rooms";

type RoomStudentsDrawerProps = {
  students: TeacherStudent[];
};

export function RoomStudentsDrawer({ students }: RoomStudentsDrawerProps) {
  const [open, setOpen] = useState(false);
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
        student.roomTitle.toLowerCase().includes(normalized),
    );
  }, [query, students]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="hidden rounded-full border border-[var(--card-border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--foreground-strong)] shadow-sm transition-colors hover:border-[var(--accent)]/40 sm:inline-flex"
      >
        Ученики ({students.length})
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 hidden sm:block">
          <button
            type="button"
            aria-label="Закрыть"
            className="dialog-scrim absolute inset-0 backdrop-blur-[2px]"
            onClick={() => setOpen(false)}
          />
          <aside className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col border-l border-[var(--card-border)] bg-white shadow-[0_0_40px_rgba(42,62,71,0.12)]">
            <div className="border-b border-[var(--card-border)] p-5">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-display text-2xl text-[var(--foreground-strong)]">Ученики</h2>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-full px-3 py-1 text-sm font-semibold text-[var(--muted)] hover:bg-[var(--background-soft)]"
                >
                  Закрыть
                </button>
              </div>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Поиск по имени, почте или комнате"
                className="touch-target mt-4 w-full rounded-2xl border-2 border-[var(--card-border)] px-4 text-sm outline-none focus:border-[var(--accent)]"
              />
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {filtered.length === 0 ? (
                <p className="rounded-2xl bg-[var(--background)] p-4 text-sm text-[var(--muted)]">
                  {students.length === 0
                    ? "Пока нет учеников. Отправьте ссылку-приглашение из комнаты."
                    : "Ничего не найдено."}
                </p>
              ) : (
                <ul className="space-y-3">
                  {filtered.map((student) => (
                    <li
                      key={`${student.roomId}-${student.id}`}
                      className="rounded-[1.25rem] border border-[var(--card-border)] bg-[var(--background)] p-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--accent-soft)] text-sm font-bold text-[var(--accent)]">
                          {student.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-[var(--foreground-strong)]">
                            {student.name}
                          </p>
                          <p className="truncate text-xs text-[var(--muted)]">{student.email}</p>
                          <Link
                            href={`/dashboard/students/${student.id}?roomId=${student.roomId}`}
                            className="mt-2 inline-block text-xs font-semibold text-[var(--accent)] hover:underline"
                            onClick={() => setOpen(false)}
                          >
                            Карточка ученика →
                          </Link>
                          <Link
                            href={`/dashboard/rooms/${student.roomId}`}
                            className="mt-1 block text-xs text-[var(--muted)] hover:underline"
                            onClick={() => setOpen(false)}
                          >
                            {student.roomTitle}
                          </Link>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </aside>
        </div>
      ) : null}
    </>
  );
}
