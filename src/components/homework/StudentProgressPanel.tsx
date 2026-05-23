"use client";

import { useEffect, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import {
  fetchStudentProgressAction,
  fetchTaskAttemptsAction,
  revokeStudentAssignmentAction,
} from "@/app/[locale]/(app)/dashboard/homework/actions";
import { AssignTopicModal } from "@/components/homework/AssignTopicModal";
import { RoomDialog } from "@/components/rooms/RoomDialog";
import { Button } from "@/components/ui/Button";
import type { StudentProgressOverview, TaskAttemptRecord } from "@/lib/student-assignments";

type StudentProgressPanelProps = {
  locale: string;
  roomId: string;
  student: {
    id: string;
    name: string;
    email: string;
  };
  open: boolean;
  onClose: () => void;
};

function statusLabel(status: string, t: ReturnType<typeof useTranslations>) {
  switch (status) {
    case "CORRECT":
      return t("statusCorrect");
    case "SKIPPED":
      return t("statusSkipped");
    case "SUBMITTED":
      return t("statusSubmitted");
    default:
      return t("statusPending");
  }
}

export function StudentProgressPanel({
  locale,
  roomId,
  student,
  open,
  onClose,
}: StudentProgressPanelProps) {
  const t = useTranslations("app.homeworkPage");
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [progress, setProgress] = useState<StudentProgressOverview | null>(null);
  const [assignOpen, setAssignOpen] = useState(false);
  const [revokeTargetId, setRevokeTargetId] = useState<string | null>(null);
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [attempts, setAttempts] = useState<TaskAttemptRecord[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) {
      return;
    }

    startTransition(async () => {
      try {
        const data = await fetchStudentProgressAction(locale, roomId, student.id);
        setProgress(data);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : t("genericError"));
      }
    });
  }, [open, locale, roomId, student.id, t]);

  function loadAttempts(roomTaskId: string) {
    if (expandedTaskId === roomTaskId) {
      setExpandedTaskId(null);
      setAttempts([]);
      return;
    }

    setExpandedTaskId(roomTaskId);
    startTransition(async () => {
      try {
        const data = await fetchTaskAttemptsAction(locale, roomId, student.id, roomTaskId);
        setAttempts(data);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : t("genericError"));
      }
    });
  }

  function handleRevoke(assignmentId: string) {
    startTransition(async () => {
      try {
        await revokeStudentAssignmentAction(locale, roomId, assignmentId);
        setRevokeTargetId(null);
        const data = await fetchStudentProgressAction(locale, roomId, student.id);
        setProgress(data);
        router.refresh();
      } catch (revokeError) {
        setError(revokeError instanceof Error ? revokeError.message : t("genericError"));
      }
    });
  }

  return (
    <>
      <RoomDialog
        open={open && !assignOpen}
        title={t("studentProgress")}
        onClose={onClose}
        maxWidthClass="max-w-lg"
        maxHeightClass="max-h-[92dvh]"
      >
        <div className="space-y-4">
          <div>
            <p className="text-sm font-semibold text-[var(--foreground-strong)]">{student.name}</p>
            <p className="text-xs text-[var(--muted)]">{student.email}</p>
          </div>

          {progress ? (
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-2xl bg-[var(--background)] p-3 text-center">
                <p className="text-lg font-bold text-[var(--foreground-strong)]">
                  {progress.totals.completedTasks}/{progress.totals.assignedTasks}
                </p>
                <p className="text-xs text-[var(--muted)]">{t("statsCompleted")}</p>
              </div>
              <div className="rounded-2xl bg-[var(--background)] p-3 text-center">
                <p className="text-lg font-bold text-[var(--foreground-strong)]">
                  {progress.totals.errorTasks}
                </p>
                <p className="text-xs text-[var(--muted)]">{t("statsErrors")}</p>
              </div>
              <div className="rounded-2xl bg-[var(--background)] p-3 text-center">
                <p className="text-lg font-bold text-[var(--foreground-strong)]">
                  {progress.totals.hintsUsed}
                </p>
                <p className="text-xs text-[var(--muted)]">{t("statsHints")}</p>
              </div>
            </div>
          ) : null}

          <Button type="button" className="w-full" onClick={() => setAssignOpen(true)}>
            {t("assignTitle")}
          </Button>

          {progress?.assignments.length === 0 ? (
            <p className="text-sm text-[var(--muted)]">{t("noAssignmentsYet")}</p>
          ) : null}

          {progress?.assignments.map((assignment) => (
            <div
              key={assignment.id}
              className="rounded-[1.25rem] border border-[var(--card-border)] bg-[var(--background)] p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-[var(--foreground-strong)]">
                    {assignment.topicTitle}
                  </p>
                  <p className="text-xs text-[var(--muted)]">
                    {t("progress", {
                      done: assignment.completedTasks,
                      total: assignment.totalTasks,
                    })}
                    {assignment.errorTasks > 0
                      ? ` · ${assignment.errorTasks} ${t("statsErrors").toLowerCase()}`
                      : null}
                  </p>
                </div>
                {revokeTargetId === assignment.id ? (
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <p className="text-xs text-[var(--muted)]">{t("revokeConfirm")}</p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setRevokeTargetId(null)}
                        disabled={pending}
                        className="text-xs font-semibold text-[var(--muted)] hover:underline"
                      >
                        {t("cancel")}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRevoke(assignment.id)}
                        disabled={pending}
                        className="text-xs font-semibold text-red-600 hover:underline"
                      >
                        {t("confirm")}
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setRevokeTargetId(assignment.id)}
                    disabled={pending}
                    className="text-xs font-semibold text-red-600 hover:underline"
                  >
                    {t("revoke")}
                  </button>
                )}
              </div>

              <ul className="mt-3 space-y-2">
                {assignment.tasks.map((task) => (
                  <li key={task.roomTaskId} className="rounded-xl border border-[var(--card-border)] bg-white p-3">
                    <button
                      type="button"
                      onClick={() => loadAttempts(task.roomTaskId)}
                      className="flex w-full items-center justify-between gap-2 text-left"
                    >
                      <span className="text-sm text-[var(--foreground-strong)]">{task.title}</span>
                      <span className="shrink-0 text-xs font-semibold text-[var(--muted)]">
                        {task.progress
                          ? statusLabel(task.progress.status, t)
                          : t("statusPending")}
                        {task.progress && task.progress.errorCount > 0
                          ? ` (${task.progress.errorCount})`
                          : null}
                      </span>
                    </button>

                    {expandedTaskId === task.roomTaskId ? (
                      <div className="mt-3 border-t border-[var(--card-border)] pt-3">
                        <p className="text-xs font-semibold uppercase text-[var(--muted)]">
                          {t("attempts")}
                        </p>
                        {attempts.length === 0 ? (
                          <p className="mt-2 text-xs text-[var(--muted)]">{t("noAttempts")}</p>
                        ) : (
                          <ul className="mt-2 space-y-2">
                            {attempts.map((attempt) => (
                              <li
                                key={attempt.id}
                                className="rounded-lg bg-[var(--background)] p-2 text-xs"
                              >
                                <p className="text-[var(--muted)]">
                                  {new Date(attempt.createdAt).toLocaleString("ru-RU")}
                                  {attempt.usedHint ? ` · ${t("hintUsed")}` : null}
                                </p>
                                {attempt.answerText ? (
                                  <p className="mt-1 text-[var(--foreground-strong)]">
                                    {attempt.answerText}
                                  </p>
                                ) : null}
                                {attempt.optionLabels.length > 0 ? (
                                  <p className="mt-1 text-[var(--foreground-strong)]">
                                    {attempt.optionLabels.join(", ")}
                                  </p>
                                ) : null}
                                {attempt.imageUrl ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    src={attempt.imageUrl}
                                    alt=""
                                    className="mt-2 max-h-32 rounded-lg object-contain"
                                  />
                                ) : null}
                                <p className="mt-1 font-semibold">
                                  {attempt.isCorrect === true
                                    ? t("statusCorrect")
                                    : attempt.isCorrect === false
                                      ? t("incorrect")
                                      : t("statusSubmitted")}
                                </p>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {error ? <p className="text-sm text-red-600">{error}</p> : null}
        </div>
      </RoomDialog>

      <AssignTopicModal
        locale={locale}
        roomId={roomId}
        studentId={student.id}
        studentName={student.name}
        open={assignOpen}
        onClose={() => {
          setAssignOpen(false);
          startTransition(async () => {
            const data = await fetchStudentProgressAction(locale, roomId, student.id);
            setProgress(data);
            router.refresh();
          });
        }}
      />
    </>
  );
}
