"use client";

import { useRouter } from "@/i18n/navigation";
import type { TaskAnswerType } from "@prisma/client";
import { reorderTask } from "@/app/[locale]/(app)/dashboard/materials/actions";

type TaskListItem = {
  id: string;
  title: string;
  answerType: TaskAnswerType;
  sortOrder: number;
  isActive: boolean;
  imageUrl: string | null;
};

type TaskListProps = {
  locale: string;
  tasks: TaskListItem[];
  selectedTaskId: string | null;
  onSelectTask: (taskId: string) => void;
  onCreateTask: () => void;
};

import { answerTypeShortLabel } from "@/lib/task-labels";

/** @deprecated Use MaterialsNavigator instead */
export function TaskList({
  locale,
  tasks,
  selectedTaskId,
  onSelectTask,
  onCreateTask,
}: TaskListProps) {
  const router = useRouter();

  async function moveTask(taskId: string, direction: "up" | "down") {
    await reorderTask(locale, taskId, direction);
    router.refresh();
  }

  return (
    <div className="rounded-[2rem] border border-[var(--card-border)] bg-white p-4 shadow-[var(--shadow-card)] sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-xl text-[var(--foreground-strong)]">Задания темы</h2>
        <button
          type="button"
          onClick={onCreateTask}
          className="touch-target rounded-full border-2 border-[var(--accent)] px-4 py-2 text-sm font-semibold text-[var(--accent)] hover:bg-[var(--accent-soft)]"
        >
          + Задание
        </button>
      </div>

      {tasks.length === 0 ? (
        <p className="mt-4 text-sm text-[var(--muted)]">
          В этой теме пока нет заданий. Нажмите «+ Задание».
        </p>
      ) : (
        <ul className="mt-4 space-y-2">
          {tasks.map((task, index) => {
            const active = task.id === selectedTaskId;

            return (
              <li key={task.id}>
                <div
                  className={`flex items-center gap-2 rounded-[1.25rem] border p-3 ${
                    active
                      ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                      : "border-[var(--card-border)] bg-[var(--background)]"
                  }`}
                >
                  <div className="flex flex-col gap-1">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => void moveTask(task.id, "up")}
                      className="rounded px-1 text-xs text-[var(--muted)] disabled:opacity-30"
                      aria-label="Выше"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      disabled={index === tasks.length - 1}
                      onClick={() => void moveTask(task.id, "down")}
                      className="rounded px-1 text-xs text-[var(--muted)] disabled:opacity-30"
                      aria-label="Ниже"
                    >
                      ↓
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => onSelectTask(task.id)}
                    className="min-w-0 flex-1 text-left"
                  >
                    <p className="truncate text-sm font-semibold text-[var(--foreground-strong)]">
                      {task.title}
                    </p>
                    <p className="text-xs text-[var(--muted)]">
                      {answerTypeShortLabel[task.answerType]}
                      {task.imageUrl ? " · есть изображение" : ""}
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
