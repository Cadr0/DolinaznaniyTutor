import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { setRequestLocale } from "next-intl/server";
import { CopyInviteButton } from "@/components/rooms/CopyInviteButton";
import { RoomTopicsList } from "@/components/rooms/RoomTopicsList";
import { buildRoomInviteUrl, ensureAsciiRoomSlug, getRoomForUser } from "@/lib/rooms";
import { getRoomTopics } from "@/lib/marketplace-topics";
import { requireSession } from "@/lib/session";

type Props = {
  params: Promise<{ locale: string; roomId: string }>;
};

export const dynamic = "force-dynamic";

export default async function RoomDetailPage({ params }: Props) {
  const { locale, roomId } = await params;
  setRequestLocale(locale);
  const session = await requireSession(locale);
  const access = await getRoomForUser(roomId, session.user.id, session.user.role ?? "STUDENT");

  if (!access) {
    notFound();
  }

  const { room, isTutor, isStudent } = access;
  const slug = isTutor ? await ensureAsciiRoomSlug(room.id, room.slug) : room.slug;
  const inviteUrl = buildRoomInviteUrl(slug);
  const students = room.members.filter((member) => member.role === "STUDENT");
  const roomTopics = await getRoomTopics(room.id);

  return (
    <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <Link
        href="/dashboard/rooms"
        className="text-sm font-semibold text-[var(--accent)] hover:underline"
      >
        ← Все комнаты
      </Link>

      <div className="relative mt-4 rounded-[2rem] border border-[var(--card-border)] bg-white p-5 shadow-[var(--shadow-card)] sm:p-8">
        {isTutor ? (
          <div className="absolute right-4 top-4 sm:right-6 sm:top-6">
            <CopyInviteButton inviteUrl={inviteUrl} variant="compact" />
          </div>
        ) : null}

        <span className="rounded-full bg-[var(--accent-soft)] px-4 py-1.5 text-sm font-semibold text-[var(--accent)]">
          {isTutor ? "Комната учителя" : "Комната ученика"}
        </span>
        <h1 className="mt-4 pr-12 font-display text-3xl text-[var(--foreground-strong)] sm:pr-14">
          {room.title}
        </h1>
        {room.description ? (
          <p className="mt-2 text-[var(--muted)]">{room.description}</p>
        ) : null}

        {isStudent ? (
          <p className="mt-4 text-sm text-[var(--muted)]">Учитель: {room.owner.name}</p>
        ) : null}
      </div>

      <div className="mt-6 rounded-[2rem] border border-[var(--card-border)] bg-white p-5 shadow-[var(--shadow-card)] sm:p-6">
        <h2 className="font-display text-2xl text-[var(--foreground-strong)]">Ученики</h2>
        {students.length === 0 ? (
          <p className="mt-3 text-sm text-[var(--muted)]">
            {isTutor
              ? "Пока никто не вступил. Отправьте ссылку-приглашение."
              : "В этой комнате пока только вы."}
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {students.map((member) => (
              <li
                key={member.id}
                className="flex items-center gap-3 rounded-[1.25rem] border border-[var(--card-border)] bg-[var(--background)] p-4"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--accent-soft)] text-sm font-bold text-[var(--accent)]">
                  {member.user.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[var(--foreground-strong)]">
                    {member.user.profile?.displayName ?? member.user.name}
                  </p>
                  <p className="truncate text-xs text-[var(--muted)]">{member.user.email}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <RoomTopicsList
        locale={locale}
        roomId={room.id}
        topics={roomTopics}
        isTutor={isTutor}
      />

      {isStudent ? (
        <p className="mt-6 text-sm text-[var(--muted)]">
          Задания и домашняя работа появятся здесь позже.
        </p>
      ) : null}
    </section>
  );
}
