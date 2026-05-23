"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import {
  createTopic,
  deleteTopic,
  toggleTopicPublish,
  updateTopic,
} from "@/app/[locale]/(app)/dashboard/materials/actions";
import { TagBadges } from "@/components/marketplace/TagPicker";
import { RoomDialog } from "@/components/rooms/RoomDialog";
import { TopicForm, type TopicFormData } from "@/components/tasks/TopicForm";
import { isTopicReadyForMarketplace } from "@/lib/topic-readiness";

export type TopicCardData = TopicFormData & {
  taskCount: number;
};

type MaterialsTopicGridProps = {
  locale: string;
  topics: TopicCardData[];
  onOpenTopic: (topicId: string) => void;
};

export function MaterialsTopicGrid({ locale, topics, onOpenTopic }: MaterialsTopicGridProps) {
  const [createOpen, setCreateOpen] = useState(false);
  const [editTopic, setEditTopic] = useState<TopicCardData | null>(null);
  const [deleteTopicConfirm, setDeleteTopicConfirm] = useState<TopicCardData | null>(null);
  const [publishingId, setPublishingId] = useState<string | null>(null);
  const router = useRouter();

  async function confirmDeleteTopic() {
    if (!deleteTopicConfirm) {
      return;
    }

    await deleteTopic(locale, deleteTopicConfirm.id);
    setDeleteTopicConfirm(null);
    setEditTopic(null);
    router.refresh();
  }

  async function handlePublish(topic: TopicCardData) {
    setPublishingId(topic.id);
    try {
      await toggleTopicPublish(locale, topic.id, !topic.isPublished);
      router.refresh();
    } finally {
      setPublishingId(null);
    }
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="flex min-h-[180px] flex-col items-center justify-center gap-2 rounded-[2rem] border-2 border-dashed border-[var(--card-border)] bg-white p-5 text-center shadow-[var(--shadow-card)] transition hover:border-[var(--accent)] hover:bg-[var(--accent-soft)]"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--accent-soft)] text-2xl font-semibold text-[var(--accent)]">
            +
          </span>
          <span className="font-display text-lg text-[var(--foreground-strong)]">Новая тема</span>
          <span className="text-sm text-[var(--muted)]">Создайте тему и добавьте задания</span>
        </button>

        {topics.map((topic) => {
          const ready = isTopicReadyForMarketplace(topic);
          const locked = topic.isPublished;

          return (
            <article
              key={topic.id}
              className={`flex min-h-[180px] flex-col rounded-[2rem] border bg-white p-5 shadow-[var(--shadow-card)] ${
                locked ? "border-[var(--accent)]/40" : "border-[var(--card-border)]"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <h2 className="font-display text-xl text-[var(--foreground-strong)]">
                    {topic.title}
                  </h2>
                  <p className="mt-1 text-xs text-[var(--muted)]">
                    {topic.taskCount}{" "}
                    {topic.taskCount === 1
                      ? "задание"
                      : topic.taskCount >= 2 && topic.taskCount <= 4
                        ? "задания"
                        : "заданий"}
                    {locked ? " · в каталоге" : ""}
                  </p>
                </div>
                {!locked ? (
                  <button
                    type="button"
                    aria-label="Изменить тему"
                    onClick={() => setEditTopic(topic)}
                    className="touch-target shrink-0 rounded-full px-3 py-1 text-sm text-[var(--muted)] hover:bg-[var(--background)]"
                  >
                    ✎
                  </button>
                ) : null}
              </div>

              {locked ? (
                <p className="mt-3 flex-1 rounded-xl bg-[var(--accent-soft)] px-3 py-2 text-sm text-[var(--foreground-strong)]">
                  Снимите тему с маркетплейса, чтобы редактировать или удалить.
                </p>
              ) : topic.description ? (
                <p className="mt-3 line-clamp-2 flex-1 text-sm text-[var(--muted)]">
                  {topic.description}
                </p>
              ) : (
                <p className="mt-3 flex-1 text-sm text-[var(--muted)]">
                  {topic.taskCount === 0
                    ? "Добавьте задания, чтобы опубликовать тему"
                    : "Без описания"}
                </p>
              )}

              {topic.tags.length > 0 ? (
                <div className="mt-3">
                  <TagBadges tags={topic.tags.slice(0, 4)} />
                </div>
              ) : null}

              <div className="mt-4 flex flex-wrap gap-2">
                {!locked ? (
                  <button
                    type="button"
                    onClick={() => onOpenTopic(topic.id)}
                    className="touch-target rounded-full border-2 border-[var(--card-border)] px-4 py-2 text-sm font-semibold text-[var(--foreground-strong)] hover:border-[var(--accent)]"
                  >
                    {topic.taskCount > 0 ? "Редактировать задания" : "Добавить задания"}
                  </button>
                ) : null}

                {(ready || locked) ? (
                  <button
                    type="button"
                    disabled={publishingId === topic.id}
                    onClick={() => void handlePublish(topic)}
                    className="touch-target rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--accent-hover)] disabled:opacity-50"
                  >
                    {locked ? "Убрать из каталога" : "В маркетплейс"}
                  </button>
                ) : null}
              </div>
            </article>
          );
        })}
      </div>

      <RoomDialog open={createOpen} title="Новая тема" onClose={() => setCreateOpen(false)}>
        <TopicForm
          locale={locale}
          hidePublish
          onDone={(topicId) => {
            setCreateOpen(false);
            router.refresh();
            if (topicId) {
              onOpenTopic(topicId);
            }
          }}
          onSubmit={createTopic}
        />
      </RoomDialog>

      <RoomDialog
        open={Boolean(editTopic)}
        title="Изменить тему"
        onClose={() => setEditTopic(null)}
      >
        {editTopic && !editTopic.isPublished ? (
          <TopicForm
            locale={locale}
            topic={editTopic}
            hidePublish
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
    </>
  );
}
