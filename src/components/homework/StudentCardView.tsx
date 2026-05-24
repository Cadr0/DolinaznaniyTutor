"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import {
  fetchStudentProgressAction,
  fetchTaskAttemptContextAction,
  fetchTaskAttemptsAction,
  revokeStudentAssignmentAction,
} from "@/app/[locale]/(app)/dashboard/homework/actions";
import { AssignTopicModal } from "@/components/homework/AssignTopicModal";
import { Button } from "@/components/ui/Button";
import type {
  StudentProgressOverview,
  TaskAttemptContext,
  TaskAttemptRecord,
} from "@/lib/student-assignments";

type StudentCardViewProps = {
  locale: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  roomId: string;
  roomOptions?: { roomId: string; roomTitle: string }[];
  compact?: boolean;
  showFullPageLink?: boolean;
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

function answerTypeLabel(type: string) {
  switch (type) {
    case "IMAGE":
      return "Фото";
    case "CHOICE":
      return "Выбор";
    default:
      return "Текст";
  }
}

export function StudentCardView({
  locale,
  studentId,
  studentName,
  studentEmail,
  roomId,
  roomOptions = [],
  compact = false,
  showFullPageLink = false,
}: StudentCardViewProps) {
  const t = useTranslations("app.homeworkPage");
  const tStudents = useTranslations("app.studentsPage");
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [activeRoomId, setActiveRoomId] = useState(roomId);
  const [progress, setProgress] = useState<StudentProgressOverview | null>(null);
  const [assignOpen, setAssignOpen] = useState(false);
  const [revokeTargetId, setRevokeTargetId] = useState<string | null>(null);
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [attempts, setAttempts] = useState<TaskAttemptRecord[]>([]);
  const [taskContext, setTaskContext] = useState<TaskAttemptContext | null>(null);
  const [error, setError] = useState("");

  const loadProgress = useCallback(() => {
    startTransition(async () => {
      try {
        const data = await fetchStudentProgressAction(locale, activeRoomId, studentId);
        setProgress(data);
        setError("");
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : t("genericError"));
      }
    });
  }, [activeRoomId, locale, studentId, t]);

  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  function loadAttempts(roomTaskId: string) {
    if (expandedTaskId === roomTaskId) {
      setExpandedTaskId(null);
      setAttempts([]);
      setTaskContext(null);
      return;
    }

    setExpandedTaskId(roomTaskId);
    startTransition(async () => {
      try {
        const [attemptData, context] = await Promise.all([
          fetchTaskAttemptsAction(locale, activeRoomId, studentId, roomTaskId),
          fetchTaskAttemptContextAction(locale, activeRoomId, roomTaskId),
        ]);
        setAttempts(attemptData);
        setTaskContext(context);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : t("genericError"));
      }
    });
  }

  function handleRevoke(assignmentId: string) {
    startTransition(async () => {
      try {
        await revokeStudentAssignmentAction(locale, activeRoomId, assignmentId);
        setRevokeTargetId(null);
        loadProgress();
        router.refresh();
      } catch (revokeError) {
        setError(revokeError instanceof Error ? revokeError.message : t("genericError"));
      }
    });
  }

  const displayName = progress?.studentName ?? studentName;
  const displayEmail = progress?.studentEmail ?? studentEmail;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-lg font-semibold text-[var(--foreground-strong)]">{displayName}</p>
          <p className="text-sm text-[var(--muted)]">{displayEmail}</p>
        </div>
        {showFullPageLink ? (
          <Link
            href={`/dashboard/students/${studentId}?roomId=${activeRoomId}`}
            className="text-sm font-semibold text-[var(--accent)] hover:underline"
          >
            {tStudents("openFullCard")} →
          </Link>
        ) : null}
      </div>

      {roomOptions.length > 1 ? (
        <div className="flex flex-wrap gap-2">
          {roomOptions.map((room) => (
            <button
              key={room.roomId}
              type="button"
              onClick={() => {
                setActiveRoomId(room.roomId);
                setExpandedTaskId(null);
                setAttempts([]);
              }}
              className={`touch-target rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                activeRoomId === room.roomId
                  ? "bg-[var(--accent)] text-white"
                  : "border border-[var(--card-border)] bg-white text-[var(--foreground-strong)] hover:border-[var(--accent)]/40"
              }`}
            >
              {room.roomTitle}
            </button>
          ))}
        </div>
      ) : null}

      {progress ? (
        <div className={`grid gap-2 ${compact ? "grid-cols-3" : "grid-cols-2 sm:grid-cols-4"}`}>
          <StatCard
            value={`${progress.totals.completedTasks}/${progress.totals.assignedTasks}`}
            label={t("statsCompleted")}
          />
          <StatCard value={String(progress.totals.errorTasks)} label={t("statsErrors")} />
          <StatCard value={String(progress.totals.hintsUsed)} label={t("statsHints")} />
          {!compact ? (
            <StatCard
              value={String(progress.assignments.length)}
              label={tStudents("topicsAssigned")}
            />
          ) : null}
        </div>
      ) : null}

      <Button type="button" className="w-full sm:w-auto" onClick={() => setAssignOpen(true)}>
        {t("assignTitle")}
      </Button>

      {progress?.assignments.length === 0 ? (
        <p className="rounded-2xl bg-[var(--background)] p-4 text-sm text-[var(--muted)]">
          {t("noAssignmentsYet")}
        </p>
      ) : null}

      {progress?.assignments.map((assignment) => (
        <div
          key={assignment.id}
          className="rounded-[1.25rem] border border-[var(--card-border)] bg-[var(--background)] p-4"
        >
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-[var(--foreground-strong)]">
                {assignment.topicTitle}
              </p>
              <p className="mt-1 text-xs text-[var(--muted)]">
                {t("progress", {
                  done: assignment.completedTasks,
                  total: assignment.totalTasks,
                })}
                {assignment.errorTasks > 0
                  ? ` · ${assignment.errorTasks} ${t("statsErrors").toLowerCase()}`
                  : null}
              </p>
              <p className="mt-1 text-xs text-[var(--muted)]">
                {tStudents("assignedAt")}:{" "}
                {new Date(assignment.assignedAt).toLocaleDateString("ru-RU", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
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
              <li
                key={task.roomTaskId}
                className="rounded-xl border border-[var(--card-border)] bg-white p-3"
              >
                <button
                  type="button"
                  onClick={() => loadAttempts(task.roomTaskId)}
                  className="flex w-full items-center justify-between gap-2 text-left"
                >
                  <div className="min-w-0">
                    <span className="block text-sm text-[var(--foreground-strong)]">
                      {task.title}
                    </span>
                    <span className="mt-0.5 inline-block rounded-full bg-[var(--background)] px-2 py-0.5 text-[10px] font-semibold uppercase text-[var(--muted)]">
                      {answerTypeLabel(task.answerType)}
                    </span>
                  </div>
                  <span className="shrink-0 text-right text-xs font-semibold text-[var(--muted)]">
                    {task.progress ? statusLabel(task.progress.status, t) : t("statusPending")}
                    {task.progress && task.progress.errorCount > 0
                      ? ` (${task.progress.errorCount})`
                      : null}
                    <span className="mt-0.5 block text-[10px] font-normal normal-case">
                      {expandedTaskId === task.roomTaskId ? "▲" : "▼"} {t("attempts")}
                    </span>
                  </span>
                </button>

                {expandedTaskId === task.roomTaskId ? (
                  <div className="mt-3 border-t border-[var(--card-border)] pt-3">
                    {taskContext?.correctAnswer ? (
                      <p className="mb-2 text-xs text-[var(--muted)]">
                        {tStudents("correctAnswer")}:{" "}
                        <span className="font-semibold text-[var(--foreground-strong)]">
                          {taskContext.correctAnswer}
                        </span>
                      </p>
                    ) : null}
                    {attempts.length === 0 ? (
                      <p className="text-xs text-[var(--muted)]">{t("noAttempts")}</p>
                    ) : (
                      <ul className="space-y-2">
                        {attempts.map((attempt, index) => (
                          <li
                            key={attempt.id}
                            className="rounded-lg bg-[var(--background)] p-3 text-xs"
                          >
                            <p className="font-semibold text-[var(--foreground-strong)]">
                              {tStudents("attemptNumber", { n: index + 1 })}
                            </p>
                            <p className="mt-1 text-[var(--muted)]">
                              {new Date(attempt.createdAt).toLocaleString("ru-RU")}
                              {attempt.usedHint ? ` · ${t("hintUsed")}` : null}
                            </p>
                            {attempt.answerText ? (
                              <p className="mt-2 rounded-lg bg-white p-2 text-[var(--foreground-strong)]">
                                {attempt.answerText}
                              </p>
                            ) : null}
                            {attempt.optionLabels.length > 0 ? (
                              <p className="mt-2 rounded-lg bg-white p-2 text-[var(--foreground-strong)]">
                                {attempt.optionLabels.join(", ")}
                              </p>
                            ) : null}
                            {attempt.imageUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={attempt.imageUrl}
                                alt=""
                                className="mt-2 max-h-48 w-full rounded-lg object-contain"
                              />
                            ) : null}
                            <p
                              className={`mt-2 font-semibold ${
                                attempt.isCorrect === true
                                  ? "text-green-700"
                                  : attempt.isCorrect === false
                                    ? "text-red-600"
                                    : "text-[var(--accent)]"
                              }`}
                            >
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

      <AssignTopicModal
        locale={locale}
        roomId={activeRoomId}
        studentId={studentId}
        studentName={displayName}
        open={assignOpen}
        onClose={() => {
          setAssignOpen(false);
          loadProgress();
          router.refresh();
        }}
      />
    </div>
  );
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl bg-[var(--background)] p-3 text-center">
      <p className="text-lg font-bold text-[var(--foreground-strong)]">{value}</p>
      <p className="text-xs text-[var(--muted)]">{label}</p>
    </div>
  );
}
