"use client";

import { useMemo, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import type { TaskAnswerType } from "@prisma/client";
import {
  createTopic,
  deleteTopic,
  reorderTask,
  updateTopic,
} from "@/app/[locale]/(app)/dashboard/materials/actions";
import { TagBadges } from "@/components/marketplace/TagPicker";
import { RoomDialog } from "@/components/rooms/RoomDialog";
import { TopicForm, type TopicFormData } from "@/components/tasks/TopicForm";
import { answerTypeShortLabel } from "@/lib/task-labels";

type TaskListItem = {
  id: string;
  title: string;
  answerType: TaskAnswerType;
  sortOrder: number;
  isActive: boolean;
  imageUrl: string | null;
};

type MaterialsNavigatorProps = {
  locale: string;
  topics: TopicFormData[];
  tasks: TaskListItem[];
  selectedTopicId: string | null;
  selectedTaskId: string | null;
  onSelectTopic: (topicId: string) => void;
  onSelectTask: (taskId: string) => void;
  onCreateTask: () => void;
};

export function MaterialsNavigator({
  locale,
  topics,
  tasks,
  selectedTopicId,
  selectedTaskId,
  onSelectTopic,
  onSelectTask,
  onCreateTask,
}: MaterialsNavigatorProps) {
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editTopic, setEditTopic] = useState<TopicFormData | null>(null);
  const [deleteTopicConfirm, setDeleteTopicConfirm] = useState<TopicFormData | null>(null);
  const router = useRouter();

  const selectedTopic = topics.find((topic) => topic.id === selectedTopicId) ?? null;

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

  async function confirmDeleteTopic() {
    if (!deleteTopicConfirm) {
      return;
    }

    await deleteTopic(locale, deleteTopicConfirm.id);
    setDeleteTopicConfirm(null);
    setEditTopic(null);
    router.refresh();
  }

  return (
    <div className="rounded-[2rem] border border-[var(--card-border)] bg-white p-4 shadow-[var(--shadow-card)] sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-xl text-[var(--foreground-strong)]">Материалы</h2>
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="touch-target rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--accent-hover)]"
        >
          + Тема
        </button>
      </div>

      {topics.length === 0 ? (
        <p className="mt-4 text-sm text-[var(--muted)]">
          Создайте первую тему — внутри неё будут задания.
        </p>
      ) : (
        <>
          <label className="mt-4 block text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
            Тема
            <select
              value={selectedTopicId ?? ""}
              onChange={(event) => onSelectTopic(event.target.value)}
              className="touch-target mt-1.5 w-full rounded-2xl border-2 border-[var(--card-border)] bg-white px-4 py-2.5 text-sm font-semibold text-[var(--foreground-strong)] outline-none focus:border-[var(--accent)]"
            >
              {topics.map((topic) => (
                <option key={topic.id} value={topic.id}>
                  {topic.title}
                  {topic.isPublished ? " · в каталоге" : ""}
                </option>
              ))}
            </select>
          </label>

          {selectedTopic ? (
            <div className="mt-3 flex items-center justify-between gap-2 rounded-xl bg-[var(--background)] px-3 py-2">
              <div className="min-w-0">
                <p className="truncate text-xs text-[var(--muted)]">{tasks.length} заданий</p>
                {selectedTopic.tags.length > 0 ? (
                  <div className="mt-1">
                    <TagBadges tags={selectedTopic.tags.slice(0, 3)} />
                  </div>
                ) : null}
              </div>
              <button
                type="button"
                aria-label="Изменить тему"
                onClick={() => setEditTopic(selectedTopic)}
                className="touch-target shrink-0 rounded-full px-3 py-1 text-sm text-[var(--muted)] hover:bg-white"
              >
                ✎
              </button>
            </div>
          ) : null}

          <div className="mt-4 flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-[var(--foreground-strong)]">Задания</p>
            <button
              type="button"
              onClick={onCreateTask}
              disabled={!selectedTopicId}
              className="touch-target rounded-full border-2 border-[var(--accent)] px-3 py-1.5 text-xs font-semibold text-[var(--accent)] hover:bg-[var(--accent-soft)] disabled:opacity-40"
            >
              + Задание
            </button>
          </div>

          {selectedTopicId ? (
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Поиск задания…"
              className="mt-2 w-full rounded-xl border-2 border-[var(--card-border)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
            />
          ) : null}

          {!selectedTopicId ? (
            <p className="mt-3 text-sm text-[var(--muted)]">Выберите тему.</p>
          ) : filteredTasks.length === 0 ? (
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
                          disabled={index === 0}
                          onClick={() => void moveTask(task.id, "up")}
                          className="rounded px-1 text-[10px] text-[var(--muted)] disabled:opacity-30"
                          aria-label="Выше"
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          disabled={index === tasks.length - 1}
                          onClick={() => void moveTask(task.id, "down")}
                          className="rounded px-1 text-[10px] text-[var(--muted)] disabled:opacity-30"
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
                          {task.imageUrl ? " · 📷" : ""}
                        </p>
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}

      <RoomDialog open={createOpen} title="Новая тема" onClose={() => setCreateOpen(false)}>
        <TopicForm
          locale={locale}
          onDone={() => {
            setCreateOpen(false);
            router.refresh();
          }}
          onSubmit={createTopic}
        />
      </RoomDialog>

      <RoomDialog
        open={Boolean(editTopic)}
        title="Изменить тему"
        onClose={() => setEditTopic(null)}
      >
        {editTopic ? (
          <TopicForm
            locale={locale}
            topic={editTopic}
            onDone={() => {
              setEditTopic(null);
              router.refresh();
            }}
            onSubmit={(loc, formData) => updateTopic(loc, editTopic.id, formData)}
            onDelete={() => setDeleteTopicConfirm(editTopic)}
          />
        ) : null}
      </RoomDialog>

      <RoomDialog
        open={Boolean(deleteTopicConfirm)}
        title="Удалить тему?"
        onClose={() => setDeleteTopicConfirm(null)}
      >
        {deleteTopicConfirm ? (
          <div className="space-y-4">
            <p className="text-sm text-[var(--muted)]">
              Тема «{deleteTopicConfirm.title}» и все задания внутри будут удалены без
              возможности восстановления.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => void confirmDeleteTopic()}
                className="touch-target rounded-full bg-red-600 px-5 py-3 text-sm font-semibold text-white hover:bg-red-700"
              >
                Удалить
              </button>
              <button
                type="button"
                onClick={() => setDeleteTopicConfirm(null)}
                className="touch-target rounded-full border-2 border-[var(--card-border)] px-5 py-3 text-sm font-semibold text-[var(--foreground-strong)]"
              >
                Отмена
              </button>
            </div>
          </div>
        ) : null}
      </RoomDialog>
    </div>
  );
}
