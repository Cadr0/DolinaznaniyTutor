import { notFound, redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { TaskPlayer } from "@/components/homework/TaskPlayer";
import { getAssignmentById, getNextTaskInAssignment } from "@/lib/student-assignments";
import { getRoomTaskForStudent } from "@/lib/room-tasks";
import { requireSession } from "@/lib/session";
import { localePath } from "@/lib/routes";

type Props = {
  params: Promise<{ locale: string; assignmentId: string }>;
  searchParams: Promise<{ task?: string }>;
};

export const dynamic = "force-dynamic";

export default async function HomeworkSessionPage({ params, searchParams }: Props) {
  const { locale, assignmentId } = await params;
  const { task: taskQuery } = await searchParams;
  setRequestLocale(locale);
  const session = await requireSession(locale);
  const t = await getTranslations("app.homeworkPage");

  if (session.user.role !== "STUDENT") {
    redirect(localePath(locale, "/dashboard"));
  }

  const studentId = session.user.id;
  const assignment = await getAssignmentById(assignmentId, studentId);

  if (!assignment) {
    notFound();
  }

  if (assignment.totalTasks === 0) {
    return (
      <section className="mx-auto max-w-xl px-4 py-8 text-center">
        <p className="text-sm text-[var(--muted)]">В этом назначении нет заданий.</p>
        <Link href="/dashboard/homework" className="mt-4 inline-block text-sm font-semibold text-[var(--accent)]">
          {t("backToHomework")}
        </Link>
      </section>
    );
  }

  const nextTask = await getNextTaskInAssignment(assignmentId, studentId);
  let taskId: string | undefined =
    taskQuery ?? nextTask?.roomTaskId ?? assignment.tasks[0]?.roomTaskId;

  if (taskQuery) {
    const queried = assignment.tasks.find((item) => item.roomTaskId === taskQuery);
    const done =
      queried?.progress &&
      ["CORRECT", "SKIPPED", "SUBMITTED"].includes(queried.progress.status);
    if (done && nextTask && nextTask.roomTaskId !== taskQuery) {
      redirect(localePath(locale, `/dashboard/homework/${assignmentId}?task=${nextTask.roomTaskId}`));
    }
    if (done && !nextTask) {
      taskId = undefined;
    }
  }

  if (!taskId) {
    return (
      <section className="mx-auto max-w-xl px-4 py-8 text-center">
        <p className="text-lg font-semibold text-[var(--foreground-strong)]">{t("completed")}</p>
        <Link href="/dashboard/homework" className="mt-4 inline-block text-sm font-semibold text-[var(--accent)]">
          {t("backToHomework")}
        </Link>
      </section>
    );
  }

  const task = await getRoomTaskForStudent(taskId, studentId);

  if (!task) {
    notFound();
  }

  const isAssigned = assignment.tasks.some((item) => item.roomTaskId === taskId);
  if (!isAssigned) {
    notFound();
  }

  return (
    <section className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
      <Link
        href="/dashboard/homework"
        className="text-sm font-semibold text-[var(--accent)] hover:underline"
      >
        {t("backToHomework")}
      </Link>
      <div className="mt-4">
        <TaskPlayer
          locale={locale}
          assignment={assignment}
          initialTaskId={taskId}
          task={task}
        />
      </div>
    </section>
  );
}
