"use client";

import { useMemo, useState } from "react";
import { CopyToRoomModal } from "@/components/marketplace/CopyToRoomModal";
import {
  MarketplaceTaskPreview,
  type MarketplaceTaskDetail,
} from "@/components/marketplace/MarketplaceTaskPreview";
import { TagBadges } from "@/components/marketplace/TagPicker";
import { RoomDialog } from "@/components/rooms/RoomDialog";
import { fetchMarketplaceTopicDetail } from "@/app/[locale]/(app)/dashboard/marketplace/actions";
import { getTopicAuthorLabel } from "@/lib/marketplace-topics";

type TopicItem = {
  id: string;
  title: string;
  description: string | null;
  tags: string[];
  tutor: { name: string; email: string };
  _count: { tasks: number };
};

type TopicDetail = {
  id: string;
  title: string;
  description: string | null;
  tags: string[];
  tutor: { name: string; email: string };
  tasks: MarketplaceTaskDetail[];
};

type RoomOption = {
  id: string;
  title: string;
};

type MarketplacePanelProps = {
  locale: string;
  topics: TopicItem[];
  availableTags: string[];
  rooms: RoomOption[];
  preselectedRoomId?: string | null;
};

function formatTaskText(text: string): string {
  return text.replace(/\\r\\n/g, "\n").replace(/\\n/g, "\n").replace(/\r\n/g, "\n");
}

function taskPreviewLine(task: MarketplaceTaskDetail): string {
  const parts: string[] = [];

  if (task.description) {
    parts.push(formatTaskText(task.description));
  }

  if (task.imageUrl) {
    parts.push("📷 есть изображение");
  }

  if (task.answerType === "CHOICE" && task.choiceOptions.length > 0) {
    parts.push(`${task.choiceOptions.length} вариантов`);
  }

  if (task.answerType === "TEXT" && task.alternativeAnswers.length > 0) {
    parts.push(`${task.alternativeAnswers.length} альт. ответов`);
  }

  return parts.join(" · ");
}

