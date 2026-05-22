import { Link } from "@/i18n/navigation";
import { setRequestLocale } from "next-intl/server";
import { RoomStudentsDrawer } from "@/components/rooms/RoomStudentsDrawer";
import { getTeacherStudents } from "@/lib/rooms";
import { createRoom } from "./actions";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

type Props = { params: Promise<{ locale: string }> };

export const dynamic = "force-dynamic";

export default async function RoomsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const session = await requireSession(locale);
  const isTutor = session.user.role === "TUTOR";

  if (isTutor) {
    const [rooms, students] = await Promise.all([
      prisma.room.findMany({
        where: { ownerId: session.user.id },
        include: {
          members: {
            where: { role: "STUDENT" },
          },
          assignments: {
            where: { status: "PUBLISHED" },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      getTeacherStudents(session.user.id),
    ]);

    return (
      <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="grid gap-6 lg:grid-cols-[20rem_1fr]">
          <div className="rounded-[2rem] border border-[var(--card-border)] bg-white p-5 shadow-[var(--shadow-card)] sm:p-6">
            <h1 className="font-display text-2xl text-[var(--foreground-strong)]">Новая комната</h1>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Создайте комнату и отправьте ссылку ученикам.
            </p>
            <form action={createRoom.bind(null, locale)} className="mt-6 grid gap-4">
              <label className="block text-sm font-semibold text-[var(--foreground-strong)]">
                Название
                <input
                  name="title"
                  required
                  placeholder="Математика 8 класс"
                  className="touch-target mt-2 w-full rounded-2xl border-2 border-[var(--card-border)] px-4 text-base font-normal outline-none focus:border-[var(--accent)]"
                />
              </label>
              <label className="block text-sm font-semibold text-[var(--foreground-strong)]">
                Описание (необязательно)
                <textarea
                  name="description"
                  rows={3}
                  placeholder="Занятия по алгебре"
                  className="mt-2 w-full rounded-2xl border-2 border-[var(--card-border)] px-4 py-3 text-base font-normal outline-none focus:border-[var(--accent)]"
                />
              </label>
              <button className="touch-target rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white hover:bg-[var(--accent-hover)]">
                Создать комнату
              </button>
            </form>
          </div>

          <div className="space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <span className="rounded-full bg-[var(--accent-soft)] px-4 py-1.5 text-sm font-semibold text-[var(--accent)]">
                  Комнаты
                </span>
                <h2 className="mt-4 font-display text-3xl text-[var(--foreground-strong)]">
                  Мои учебные комнаты
                </h2>
              </div>
              <RoomStudentsDrawer students={students} />
            </div>

            {rooms.length === 0 ? (
              <div className="rounded-[2rem] border border-dashed border-[var(--card-border)] bg-white p-8 text-sm text-[var(--muted)]">
                Пока нет комнат. Создайте первую слева.
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {rooms.map((room) => (
                  <Link
                    key={room.id}
                    href={`/dashboard/rooms/${room.id}`}
                    className="rounded-[1.5rem] border border-[var(--card-border)] bg-white p-5 shadow-[var(--shadow-card)] transition-colors hover:border-[var(--accent)]/40"
                  >
                    <h3 className="font-display text-xl text-[var(--foreground-strong)]">
                      {room.title}
                    </h3>
                    {room.description ? (
                      <p className="mt-2 text-sm text-[var(--muted)]">{room.description}</p>
                    ) : null}
                    <div className="mt-4 flex gap-4 text-xs font-semibold text-[var(--muted)]">
                      <span>{room.members.length} учеников</span>
                      <span>{room.assignments.length} заданий</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    );
  }

  const memberships = await prisma.roomMember.findMany({
    where: { userId: session.user.id, role: "STUDENT" },
    include: {
      room: {
        include: {
          owner: { select: { name: true } },
          assignments: { where: { status: "PUBLISHED" } },
        },
      },
    },
    orderBy: { joinedAt: "desc" },
  });

  return (
    <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <span className="rounded-full bg-[var(--accent-soft)] px-4 py-1.5 text-sm font-semibold text-[var(--accent)]">
        Комнаты
      </span>
      <h1 className="mt-4 font-display text-3xl text-[var(--foreground-strong)]">Мои комнаты</h1>
      <p className="mt-2 text-[var(--muted)]">
        Комнаты, в которые вас пригласил учитель.
      </p>

      {memberships.length === 0 ? (
        <div className="mt-8 rounded-[2rem] border border-dashed border-[var(--card-border)] bg-white p-8 text-sm text-[var(--muted)]">
          Вы ещё не вступили ни в одну комнату. Попросите учителя отправить ссылку-приглашение.
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {memberships.map(({ room }) => (
            <Link
              key={room.id}
              href={`/dashboard/rooms/${room.id}`}
              className="rounded-[1.5rem] border border-[var(--card-border)] bg-white p-5 shadow-[var(--shadow-card)] transition-colors hover:border-[var(--accent)]/40"
            >
              <h2 className="font-display text-xl text-[var(--foreground-strong)]">{room.title}</h2>
              <p className="mt-2 text-sm text-[var(--muted)]">Учитель: {room.owner.name}</p>
              <p className="mt-4 text-xs font-semibold text-[var(--muted)]">
                {room.assignments.length} активных заданий
              </p>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
