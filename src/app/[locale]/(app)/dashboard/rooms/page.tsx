import { Link } from "@/i18n/navigation";
import { setRequestLocale } from "next-intl/server";
import { TeacherRoomsPanel } from "@/components/rooms/TeacherRoomsPanel";
import { getTeacherStudents } from "@/lib/rooms";
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

    const roomSummaries = rooms.map((room) => ({
      id: room.id,
      title: room.title,
      description: room.description,
      studentCount: room.members.length,
      assignmentCount: room.assignments.length,
    }));

    return (
      <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <TeacherRoomsPanel locale={locale} rooms={roomSummaries} students={students} />
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
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {memberships.map(({ room }) => (
            <Link
              key={room.id}
              href={`/dashboard/rooms/${room.id}`}
              className="rounded-[1.5rem] border border-[var(--card-border)] bg-white p-5 shadow-[var(--shadow-card)] transition-colors hover:border-[var(--accent)]/40 sm:p-6"
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