export function MarketplacePanel({
  locale,
  topics,
  availableTags,
  rooms,
  preselectedRoomId,
}: MarketplacePanelProps) {
  const [search, setSearch] = useState("");
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [detailTopic, setDetailTopic] = useState<TopicDetail | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return topics.filter((topic) => {
      const matchesSearch =
        !query ||
        topic.title.toLowerCase().includes(query) ||
        (topic.description ?? "").toLowerCase().includes(query);

      const matchesTags =
        activeTags.length === 0 || activeTags.every((tag) => topic.tags.includes(tag));

      return matchesSearch && matchesTags;
    });
  }, [topics, search, activeTags]);

  const selectedTask = useMemo(
    () => detailTopic?.tasks.find((task) => task.id === selectedTaskId) ?? null,
    [detailTopic, selectedTaskId],
  );

  function toggleTagFilter(tag: string) {
    setActiveTags((current) =>
      current.includes(tag) ? current.filter((item) => item !== tag) : [...current, tag],
    );
  }

  function closeDetail() {
    setDetailOpen(false);
    setDetailTopic(null);
    setSelectedTaskId(null);
  }

  async function openDetail(topicId: string) {
    setLoadingDetail(true);
    setDetailOpen(true);
    setSelectedTaskId(null);

    try {
      const detail = await fetchMarketplaceTopicDetail(topicId);
      setDetailTopic(detail);
    } finally {
      setLoadingDetail(false);
    }
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-[var(--accent)]">
          Маркетплейс
        </p>
        <h1 className="mt-2 font-display text-3xl text-[var(--foreground-strong)]">
          Каталог тем
        </h1>
        <p className="mt-2 max-w-2xl text-[var(--muted)]">
          Выберите тему и добавьте её в комнату — ученики смогут проходить её как домашнее задание
          позже.
        </p>
        {preselectedRoomId ? (
          <p className="mt-2 text-sm font-semibold text-[var(--accent)]">
            Выберите тему для добавления в комнату.
          </p>
        ) : null}
      </div>

      <div className="rounded-[2rem] border border-[var(--card-border)] bg-white p-4 shadow-[var(--shadow-card)] sm:p-5">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Поиск по названию или описанию"
          className="touch-target w-full rounded-2xl border-2 border-[var(--card-border)] px-4 py-3 text-base outline-none focus:border-[var(--accent)]"
        />

        {availableTags.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {availableTags.map((tag) => {
              const active = activeTags.includes(tag);

              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTagFilter(tag)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                    active
                      ? "bg-[var(--accent)] text-white"
                      : "border border-[var(--card-border)] text-[var(--muted)] hover:border-[var(--accent)]"
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>

      {filtered.length === 0 ? (
        <p className="mt-6 text-sm text-[var(--muted)]">Темы не найдены. Попробуйте другой фильтр.</p>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {filtered.map((topic) => (
            <article
              key={topic.id}
              className="rounded-[2rem] border border-[var(--card-border)] bg-white p-5 shadow-[var(--shadow-card)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="font-display text-xl text-[var(--foreground-strong)]">
                    {topic.title}
                  </h2>
                  <p className="mt-1 text-xs text-[var(--muted)]">
                    {getTopicAuthorLabel(topic.tutor.name, topic.tutor.email)} · {topic._count.tasks}{" "}
                    заданий
                  </p>
                </div>
              </div>

              {topic.description ? (
                <p className="mt-3 line-clamp-3 text-sm text-[var(--muted)]">{topic.description}</p>
              ) : null}

              <div className="mt-3">
                <TagBadges tags={topic.tags} />
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => void openDetail(topic.id)}
                  className="touch-target rounded-full border-2 border-[var(--card-border)] px-4 py-2 text-sm font-semibold text-[var(--foreground-strong)] hover:border-[var(--accent)]"
                >
                  Подробнее
                </button>
                <CopyToRoomModal
                  locale={locale}
                  topicId={topic.id}
                  topicTitle={topic.title}
                  rooms={rooms}
                  preselectedRoomId={preselectedRoomId}
                />
              </div>
            </article>
          ))}
        </div>
      )}

      <RoomDialog
        open={detailOpen}
        title={selectedTask?.title ?? detailTopic?.title ?? "Тема"}
        maxWidthClass={selectedTask ? "max-w-3xl" : "max-w-2xl"}
        maxHeightClass="max-h-[min(92dvh,880px)]"
        onBack={selectedTask ? () => setSelectedTaskId(null) : undefined}
        onClose={closeDetail}
      >
        {loadingDetail ? (
          <p className="text-sm text-[var(--muted)]">Загрузка…</p>
        ) : selectedTask ? (
          <MarketplaceTaskPreview task={selectedTask} />
        ) : detailTopic ? (
          <div className="flex min-h-[min(70vh,640px)] flex-col">
            {detailTopic.description ? (
              <p className="mb-4 shrink-0 text-sm text-[var(--muted)]">{detailTopic.description}</p>
            ) : null}
            <div className="shrink-0">
              <TagBadges tags={detailTopic.tags} />
            </div>
            <p className="mt-4 shrink-0 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
              Задания ({detailTopic.tasks.length})
            </p>
            <ul className="mt-2 min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
              {detailTopic.tasks.map((task) => {
                const preview = taskPreviewLine(task);

                return (
                  <li key={task.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedTaskId(task.id)}
                      className="w-full rounded-xl border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-left text-sm transition hover:border-[var(--accent)] hover:bg-white"
                    >
                      <p className="font-semibold text-[var(--foreground-strong)]">{task.title}</p>
                      {preview ? (
                        <p className="mt-1 line-clamp-2 text-xs text-[var(--muted)]">{preview}</p>
                      ) : null}
                      <p className="mt-2 text-xs font-semibold text-[var(--accent)]">
                        Открыть задание →
                      </p>
                    </button>
                  </li>
                );
              })}
            </ul>
            <div className="mt-4 shrink-0 pt-2">
              <CopyToRoomModal
                locale={locale}
                topicId={detailTopic.id}
                topicTitle={detailTopic.title}
                rooms={rooms}
                preselectedRoomId={preselectedRoomId}
              />
            </div>
          </div>
        ) : (
          <p className="text-sm text-[var(--muted)]">Тема не найдена.</p>
        )}
      </RoomDialog>
    </section>
  );
}
