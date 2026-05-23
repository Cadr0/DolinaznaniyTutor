import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import type { TaskAnswerType } from "@prisma/client";
import type { RoomTaskOverviewItem, StudentRoomOverview } from "@/lib/student-assignments";
import { answerTypeShortLabel } from "@/lib/task-labels";

type StudentAssignmentsOverviewProps = {
  rooms: StudentRoomOverview[];
};

type Translator = Awaited<ReturnType<typeof getTranslations>>;

function statusTone(task: RoomTaskOverviewItem) {
  const status = task.progress?.status;
  if (status === "CORRECT") {
    return "bg-emerald-50 text-emerald-700";
  }
  if (task.progress && task.progress.errorCount > 0) {
    return "bg-red-50 text-red-700";
  }
  switch (status) {
    case "SUBMITTED":
      return "bg-sky-50 text-sky-700";
    case "SKIPPED":
      return "bg-amber-50 text-amber-700";
    case "IN_PROGRESS":
      return "bg-[var(--accent-soft)] text-[var(--accent)]";
    default:
      return "bg-[var(--background-soft)] text-[var(--muted)]";
  }
}

function statusLabel(task: RoomTaskOverviewItem, t: Translator, tHomework: Translator) {
  if (!task.progress || task.progress.status === "NOT_STARTED") {
    return task.isHomework ? t("statusHomeworkPending") : t("statusAvailable");
  }

  if (task.progress.status === "CORRECT") {
    return tHomework("statusCorrect");
  }

  if (task.progress.errorCount > 0) {
    return tHomework("statusIncorrect");
  }

  switch (task.progress.status) {
    case "SKIPPED":
      return tHomework("statusSkipped");
    case "SUBMITTED":
      return tHomework("statusSubmitted");
    case "IN_PROGRESS":
      return tHomework("statusPending");
    default:
      return t("statusAvailable");
  }
}

function TaskRow({
  task,
  t,
  tHomework,
}: {
  task: RoomTaskOverviewItem;
  t: Translator;
  tHomework: Translator;
}) {
  const label = statusLabel(task, t, tHomework);
  const tone = statusTone(task);
  const href =
    task.isHomework && task.assignmentId
      ? `/dashboard/homework/${task.assignmentId}?task=${task.roomTaskId}`
      : null;

  const content = (
    <>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-[var(--foreground-strong)]">{task.title}</p>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <span className="text-xs text-[var(--muted)]">
            {answerTypeShortLabel[task.answerType as TaskAnswerType]}
          </span>
          {task.isHomework ? (
            <span className="rounded-full bg-[var(--accent-soft)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--accent)]">
              {t("homeworkBadge")}
            </span>
          ) : null}
        </div>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1">
        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${tone}`}>{label}</span>
        {task.progress && task.progress.errorCount > 0 ? (
          <span className="text-[10px] font-semibold text-red-600">
            {tHomework("statsErrors")}: {task.progress.errorCount}
          </span>
        ) : null}
      </div>
    </>
  );

  if (href) {
    return (
      <li>
        <Link
          href={href}
          className="flex items-center justify-between gap-3 rounded-xl border border-[var(--card-border)] bg-[var(--background)] px-3 py-2.5 transition-colors hover:border-[var(--accent)]/40"
        >
          {content}
        </Link>
      </li>
    );
  }

  return (
    <li className="flex items-center justify-between gap-3 rounded-xl border border-[var(--card-border)] bg-[var(--background)] px-3 py-2.5">
      {content}
    </li>
  );
}

export async function StudentAssignmentsOverview({ rooms }: StudentAssignmentsOverviewProps) {
  const t = await getTranslations("app.assignmentsPage");
  const tHomework = await getTranslations("app.homeworkPage");

  const totalTasks = rooms.reduce(
    (acc, room) => acc + room.topics.reduce((topicAcc, topic) => topicAcc + topic.tasks.length, 0),
    0,
  );

  if (rooms.length === 0) {
    return (
      <p className="mt-6 rounded-2xl border border-dashed border-[var(--card-border)] bg-[var(--background)] p-6 text-sm text-[var(--muted)]">
        {t("noRooms")}
      </p>
    );
  }

  if (totalTasks === 0) {
    return (
      <p className="mt-6 rounded-2xl border border-dashed border-[var(--card-border)] bg-[var(--background)] p-6 text-sm text-[var(--muted)]">
        {t("noTasks")}
      </p>
    );
  }

  return (
    <div className="mt-6 space-y-6">
      {rooms.map((room) => (
        <section
          key={room.id}
          className="rounded-[1.5rem] border border-[var(--card-border)] bg-[var(--background)] p-4 sm:p-5"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                {t("roomLabel")}
              </p>
              <h2 className="font-display text-xl text-[var(--foreground-strong)]">{room.title}</h2>
            </div>
            <Link
              href={`/dashboard/rooms/${room.id}`}
              className="text-sm font-semibold text-[var(--accent)] hover:underline"
            >
              {t("openRoom")} →
            </Link>
          </div>

          {room.topics.length === 0 ? (
            <p className="mt-4 text-sm text-[var(--muted)]">{t("noTopicsInRoom")}</p>
          ) : (
            <ul className="mt-4 space-y-4">
              {room.topics.map((topic) => (
                <li
                  key={topic.id}
                  className="rounded-[1.25rem] border border-[var(--card-border)] bg-white p-4"
                >
                  <div>
                    <h3 className="text-sm font-semibold text-[var(--foreground-strong)]">
                      {topic.title}
                    </h3>
                    {topic.description ? (
                      <p className="mt-1 text-xs text-[var(--muted)]">{topic.description}</p>
                    ) : null}
                  </div>

                  {topic.tasks.length === 0 ? (
                    <p className="mt-3 text-xs text-[var(--muted)]">{t("noTasksInTopic")}</p>
                  ) : (
                    <ul className="mt-3 space-y-2">
                      {topic.tasks.map((task) => (
                        <TaskRow key={task.roomTaskId} task={task} t={t} tHomework={tHomework} />
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}
    </div>
  );
}
