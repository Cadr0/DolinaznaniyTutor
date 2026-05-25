import { notFound, redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { StudentCardView } from "@/components/homework/StudentCardView";
import { Link } from "@/i18n/navigation";
import {
  getStudentProgressForTutor,
  getStudentRoomsForTutor,
} from "@/lib/student-assignments";
import { localePath } from "@/lib/routes";
import { requireSession } from "@/lib/session";

type Props = {
  params: Promise<{ locale: string; studentId: string }>;
  searchParams: Promise<{ roomId?: string }>;
};

export const dynamic = "force-dynamic";

export default async function StudentDetailPage({ params, searchParams }: Props) {
  const { locale, studentId } = await params;
  const { roomId: roomIdParam } = await searchParams;
  setRequestLocale(locale);
  const session = await requireSession(locale);
  const t = await getTranslations("app.studentsPage");

  if (session.user.role !== "TUTOR") {
    redirect(localePath(locale, "/dashboard"));
  }

  const roomOptions = await getStudentRoomsForTutor(session.user.id, studentId);
  if (roomOptions.length === 0) {
    notFound();
  }

  const roomId =
    roomIdParam && roomOptions.some((room) => room.roomId === roomIdParam)
      ? roomIdParam
      : roomOptions[0].roomId;

  const progress = await getStudentProgressForTutor(session.user.id, roomId, studentId);
  if (!progress) {
    notFound();
  }

  return (
    <section className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
      <Link
        href="/dashboard/students"
        className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--accent)] hover:underline"
      >
        ← {t("backToList")}
      </Link>

      <StudentCardView
        locale={locale}
        studentId={studentId}
        studentName={progress.studentName}
        studentEmail={progress.studentEmail}
        roomId={roomId}
        roomOptions={roomOptions}
      />
    </section>
  );
}
