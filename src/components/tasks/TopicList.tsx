"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import {
  createTopic,
  deleteTopic,
  updateTopic,
} from "@/app/[locale]/(app)/dashboard/materials/actions";
import { TagBadges, TagPicker } from "@/components/marketplace/TagPicker";
import { RoomDialog } from "@/components/rooms/RoomDialog";

type Topic = {
  id: string;
  title: string;
  description: string | null;
  tags: string[];
  isPublished: boolean;
  _count: { tasks: number };
};

type TopicListProps = {
  locale: string;
  topics: Topic[];
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
  const [editTopic, setEditTopic] = useState<Topic | null>(null);
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
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-semibold text-[var(--foreground-strong)]">
                        {topic.title}
                      </p>
                      {topic.isPublished ? (
                        <span className="shrink-0 rounded-full bg-[var(--accent-soft)] px-2 py-0.5 text-[10px] font-bold uppercase text-[var(--accent)]">
                          В каталоге
                        </span>
                      ) : null}
                    </div>
                    <p className="text-xs text-[var(--muted)]">
                      {topic._count.tasks}{" "}
                      {topic._count.tasks === 1
                        ? "задание"
                        : topic._count.tasks < 5
                          ? "задания"
                          : "заданий"}
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
              if (
                confirm(
                  `Удалить тему «${editTopic.title}» и все задания внутри? Это необратимо.`,
                )
              ) {
                await deleteTopic(locale, editTopic.id);
                setEditTopic(null);
                router.refresh();
              }
            }}
          />
        ) : null}
      </RoomDialog>
    </div>
  );
}

type TopicFormProps = {
  locale: string;
  topic?: Topic;
  onDone: () => void;
  onSubmit: (locale: string, formData: FormData) => Promise<void>;
  onDelete?: () => void;
};

function TopicForm({ locale, topic, onDone, onSubmit, onDelete }: TopicFormProps) {
  return (
    <form
      action={async (formData) => {
        await onSubmit(locale, formData);
        onDone();
      }}
      className="grid gap-4"
    >
      <label className="block text-sm font-semibold text-[var(--foreground-strong)]">
        Название
        <input
          name="title"
          required
          defaultValue={topic?.title ?? ""}
          placeholder="Задание 8. Степени и корни"
          className="touch-target mt-2 w-full rounded-2xl border-2 border-[var(--card-border)] px-4 text-base font-normal outline-none focus:border-[var(--accent)]"
        />
      </label>
      <label className="block text-sm font-semibold text-[var(--foreground-strong)]">
        Описание (необязательно)
        <textarea
          name="description"
          rows={3}
          defaultValue={topic?.description ?? ""}
          placeholder="Краткое описание темы"
          className="mt-2 w-full rounded-2xl border-2 border-[var(--card-border)] px-4 py-3 text-base font-normal outline-none focus:border-[var(--accent)]"
        />
      </label>
      <TagPicker defaultTags={topic?.tags ?? []} />
      <label className="flex items-center gap-2 text-sm font-semibold text-[var(--foreground-strong)]">
        <input
          type="checkbox"
          name="isPublished"
          defaultChecked={topic?.isPublished ?? false}
          className="h-4 w-4 rounded border-[var(--card-border)]"
        />
        Опубликовать в маркетплейсе
      </label>
      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          className="touch-target rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white hover:bg-[var(--accent-hover)]"
        >
          {topic ? "Сохранить" : "Создать тему"}
        </button>
        {onDelete ? (
          <button
            type="button"
            onClick={onDelete}
            className="touch-target rounded-full border-2 border-red-200 px-5 py-3 text-sm font-semibold text-red-600 hover:bg-red-50"
          >
            Удалить тему
          </button>
        ) : null}
      </div>
    </form>
  );
}
