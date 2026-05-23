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
            href={`/dashboard/marketplace?roomId=${roomId}`}
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
        <ul className="mt-4 space-y-3">
          {topics.map((topic) => (
            <li
              key={topic.id}
              className="rounded-[1.25rem] border border-[var(--card-border)] bg-[var(--background)] p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[var(--foreground-strong)]">
                    {topic.title}
                  </p>
                  {topic.description ? (
                    <p className="mt-1 text-xs text-[var(--muted)]">{topic.description}</p>
                  ) : null}
                  <p className="mt-2 text-xs text-[var(--muted)]">
                    {topic._count.tasks}{" "}
                    {topic._count.tasks === 1
                      ? "задание"
                      : topic._count.tasks < 5
                        ? "задания"
                        : "заданий"}
                  </p>
                  <div className="mt-2">
                    <TagBadges tags={topic.tags} />
                  </div>
                </div>
                {isTutor ? (
                  <button
                    type="button"
                    onClick={() => void handleRemove(topic.id, topic.title)}
                    className="touch-target rounded-full px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-50"
                  >
                    Удалить
                  </button>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
