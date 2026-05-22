import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { setRequestLocale } from "next-intl/server";
import { CopyInviteButton } from "@/components/rooms/CopyInviteButton";
import { createAssignment, publishAssignmentAction, submitAssignment } from "../actions";
import { buildRoomInviteUrl, ensureAsciiRoomSlug, getRoomForUser } from "@/lib/rooms";
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
  const assignments = isTutor
    ? room.assignments
    : room.assignments.filter((assignment) => assignment.status === "PUBLISHED");

  return (
    <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <Link
        href="/dashboard/rooms"
        className="text-sm font-semibold text-[var(--accent)] hover:underline"
      >
        ← Все комнаты
      </Link>

      <div className="mt-4 rounded-[2rem] border border-[var(--card-border)] bg-white p-5 shadow-[var(--shadow-card)] sm:p-8">
        <span className="rounded-full bg-[var(--accent-soft)] px-4 py-1.5 text-sm font-semibold text-[var(--accent)]">
          {isTutor ? "Комната учителя" : "Комната ученика"}
        </span>
        <h1 className="mt-4 font-display text-3xl text-[var(--foreground-strong)]">{room.title}</h1>
        {room.description ? (
          <p className="mt-2 text-[var(--muted)]">{room.description}</p>
        ) : null}

        {isTutor ? (
          <div className="mt-6">
            <CopyInviteButton inviteUrl={inviteUrl} />
          </div>
        ) : (
          <p className="mt-4 text-sm text-[var(--muted)]">Учитель: {room.owner.name}</p>
        )}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="space-y-6">
          <div className="rounded-[2rem] border border-[var(--card-border)] bg-white p-5 shadow-[var(--shadow-card)] sm:p-6">
            <h2 className="font-display text-2xl text-[var(--foreground-strong)]">Задания</h2>

            {isTutor ? (
              <form
                action={createAssignment.bind(null, locale, room.id)}
                className="mt-6 grid gap-4 border-b border-[var(--card-border)] pb-6"
              >
                <label className="block text-sm font-semibold text-[var(--foreground-strong)]">
                  Новое задание
                  <input
                    name="title"
                    required
                    placeholder="Название задания"
                    className="touch-target mt-2 w-full rounded-2xl border-2 border-[var(--card-border)] px-4 text-base font-normal outline-none focus:border-[var(--accent)]"
                  />
                </label>
                <label className="block text-sm font-semibold text-[var(--foreground-strong)]">
                  Текст задания
                  <textarea
                    name="content"
                    required
                    rows={5}
                    placeholder="Опишите, что нужно сделать ученику"
                    className="mt-2 w-full rounded-2xl border-2 border-[var(--card-border)] px-4 py-3 text-base font-normal outline-none focus:border-[var(--accent)]"
                  />
                </label>
                <button className="touch-target w-fit rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white hover:bg-[var(--accent-hover)]">
                  Сохранить черновик
                </button>
              </form>
            ) : null}

            <div className="mt-6 space-y-4">
              {assignments.length === 0 ? (
                <p className="text-sm text-[var(--muted)]">
                  {isTutor ? "Добавьте первое задание для учеников." : "Пока нет заданий."}
                </p>
              ) : (
                assignments.map((assignment) => {
                  const submission = assignment.submissions.find(
                    (item) => item.studentId === session.user.id
                  );

                  return (
                    <div
                      key={assignment.id}
                      className="rounded-[1.5rem] border border-[var(--card-border)] bg-[var(--background)] p-5"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <h3 className="font-display text-xl text-[var(--foreground-strong)]">
                            {assignment.title}
                          </h3>
                          <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                            {assignment.status === "PUBLISHED" ? "Опубликовано" : "Черновик"}
                          </p>
                        </div>
                        {isTutor && assignment.status === "DRAFT" ? (
                          <form action={publishAssignmentAction.bind(null, locale, assignment.id)}>
                            <button className="rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--accent-hover)]">
                              Раздать ученикам
                            </button>
                          </form>
                        ) : null}
                      </div>

                      <pre className="mt-4 whitespace-pre-wrap text-sm text-[var(--foreground)]">
                        {assignment.content}
                      </pre>

                      {isStudent && assignment.status === "PUBLISHED" ? (
                        <form
                          action={submitAssignment.bind(null, locale, assignment.id)}
                          className="mt-4 grid gap-3 border-t border-[var(--card-border)] pt-4"
                        >
                          <label className="block text-sm font-semibold text-[var(--foreground-strong)]">
                            Ваш ответ
                            <textarea
                              name="content"
                              required
                              rows={4}
                              defaultValue={submission?.content ?? ""}
                              className="mt-2 w-full rounded-2xl border-2 border-[var(--card-border)] px-4 py-3 text-base font-normal outline-none focus:border-[var(--accent)]"
                            />
                          </label>
                          <div className="flex items-center gap-3">
                            <button className="rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--accent-hover)]">
                              {submission?.status === "SUBMITTED" ? "Обновить ответ" : "Отправить"}
                            </button>
                            {submission?.status === "SUBMITTED" ? (
                              <span className="text-sm font-semibold text-[var(--accent)]">
                                Ответ отправлен
                              </span>
                            ) : null}
                          </div>
                        </form>
                      ) : null}

                      {isTutor && assignment.status === "PUBLISHED" ? (
                        <div className="mt-4 border-t border-[var(--card-border)] pt-4">
                          <p className="text-sm font-semibold text-[var(--foreground-strong)]">
                            Ответы учеников:{" "}
                            {assignment.submissions.filter((s) => s.status === "SUBMITTED").length}
                          </p>
                        </div>
                      ) : null}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-[2rem] border border-[var(--card-border)] bg-white p-5 shadow-[var(--shadow-card)]">
            <h2 className="font-display text-xl text-[var(--foreground-strong)]">Ученики</h2>
            {students.length === 0 ? (
              <p className="mt-3 text-sm text-[var(--muted)]">
                Пока никто не вступил. Отправьте ссылку-приглашение.
              </p>
            ) : (
              <ul className="mt-4 space-y-3">
                {students.map((member) => (
                  <li key={member.id} className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--accent-soft)] text-sm font-bold text-[var(--accent)]">
                      {member.user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[var(--foreground-strong)]">
                        {member.user.profile?.displayName ?? member.user.name}
                      </p>
                      <p className="text-xs text-[var(--muted)]">{member.user.email}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>
      </div>
    </section>
  );
}
