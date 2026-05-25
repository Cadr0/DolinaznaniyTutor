"use client";

import { useRouter } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import { removeRoomTopicAction } from "@/app/[locale]/(app)/dashboard/rooms/room-topics-actions";
import { TagBadges } from "@/components/marketplace/TagPicker";

type RoomTopicItem = {
  id: string;
  title: string;
  description: string | null;
  tags: string[];
  _count: { tasks: number };
};

type RoomTopicsListProps = {
  locale: string;
  roomId: string;
  topics: RoomTopicItem[];
  isTutor: boolean;
};

export function RoomTopicsList({ locale, roomId, topics, isTutor }: RoomTopicsListProps) {
  const router = useRouter();

  async function handleRemove(topicId: string, title: string) {
    if (!confirm(`Удалить тему «${title}» из комнаты?`)) {
      return;
    }

    await removeRoomTopicAction(locale, topicId, roomId);
    router.refresh();
  }

  return (
    <div className="mt-6 rounded-[2rem] border border-[var(--card-border)] bg-white p-5 shadow-[var(--shadow-card)] sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-2xl text-[var(--foreground-strong)]">Темы</h2>
        {isTutor ? (
          <Link
            href="/dashboard/marketplace"
            className="touch-target rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--accent-hover)]"
          >
            Добавить из маркетплейса
          </Link>
        ) : null}
      </div>

      {topics.length === 0 ? (
        <p className="mt-3 text-sm text-[var(--muted)]">
          {isTutor
            ? "Пока нет тем. Добавьте из маркетплейса."
            : "Учитель ещё не добавил темы в эту комнату."}
        </p>
      ) : (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {topics.map((topic) => (
            <article
              key={topic.id}
              className="flex min-h-[220px] flex-col rounded-[2rem] border border-[var(--card-border)] bg-white p-5 shadow-[var(--shadow-card)]"
            >
              <div className="aspect-[16/10] overflow-hidden rounded-2xl bg-gradient-to-br from-[var(--accent-soft)] via-white to-[var(--background)]">
                <div className="flex h-full flex-col justify-end p-4">
                  <span className="w-fit rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-[var(--accent)] shadow-sm">
                    {topic._count.tasks}{" "}
                    {topic._count.tasks === 1
                      ? "задание"
                      : topic._count.tasks < 5
                        ? "задания"
                        : "заданий"}
                  </span>
                </div>
              </div>

              <div className="mt-4 min-w-0 flex-1">
                <h3 className="font-display text-lg text-[var(--foreground-strong)]">
                  {topic.title}
                </h3>
                {topic.description ? (
                  <p className="mt-2 line-clamp-2 text-sm text-[var(--muted)]">
                    {topic.description}
                  </p>
                ) : (
                  <p className="mt-2 text-sm text-[var(--muted)]">Без описания</p>
                )}
                {topic.tags.length > 0 ? (
                  <div className="mt-3">
                    <TagBadges tags={topic.tags.slice(0, 4)} />
                  </div>
                ) : null}
              </div>

              {isTutor ? (
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={() => void handleRemove(topic.id, topic.title)}
                    className="touch-target rounded-full border-2 border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
                  >
                    Удалить
                  </button>
                </div>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
