"use client";

import { useMemo, useState } from "react";
import { CopyToRoomModal } from "@/components/marketplace/CopyToRoomModal";
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

type TaskPreview = {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
};

type TopicDetail = {
  id: string;
  title: string;
  description: string | null;
  tags: string[];
  tutor: { name: string; email: string };
  tasks: TaskPreview[];
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

  function toggleTagFilter(tag: string) {
    setActiveTags((current) =>
      current.includes(tag) ? current.filter((item) => item !== tag) : [...current, tag],
    );
  }

  async function openDetail(topicId: string) {
    setLoadingDetail(true);
    setDetailOpen(true);

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
        title={detailTopic?.title ?? "Тема"}
        onClose={() => {
          setDetailOpen(false);
          setDetailTopic(null);
        }}
      >
        {loadingDetail ? (
          <p className="text-sm text-[var(--muted)]">Загрузка…</p>
        ) : detailTopic ? (
          <div>
            {detailTopic.description ? (
              <p className="mb-4 text-sm text-[var(--muted)]">{detailTopic.description}</p>
            ) : null}
            <TagBadges tags={detailTopic.tags} />
            <ul className="mt-4 max-h-64 space-y-2 overflow-y-auto">
              {detailTopic.tasks.map((task) => (
                <li
                  key={task.id}
                  className="rounded-xl border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm"
                >
                  <p className="font-semibold text-[var(--foreground-strong)]">{task.title}</p>
                  {task.description ? (
                    <p className="mt-1 text-xs text-[var(--muted)]">{task.description}</p>
                  ) : null}
                </li>
              ))}
            </ul>
            <div className="mt-4">
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
