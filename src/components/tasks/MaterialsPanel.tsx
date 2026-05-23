"use client";

import { useRouter } from "@/i18n/navigation";
import type { TaskAnswerType } from "@prisma/client";
import { TaskEditor } from "@/components/tasks/TaskEditor";
import { TaskList } from "@/components/tasks/TaskList";
import { TopicList } from "@/components/tasks/TopicList";
import type { TaskWithDetails } from "@/lib/tasks";

type Topic = {
  id: string;
  title: string;
  description: string | null;
  tags: string[];
  isPublished: boolean;
  _count: { tasks: number };
};

type TaskListItem = {
  id: string;
  title: string;
  answerType: TaskAnswerType;
  sortOrder: number;
  isActive: boolean;
  imageUrl: string | null;
};

type MaterialsPanelProps = {
  locale: string;
  topics: Topic[];
  tasks: TaskListItem[];
  selectedTopicId: string | null;
  selectedTaskId: string | null;
  selectedTask: TaskWithDetails | null;
  isNewTask: boolean;
};

export function MaterialsPanel({
  locale,
  topics,
  tasks,
  selectedTopicId,
  selectedTaskId,
  selectedTask,
  isNewTask,
}: MaterialsPanelProps) {
  const router = useRouter();

  function goToTopic(topicId: string) {
    router.push(`/dashboard/materials?topic=${topicId}`);
  }

  function goToTask(taskId: string) {
    if (!selectedTopicId) {
      return;
    }

    router.push(`/dashboard/materials?topic=${selectedTopicId}&task=${taskId}`);
  }

  function goToNewTask() {
    if (!selectedTopicId) {
      return;
    }

    router.push(`/dashboard/materials?topic=${selectedTopicId}&new=1`);
  }

  const showEditor = isNewTask || Boolean(selectedTaskId);

  return (
    <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-[var(--accent)]">
          Материалы
        </p>
        <h1 className="mt-2 font-display text-3xl text-[var(--foreground-strong)]">
          Банк заданий
        </h1>
        <p className="mt-2 max-w-2xl text-[var(--muted)]">
          Создавайте темы и задания — позже их можно будет назначать ученикам в комнатах.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)]">
        <div className="space-y-6">
          <TopicList
            locale={locale}
            topics={topics}
            selectedTopicId={selectedTopicId}
            onSelectTopic={goToTopic}
          />
          {selectedTopicId ? (
            <TaskList
              locale={locale}
              tasks={tasks}
              selectedTaskId={selectedTaskId}
              onSelectTask={goToTask}
              onCreateTask={goToNewTask}
            />
          ) : null}
        </div>

        <div>
          {showEditor ? (
            <TaskEditor
              key={isNewTask ? `new-${selectedTopicId}` : selectedTaskId ?? "edit"}
              locale={locale}
              topics={topics.map((topic) => ({ id: topic.id, title: topic.title }))}
              selectedTopicId={selectedTopicId}
              task={isNewTask ? null : selectedTask}
              mode={isNewTask ? "create" : "edit"}
              onCreated={(taskId) => goToTask(taskId)}
              onDeleted={() => {
                if (selectedTopicId) {
                  router.push(`/dashboard/materials?topic=${selectedTopicId}`);
                }
              }}
            />
          ) : (
            <div className="rounded-[2rem] border border-[var(--card-border)] bg-white p-6 shadow-[var(--shadow-card)]">
              <p className="text-sm text-[var(--muted)]">
                Выберите задание слева или создайте новое.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
