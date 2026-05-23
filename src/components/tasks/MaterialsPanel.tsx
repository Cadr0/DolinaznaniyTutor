"use client";

import { useRouter } from "@/i18n/navigation";
import type { TaskAnswerType } from "@prisma/client";
import { TaskEditor } from "@/components/tasks/TaskEditor";
import { MaterialsNavigator } from "@/components/tasks/MaterialsNavigator";
import type { TopicFormData } from "@/components/tasks/TopicForm";
import type { TaskWithDetails } from "@/lib/tasks";

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
  topics: TopicFormData[];
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
          Создавайте темы и задания — перетащите картинку в конструктор или посмотрите предпросмотр
          перед публикацией.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)]">
        <MaterialsNavigator
          locale={locale}
          topics={topics}
          tasks={tasks}
          selectedTopicId={selectedTopicId}
          selectedTaskId={selectedTaskId}
          onSelectTopic={goToTopic}
          onSelectTask={goToTask}
          onCreateTask={goToNewTask}
        />

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
            <div className="flex min-h-[280px] items-center justify-center rounded-[2rem] border border-dashed border-[var(--card-border)] bg-white p-6 shadow-[var(--shadow-card)]">
              <p className="text-center text-sm text-[var(--muted)]">
                Выберите задание слева или нажмите «+ Задание».
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
