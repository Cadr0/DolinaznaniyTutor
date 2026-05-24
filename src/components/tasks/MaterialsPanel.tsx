"use client";

import { useEffect, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import type { TaskAnswerType } from "@prisma/client";
import { toggleTopicPublish } from "@/app/[locale]/(app)/dashboard/materials/actions";
import { CopyToRoomModal } from "@/components/marketplace/CopyToRoomModal";
import { TaskEditor } from "@/components/tasks/TaskEditor";
import { MaterialsTaskNavigator } from "@/components/tasks/MaterialsTaskNavigator";
import {
  MaterialsTopicGrid,
  type TopicCardData,
} from "@/components/tasks/MaterialsTopicGrid";
import { TagBadges } from "@/components/marketplace/TagPicker";
import type { TaskWithDetails } from "@/lib/tasks";
import { isTopicReadyForMarketplace } from "@/lib/topic-readiness";

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
  topics: TopicCardData[];
  tasks: TaskListItem[];
  selectedTopicId: string | null;
  selectedTaskId: string | null;
  selectedTask: TaskWithDetails | null;
  isNewTask: boolean;
  rooms: { id: string; title: string }[];
};

export function MaterialsPanel({
  locale,
  topics,
  tasks,
  selectedTopicId,
  selectedTaskId,
  selectedTask,
  isNewTask,
  rooms,
}: MaterialsPanelProps) {
  const router = useRouter();
  const [publishing, setPublishing] = useState(false);

  const selectedTopic = topics.find((topic) => topic.id === selectedTopicId) ?? null;
  const topicLocked = selectedTopic?.isPublished ?? false;

  useEffect(() => {
    if (topicLocked && selectedTopicId) {
      router.replace("/dashboard/materials");
    }
  }, [topicLocked, selectedTopicId, router]);

  function goToTopics() {
    router.push("/dashboard/materials");
  }

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
  const topicReady = selectedTopic ? isTopicReadyForMarketplace(selectedTopic) : false;

  async function handlePublish() {
    if (!selectedTopic) {
      return;
    }

    setPublishing(true);
    try {
      await toggleTopicPublish(locale, selectedTopic.id, !selectedTopic.isPublished);
      router.refresh();
    } finally {
      setPublishing(false);
    }
  }

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

      {!selectedTopicId || topicLocked ? (
        <MaterialsTopicGrid locale={locale} topics={topics} onOpenTopic={goToTopic} />
      ) : (
        <>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={goToTopics}
              className="touch-target inline-flex items-center gap-2 rounded-full border-2 border-[var(--card-border)] px-4 py-2 text-sm font-semibold text-[var(--foreground-strong)] hover:border-[var(--accent)]"
            >
              ← Все темы
            </button>

            {(topicReady || selectedTopic?.isPublished) ? (
              <div className="flex flex-wrap gap-2">
                {topicReady && selectedTopic && tasks.length > 0 ? (
                  <CopyToRoomModal
                    locale={locale}
                    topicId={selectedTopic.id}
                    topicTitle={selectedTopic.title}
                    rooms={rooms}
                    source="bank"
                    triggerLabel="В комнату"
                    buttonClassName="touch-target rounded-full border-2 border-[var(--card-border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--foreground-strong)] hover:border-[var(--accent)]"
                  />
                ) : null}
                <button
                  type="button"
                  disabled={publishing}
                  onClick={() => void handlePublish()}
                  className="touch-target rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--accent-hover)] disabled:opacity-50"
                >
                  {selectedTopic?.isPublished ? "Убрать из каталога" : "В маркетплейс"}
                </button>
              </div>
            ) : null}
          </div>

          {selectedTopic ? (
            <div className="mb-4 rounded-[1.5rem] border border-[var(--card-border)] bg-white px-4 py-3 shadow-[var(--shadow-card)] sm:px-5">
              <h2 className="font-display text-2xl text-[var(--foreground-strong)]">
                {selectedTopic.title}
              </h2>
              {selectedTopic.description ? (
                <p className="mt-1 text-sm text-[var(--muted)]">{selectedTopic.description}</p>
              ) : null}
              {selectedTopic.tags.length > 0 ? (
                <div className="mt-2">
                  <TagBadges tags={selectedTopic.tags} />
                </div>
              ) : null}
            </div>
          ) : null}

          <div className="grid gap-6 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)]">
            <MaterialsTaskNavigator
              locale={locale}
              topicTitle={selectedTopic?.title ?? "Тема"}
              tasks={tasks}
              selectedTaskId={selectedTaskId}
              locked={topicLocked}
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
                  readOnly={topicLocked}
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
        </>
      )}
    </section>
  );
}
