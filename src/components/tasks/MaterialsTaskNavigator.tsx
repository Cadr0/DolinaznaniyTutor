"use client";

import { useMemo, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import type { TaskAnswerType } from "@prisma/client";
import { reorderTask } from "@/app/[locale]/(app)/dashboard/materials/actions";
import { answerTypeShortLabel } from "@/lib/task-labels";

type TaskListItem = {
  id: string;
  title: string;
  answerType: TaskAnswerType;
  sortOrder: number;
  isActive: boolean;
  imageUrl: string | null;
};

type MaterialsTaskNavigatorProps = {
  locale: string;
  topicTitle: string;
  tasks: TaskListItem[];
  selectedTaskId: string | null;
  locked?: boolean;
  onSelectTask: (taskId: string) => void;
  onCreateTask: () => void;
};

export function MaterialsTaskNavigator({
  locale,
  topicTitle,
  tasks,
  selectedTaskId,
  locked = false,
  onSelectTask,
  onCreateTask,
}: MaterialsTaskNavigatorProps) {
  const [search, setSearch] = useState("");
  const router = useRouter();

  const filteredTasks = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return tasks;
    }

    return tasks.filter((task) => task.title.toLowerCase().includes(query));
  }, [tasks, search]);

  async function moveTask(taskId: string, direction: "up" | "down") {
    await reorderTask(locale, taskId, direction);
    router.refresh();
  }

  return (
    <div className="rounded-[2rem] border border-[var(--card-border)] bg-white p-4 shadow-[var(--shadow-card)] sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
            Задания
          </p>
          <p className="truncate font-display text-lg text-[var(--foreground-strong)]">
            {topicTitle}
          </p>
        </div>
        <button
          type="button"
          onClick={onCreateTask}
          disabled={locked}
          className="touch-target shrink-0 rounded-full border-2 border-[var(--accent)] px-3 py-1.5 text-xs font-semibold text-[var(--accent)] hover:bg-[var(--accent-soft)] disabled:cursor-not-allowed disabled:opacity-40"
        >
          + Задание
        </button>
      </div>

      {locked ? (
        <p className="mt-3 rounded-xl bg-[var(--accent-soft)] px-3 py-2 text-xs text-[var(--foreground-strong)]">
          Тема в каталоге — снимите с маркетплейса, чтобы менять задания.
        </p>
      ) : null}

      <input
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Поиск задания…"
        className="mt-3 w-full rounded-xl border-2 border-[var(--card-border)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
      />

      {filteredTasks.length === 0 ? (
        <p className="mt-3 text-sm text-[var(--muted)]">
          {search ? "Ничего не найдено." : "Нажмите «+ Задание», чтобы создать первое."}
        </p>
      ) : (
        <ul className="mt-3 max-h-[min(50vh,420px)] space-y-2 overflow-y-auto pr-1">
          {filteredTasks.map((task) => {
            const active = task.id === selectedTaskId;
            const index = tasks.findIndex((item) => item.id === task.id);

            return (
              <li key={task.id}>
                <div
                  className={`flex items-center gap-1.5 rounded-[1.25rem] border p-2.5 ${
                    active
                      ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                      : "border-[var(--card-border)] bg-[var(--background)]"
                  }`}
                >
                  <div className="flex flex-col gap-0.5">
                    <button
                      type="button"
                      disabled={locked || index === 0}
                      onClick={() => void moveTask(task.id, "up")}
                      className="rounded px-1 text-[10px] text-[var(--muted)] disabled:opacity-30"
                      aria-label="Выше"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      disabled={locked || index === tasks.length - 1}
                      onClick={() => void moveTask(task.id, "down")}
                      className="rounded px-1 text-[10px] text-[var(--muted)] disabled:opacity-30"
                      aria-label="Ниже"
                    >
                      ↓
                    </button>
                  </div>
                  <button
                    type="button"
                    disabled={locked}
                    onClick={() => onSelectTask(task.id)}
                    className="min-w-0 flex-1 text-left disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <p className="truncate text-sm font-semibold text-[var(--foreground-strong)]">
                      {task.title}
                    </p>
                    <p className="text-xs text-[var(--muted)]">
                      {answerTypeShortLabel[task.answerType]}
                      {task.imageUrl ? " · 📷" : ""}
                    </p>
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
