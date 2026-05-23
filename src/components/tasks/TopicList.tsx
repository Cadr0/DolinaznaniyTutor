"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import {
  createTopic,
  deleteTopic,
  updateTopic,
} from "@/app/[locale]/(app)/dashboard/materials/actions";
import { TagBadges } from "@/components/marketplace/TagPicker";
import { RoomDialog } from "@/components/rooms/RoomDialog";
import { TopicForm, type TopicFormData } from "@/components/tasks/TopicForm";

/** @deprecated Use MaterialsNavigator instead */
export type { TopicFormData };

type TopicListProps = {
  locale: string;
  topics: TopicFormData[];
  selectedTopicId: string | null;
  onSelectTopic: (topicId: string) => void;
};

export function TopicList({
  locale,
  topics,
  selectedTopicId,
  onSelectTopic,
}: TopicListProps) {
  const [createOpen, setCreateOpen] = useState(false);
  const [editTopic, setEditTopic] = useState<TopicFormData | null>(null);
  const router = useRouter();

  return (
    <div className="rounded-[2rem] border border-[var(--card-border)] bg-white p-4 shadow-[var(--shadow-card)] sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-xl text-[var(--foreground-strong)]">Темы</h2>
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
        <ul className="mt-4 space-y-2">
          {topics.map((topic) => {
            const active = topic.id === selectedTopicId;

            return (
              <li key={topic.id}>
                <div
                  className={`flex items-center gap-2 rounded-[1.25rem] border p-3 transition-colors ${
                    active
                      ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                      : "border-[var(--card-border)] bg-[var(--background)]"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => onSelectTopic(topic.id)}
                    className="min-w-0 flex-1 text-left"
                  >
                    <p className="truncate text-sm font-semibold text-[var(--foreground-strong)]">
                      {topic.title}
                    </p>
                    {topic.tags.length > 0 ? (
                      <div className="mt-2">
                        <TagBadges tags={topic.tags.slice(0, 3)} />
                      </div>
                    ) : null}
                  </button>
                  <button
                    type="button"
                    aria-label="Изменить тему"
                    onClick={() => setEditTopic(topic)}
                    className="touch-target rounded-full px-3 py-1 text-sm text-[var(--muted)] hover:bg-white"
                  >
                    ✎
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
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
            onDelete={async () => {
              await deleteTopic(locale, editTopic.id);
              setEditTopic(null);
              router.refresh();
            }}
          />
        ) : null}
      </RoomDialog>
    </div>
  );
}

export { TopicForm };
