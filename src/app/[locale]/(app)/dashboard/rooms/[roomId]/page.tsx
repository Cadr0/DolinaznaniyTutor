import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { CopyInviteButton } from "@/components/rooms/CopyInviteButton";
import { RoomStudentsSection } from "@/components/rooms/RoomStudentsSection";
import { RoomTopicsList } from "@/components/rooms/RoomTopicsList";
import { buildRoomInviteUrl, ensureAsciiRoomSlug, getRoomForUser } from "@/lib/rooms";
import { getRoomTopics } from "@/lib/marketplace-topics";
import { getStudentAssignments } from "@/lib/student-assignments";
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
  const students = room.members
    .filter((member) => member.role === "STUDENT")
    .map((member) => ({
      id: member.user.id,
      name: member.user.profile?.displayName ?? member.user.name,
      email: member.user.email,
    }));
  const roomTopics = await getRoomTopics(room.id);

  const studentAssignments = isStudent
    ? (await getStudentAssignments(session.user.id)).filter(
        (assignment) => assignment.roomId === room.id,
      )
    : [];

  const t = isStudent ? await getTranslations("app.homeworkPage") : null;

  return (
    <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <Link
        href="/dashboard/rooms"
        className="text-sm font-semibold text-[var(--accent)] hover:underline"
      >
        ← Все комнаты
      </Link>

      <div className="mt-4 rounded-[2rem] border border-[var(--card-border)] bg-white p-5 shadow-[var(--shadow-card)] sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <span className="rounded-full bg-[var(--accent-soft)] px-4 py-1.5 text-sm font-semibold text-[var(--accent)]">
            {isTutor ? "Комната учителя" : "Комната ученика"}
          </span>
          {isTutor ? <CopyInviteButton inviteUrl={inviteUrl} variant="compact" /> : null}
        </div>
        <h1 className="mt-4 font-display text-3xl text-[var(--foreground-strong)]">
          {room.title}
        </h1>
        {room.description ? (
          <p className="mt-2 text-[var(--muted)]">{room.description}</p>
        ) : null}

        {isStudent ? (
          <p className="mt-4 text-sm text-[var(--muted)]">Учитель: {room.owner.name}</p>
        ) : null}
      </div>

      <RoomStudentsSection
        locale={locale}
        roomId={room.id}
        students={students}
        isTutor={isTutor}
      />

      <RoomTopicsList
        locale={locale}
        roomId={room.id}
        topics={roomTopics}
        isTutor={isTutor}
      />

      {isStudent && studentAssignments.length > 0 && t ? (
        <div className="mt-6 rounded-[2rem] border border-[var(--card-border)] bg-white p-5 shadow-[var(--shadow-card)] sm:p-6">
          <h2 className="font-display text-2xl text-[var(--foreground-strong)]">
            {t("myHomeworkInRoom")}
          </h2>
          <ul className="mt-4 space-y-2">
            {studentAssignments.map((assignment) => (
              <li key={assignment.id}>
                <Link
                  href={`/dashboard/homework/${assignment.id}`}
                  className="flex items-center justify-between rounded-xl border border-[var(--card-border)] bg-[var(--background)] px-4 py-3 text-sm font-semibold text-[var(--accent)] hover:border-[var(--accent)]/40"
                >
                  <span>{assignment.topicTitle}</span>
                  <span>
                    {assignment.completedTasks}/{assignment.totalTasks}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href="/dashboard/homework"
            className="mt-4 inline-block text-sm font-semibold text-[var(--accent)] hover:underline"
          >
            {t("title")} →
          </Link>
        </div>
      ) : null}
    </section>
  );
}
