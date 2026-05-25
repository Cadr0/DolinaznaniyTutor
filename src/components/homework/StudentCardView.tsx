"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import {
  fetchStudentAnswerHistoryAction,
  fetchStudentProgressAction,
  fetchTaskAttemptContextAction,
  fetchTaskAttemptsAction,
  revokeStudentAssignmentAction,
} from "@/app/[locale]/(app)/dashboard/homework/actions";
import { TaskPreviewDrawer, type TaskPreviewAttempt } from "@/components/homework/TaskPreviewDrawer";
import { AssignHomeworkPanel } from "@/components/homework/AssignHomeworkPanel";
import type {
  StudentAnswerHistoryItem,
  StudentProgressOverview,
  StudentRoomTopicSummary,
  StudentTopicAssignmentSummary,
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

type TabId = "homework" | "topics" | "history";

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

function historyResultLabel(result: StudentAnswerHistoryItem["result"], t: ReturnType<typeof useTranslations>) {
  switch (result) {
    case "CORRECT":
      return t("statusCorrect");
    case "INCORRECT":
      return t("statusIncorrect");
    case "SKIPPED":
      return t("statusSkipped");
    default:
      return t("statusSubmitted");
  }
}

function formatDuration(seconds: number | null) {
  if (seconds === null) {
    return "—";
  }
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

function formatHistoryDate(iso: string, compact = false) {
  const date = new Date(iso);
  if (compact) {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${day}.${month} ${hours}:${minutes}`;
  }

  return date.toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function shortTopicTitle(title: string, maxLen = 22) {
  if (title.length <= maxLen) {
    return title;
  }
  return `${title.slice(0, maxLen - 1)}…`;
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
  const [activeTab, setActiveTab] = useState<TabId>("homework");
  const [progress, setProgress] = useState<StudentProgressOverview | null>(null);
  const [history, setHistory] = useState<StudentAnswerHistoryItem[]>([]);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [revokeTargetId, setRevokeTargetId] = useState<string | null>(null);
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [attempts, setAttempts] = useState<TaskAttemptRecord[]>([]);
  const [taskContext, setTaskContext] = useState<TaskAttemptContext | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewTask, setPreviewTask] = useState<TaskAttemptContext | null>(null);
  const [previewAttempt, setPreviewAttempt] = useState<TaskPreviewAttempt | null>(null);
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

  const loadHistory = useCallback(() => {
    startTransition(async () => {
      try {
        const data = await fetchStudentAnswerHistoryAction(locale, activeRoomId, studentId);
        setHistory(data);
        setHistoryLoaded(true);
        setError("");
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : t("genericError"));
      }
    });
  }, [activeRoomId, locale, studentId, t]);

  useEffect(() => {
    loadProgress();
    setHistoryLoaded(false);
    setHistory([]);
    setExpandedTaskId(null);
    setAttempts([]);
  }, [loadProgress]);

  useEffect(() => {
    if (activeTab === "history" && !historyLoaded) {
      loadHistory();
    }
  }, [activeTab, historyLoaded, loadHistory]);

  function toPreviewAttempt(
    attempt: StudentAnswerHistoryItem | TaskPreviewAttempt,
  ): TaskPreviewAttempt {
    return {
      answerDisplay: attempt.answerDisplay,
      answerText: attempt.answerText,
      optionLabels: attempt.optionLabels,
      imageUrl: attempt.imageUrl,
      result: attempt.result,
      attemptNumber: attempt.attemptNumber,
      usedHint: attempt.usedHint,
      createdAt: attempt.createdAt,
    };
  }

  function openTaskPreview(
    roomTaskId: string,
    attempt?: StudentAnswerHistoryItem | TaskPreviewAttempt | null,
  ) {
    setPreviewOpen(true);
    setPreviewLoading(true);
    setPreviewTask(null);
    setPreviewAttempt(attempt ? toPreviewAttempt(attempt) : null);

    startTransition(async () => {
      try {
        const task = await fetchTaskAttemptContextAction(locale, activeRoomId, roomTaskId);
        setPreviewTask(task);
        setError("");
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : t("genericError"));
      } finally {
        setPreviewLoading(false);
      }
    });
  }

  function closeTaskPreview() {
    setPreviewOpen(false);
    setPreviewTask(null);
    setPreviewAttempt(null);
    setPreviewLoading(false);
  }

  function handleAssigned() {
    loadProgress();
    if (historyLoaded) {
      loadHistory();
    }
    router.refresh();
  }

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
        if (historyLoaded) {
          loadHistory();
        }
        router.refresh();
      } catch (revokeError) {
        setError(revokeError instanceof Error ? revokeError.message : t("genericError"));
      }
    });
  }

  const displayName = progress?.studentName ?? studentName;
  const displayEmail = progress?.studentEmail ?? studentEmail;
  const userHandle = progress?.userHandle ?? `@${displayEmail.split("@")[0] ?? "user"}`;
  const stats = progress?.extendedStats;

  const tabs: { id: TabId; label: string }[] = [
    { id: "homework", label: tStudents("tabHomework") },
    { id: "topics", label: tStudents("tabTopics") },
    { id: "history", label: tStudents("tabHistory") },
  ];

  return (
    <div className={compact ? "space-y-4" : "mt-4 space-y-5"}>
      {!compact ? (
        <StudentHero
          name={displayName}
          handle={userHandle}
          email={displayEmail}
          accuracy={stats?.accuracyPercent ?? 0}
          totalAnswers={stats?.totalAttempts ?? 0}
          accuracyLabel={tStudents("accuracy")}
          totalAnswersLabel={tStudents("totalAnswers")}
        />
      ) : (
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-lg font-semibold text-[var(--foreground-strong)]">{displayName}</p>
            <p className="text-sm text-[var(--muted)]">{userHandle}</p>
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
      )}

      {stats ? (
        <div className={`grid gap-3 ${compact ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-2 sm:grid-cols-5"}`}>
          <StatCard
            icon="topics"
            value={String(stats.topicsCompleted)}
            label={tStudents("statTopicsCompleted")}
          />
          <StatCard
            icon="attempts"
            value={String(stats.totalAttempts)}
            label={tStudents("statTotalAttempts")}
          />
          <StatCard
            icon="correct"
            value={String(stats.correctAnswers)}
            label={tStudents("statCorrect")}
            accent="success"
          />
          {!compact ? (
            <StatCard
              icon="incorrect"
              value={String(stats.incorrectAnswers)}
              label={tStudents("statIncorrect")}
              accent="danger"
            />
          ) : null}
          <StatCard
            icon="hints"
            value={String(stats.hintsUsed)}
            label={tStudents("statHints")}
          />
        </div>
      ) : null}

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
                setHistoryLoaded(false);
                setHistory([]);
              }}
              className={`touch-target rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                activeRoomId === room.roomId
                  ? "bg-[var(--accent)] text-white shadow-[var(--shadow-soft)]"
                  : "border border-[var(--card-border)] bg-white text-[var(--foreground-strong)] hover:border-[var(--accent)]/40"
              }`}
            >
              {room.roomTitle}
            </button>
          ))}
        </div>
      ) : null}

      <div className={`overflow-hidden rounded-[1.5rem] border border-[var(--card-border)] bg-white shadow-[var(--shadow-card)] ${compact ? "rounded-[1.25rem]" : ""}`}>
        <div className={`flex flex-wrap items-center justify-between gap-3 border-b border-[var(--card-border)] ${compact ? "px-3 pt-2 sm:px-6 sm:pt-3" : "px-4 pt-3 sm:px-6"}`}>
          <div className="flex gap-0.5 overflow-x-auto scrollbar-hide sm:gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`shrink-0 border-b-2 px-3 py-2.5 text-xs font-semibold transition-colors sm:px-4 sm:py-3 sm:text-sm ${
                  activeTab === tab.id
                    ? "border-[var(--accent)] text-[var(--accent)]"
                    : "border-transparent text-[var(--muted)] hover:text-[var(--foreground-strong)]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className={compact ? "p-3 sm:p-6" : "p-4 sm:p-6"}>
          {activeTab === "homework" ? (
            <HomeworkTab
              locale={locale}
              roomId={activeRoomId}
              studentId={studentId}
              assignments={progress?.assignments ?? []}
              pending={pending}
              revokeTargetId={revokeTargetId}
              expandedTaskId={expandedTaskId}
              attempts={attempts}
              taskContext={taskContext}
              onRevokeTarget={setRevokeTargetId}
              onRevoke={handleRevoke}
              onLoadAttempts={loadAttempts}
              onOpenTaskPreview={openTaskPreview}
              onAssigned={handleAssigned}
              t={t}
              tStudents={tStudents}
            />
          ) : null}

          {activeTab === "topics" ? (
            <TopicsTab
              roomTopics={progress?.roomTopics ?? []}
              t={t}
              tStudents={tStudents}
            />
          ) : null}

          {activeTab === "history" ? (
            <HistoryTab
              history={history}
              pending={pending}
              loaded={historyLoaded}
              compact={compact}
              onSelectItem={(item) => openTaskPreview(item.roomTaskId, item)}
              t={t}
              tStudents={tStudents}
            />
          ) : null}
        </div>
      </div>

      {error ? (
        <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <TaskPreviewDrawer
        open={previewOpen}
        loading={previewLoading}
        task={previewTask}
        attempt={previewAttempt}
        onClose={closeTaskPreview}
      />
    </div>
  );
}

function StudentHero({
  name,
  handle,
  email,
  accuracy,
  totalAnswers,
  accuracyLabel,
  totalAnswersLabel,
}: {
  name: string;
  handle: string;
  email: string;
  accuracy: number;
  totalAnswers: number;
  accuracyLabel: string;
  totalAnswersLabel: string;
}) {
  return (
    <div className="overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-[var(--accent)] via-[#349786] to-[#2a6f64] p-6 text-white shadow-[var(--shadow-soft)] sm:p-8">
      <div className="flex flex-col items-center text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 ring-4 ring-white/30">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden>
            <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.8" />
            <path
              d="M5 20c0-3.3 2.7-6 7-6s7 2.7 7 6"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <h1 className="mt-4 font-display text-2xl font-bold sm:text-3xl">{name}</h1>
        <p className="mt-1 text-sm text-white/80">{handle}</p>
        <p className="mt-0.5 text-xs text-white/60">{email}</p>
        <div className="mt-5 flex flex-wrap justify-center gap-8 sm:gap-12">
          <div>
            <p className="text-3xl font-bold">{accuracy.toFixed(1)}%</p>
            <p className="mt-1 text-sm text-white/80">{accuracyLabel}</p>
          </div>
          <div>
            <p className="text-3xl font-bold">{totalAnswers}</p>
            <p className="mt-1 text-sm text-white/80">{totalAnswersLabel}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  value,
  label,
  accent,
}: {
  icon: "topics" | "attempts" | "correct" | "incorrect" | "hints";
  value: string;
  label: string;
  accent?: "success" | "danger";
}) {
  const iconColor =
    accent === "success"
      ? "text-emerald-600 bg-emerald-50"
      : accent === "danger"
        ? "text-red-600 bg-red-50"
        : "text-[var(--accent)] bg-[var(--accent-soft)]";

  return (
    <div className="rounded-2xl border border-[var(--card-border)] bg-white p-4 text-center shadow-[var(--shadow-card)]">
      <div
        className={`mx-auto flex h-10 w-10 items-center justify-center rounded-xl ${iconColor}`}
      >
        <StatIcon icon={icon} />
      </div>
      <p className="mt-3 text-2xl font-bold text-[var(--foreground-strong)]">{value}</p>
      <p className="mt-1 text-xs font-medium text-[var(--muted)]">{label}</p>
    </div>
  );
}

function StatIcon({ icon }: { icon: "topics" | "attempts" | "correct" | "incorrect" | "hints" }) {
  switch (icon) {
    case "topics":
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M7 5h9a2 2 0 0 1 2 2v12l-3.5-2L12 19l-2.5-2L6 19V7a2 2 0 0 1 2-2Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "attempts":
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
          <rect x="5" y="4" width="14" height="16" rx="2" stroke="currentColor" strokeWidth="1.8" />
          <path d="M9 9h6M9 13h6M9 17h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case "correct":
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
          <path d="M8 12.5 10.5 15 16 9.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case "incorrect":
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
          <path d="M9 9l6 6M15 9l-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    default:
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M12 3a6 6 0 0 0-4 10v4h8v-4a6 6 0 0 0-4-10Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path d="M10 21h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
  }
}

function HomeworkTab({
  locale,
  roomId,
  studentId,
  assignments,
  pending,
  revokeTargetId,
  expandedTaskId,
  attempts,
  taskContext,
  onRevokeTarget,
  onRevoke,
  onLoadAttempts,
  onOpenTaskPreview,
  onAssigned,
  t,
  tStudents,
}: {
  locale: string;
  roomId: string;
  studentId: string;
  assignments: StudentTopicAssignmentSummary[];
  pending: boolean;
  revokeTargetId: string | null;
  expandedTaskId: string | null;
  attempts: TaskAttemptRecord[];
  taskContext: TaskAttemptContext | null;
  onRevokeTarget: (id: string | null) => void;
  onRevoke: (id: string) => void;
  onLoadAttempts: (roomTaskId: string) => void;
  onOpenTaskPreview: (roomTaskId: string) => void;
  onAssigned: () => void;
  t: ReturnType<typeof useTranslations>;
  tStudents: ReturnType<typeof useTranslations>;
}) {
  return (
    <div className="space-y-6">
      <AssignHomeworkPanel
        locale={locale}
        roomId={roomId}
        studentId={studentId}
        assignments={assignments}
        onAssigned={onAssigned}
        onOpenTaskPreview={onOpenTaskPreview}
      />

      {assignments.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-[var(--card-border)] bg-[var(--background)] p-6 text-center text-sm text-[var(--muted)]">
          {t("noAssignmentsYet")}
        </p>
      ) : (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-[var(--foreground-strong)]">
            {tStudents("currentAssignments")}
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {assignments.map((assignment) => (
              <article
                key={assignment.id}
                className="flex flex-col overflow-hidden rounded-[2rem] border border-[var(--card-border)] bg-white shadow-[var(--shadow-card)]"
              >
                <div className="border-b border-[var(--card-border)] p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-display text-lg text-[var(--foreground-strong)]">
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
                    <ProgressBar done={assignment.completedTasks} total={assignment.totalTasks} />
                  </div>
                  <div className="mt-3">
                    {revokeTargetId === assignment.id ? (
                      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-red-50 px-3 py-2">
                        <p className="text-xs text-[var(--muted)]">{t("revokeConfirm")}</p>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => onRevokeTarget(null)}
                            disabled={pending}
                            className="text-xs font-semibold text-[var(--muted)] hover:underline"
                          >
                            {t("cancel")}
                          </button>
                          <button
                            type="button"
                            onClick={() => onRevoke(assignment.id)}
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
                        onClick={() => onRevokeTarget(assignment.id)}
                        disabled={pending}
                        className="rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100"
                      >
                        {t("revoke")}
                      </button>
                    )}
                  </div>
                </div>

                <ul className="grid flex-1 gap-2 p-4">
                  {assignment.tasks.map((task) => (
                    <li
                      key={task.roomTaskId}
                      className="overflow-hidden rounded-xl border border-[var(--card-border)] bg-[var(--background)]"
                    >
                      <div className="flex items-start gap-2 p-3">
                        <button
                          type="button"
                          onClick={() => onOpenTaskPreview(task.roomTaskId)}
                          className="min-w-0 flex-1 text-left hover:opacity-80"
                        >
                          <span className="block text-sm font-medium text-[var(--foreground-strong)]">
                            {task.title}
                          </span>
                          <span className="mt-1 inline-block rounded-full bg-[var(--accent-soft)] px-2 py-0.5 text-[10px] font-semibold uppercase text-[var(--accent)]">
                            {answerTypeLabel(task.answerType)}
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onLoadAttempts(task.roomTaskId)}
                          className="shrink-0"
                        >
                          <TaskStatusBadge
                            status={task.progress?.status ?? "IN_PROGRESS"}
                            errorCount={task.progress?.errorCount ?? 0}
                            t={t}
                            expanded={expandedTaskId === task.roomTaskId}
                          />
                        </button>
                      </div>

                      {expandedTaskId === task.roomTaskId ? (
                        <div className="border-t border-[var(--card-border)] bg-white px-3 py-3">
                          {taskContext?.correctAnswer ? (
                            <p className="mb-3 text-xs text-[var(--muted)]">
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
                                  className="rounded-xl border border-[var(--card-border)] bg-[var(--background)] p-3 text-xs"
                                >
                                  <div className="flex flex-wrap items-center justify-between gap-2">
                                    <p className="font-semibold text-[var(--foreground-strong)]">
                                      {tStudents("attemptNumber", { n: index + 1 })}
                                    </p>
                                    <ResultBadge
                                      result={
                                        attempt.isCorrect === true
                                          ? "CORRECT"
                                          : attempt.isCorrect === false
                                            ? "INCORRECT"
                                            : "SUBMITTED"
                                      }
                                      t={t}
                                    />
                                  </div>
                                  <p className="mt-1 text-[var(--muted)]">
                                    {new Date(attempt.createdAt).toLocaleString("ru-RU")}
                                    {attempt.usedHint ? ` · ${t("hintUsed")}` : ""}
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
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function TopicsTab({
  roomTopics,
  t,
  tStudents,
}: {
  roomTopics: StudentRoomTopicSummary[];
  t: ReturnType<typeof useTranslations>;
  tStudents: ReturnType<typeof useTranslations>;
}) {
  if (roomTopics.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-[var(--card-border)] bg-[var(--background)] p-6 text-center text-sm text-[var(--muted)]">
        {t("noTopicsInRoom")}
      </p>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {roomTopics.map((topic) => {
        const percent =
          topic.totalTasks > 0
            ? Math.round((topic.completedTasks / topic.totalTasks) * 100)
            : 0;
        const hasProgress = topic.startedTasks > 0;

        return (
          <article
            key={topic.roomTopicId}
            className="flex flex-col rounded-[2rem] border border-[var(--card-border)] bg-white p-4 shadow-[var(--shadow-card)]"
          >
            <div className="aspect-[16/10] overflow-hidden rounded-2xl bg-gradient-to-br from-[var(--accent-soft)] via-white to-[var(--background)]">
              <div className="flex h-full flex-col justify-end p-3">
                <div className="flex flex-wrap gap-1.5">
                  {topic.isAssigned ? (
                    <span className="rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-semibold uppercase text-[var(--accent)] shadow-sm">
                      {tStudents("homeworkBadge")}
                    </span>
                  ) : null}
                  {!hasProgress ? (
                    <span className="rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-semibold text-gray-600 shadow-sm">
                      {tStudents("topicNotStarted")}
                    </span>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-start justify-between gap-2">
              <p className="font-display text-lg text-[var(--foreground-strong)]">{topic.title}</p>
            </div>

            <p className="mt-1 text-xs text-[var(--muted)]">
              {tStudents("tasksInTopic", { count: topic.totalTasks })}
            </p>

            <div className="mt-3">
              <div className="flex items-center justify-between text-xs text-[var(--muted)]">
                <span>
                  {hasProgress
                    ? t("progress", {
                        done: topic.completedTasks,
                        total: topic.totalTasks,
                      })
                    : tStudents("noProgressYet")}
                </span>
                <span>{percent}%</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-white">
                <div
                  className={`h-full rounded-full transition-all ${
                    hasProgress ? "bg-[var(--accent)]" : "bg-[var(--card-border)]"
                  }`}
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>

            {hasProgress ? (
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                {topic.errorTasks > 0 ? (
                  <span className="rounded-full bg-red-50 px-2.5 py-1 font-semibold text-red-600">
                    {topic.errorTasks} {t("statsErrors").toLowerCase()}
                  </span>
                ) : null}
                {topic.hintsUsed > 0 ? (
                  <span className="rounded-full bg-amber-50 px-2.5 py-1 font-semibold text-amber-700">
                    {topic.hintsUsed} {t("statsHints").toLowerCase()}
                  </span>
                ) : null}
                {topic.completedTasks === topic.totalTasks && topic.totalTasks > 0 ? (
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 font-semibold text-emerald-700">
                    {tStudents("topicDone")}
                  </span>
                ) : null}
                {topic.startedTasks > 0 &&
                topic.completedTasks < topic.totalTasks ? (
                  <span className="rounded-full bg-blue-50 px-2.5 py-1 font-semibold text-blue-700">
                    {tStudents("inProgress", { count: topic.startedTasks })}
                  </span>
                ) : null}
              </div>
            ) : null}
          </article>
        );
      })}
    </div>
  );
}

function HistoryTab({
  history,
  pending,
  loaded,
  compact = false,
  onSelectItem,
  t,
  tStudents,
}: {
  history: StudentAnswerHistoryItem[];
  pending: boolean;
  loaded: boolean;
  compact?: boolean;
  onSelectItem: (item: StudentAnswerHistoryItem) => void;
  t: ReturnType<typeof useTranslations>;
  tStudents: ReturnType<typeof useTranslations>;
}) {
  if (!loaded && pending) {
    return <p className="text-sm text-[var(--muted)]">{tStudents("loadingHistory")}</p>;
  }

  if (history.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-[var(--card-border)] bg-[var(--background)] p-6 text-center text-sm text-[var(--muted)]">
        {tStudents("noHistory")}
      </p>
    );
  }

  return (
    <div>
      <p className="mb-3 flex items-center gap-2 text-xs font-semibold text-[var(--foreground-strong)] sm:mb-4 sm:text-sm">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
          <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
        <span className="sm:hidden">{tStudents("historyTitleShort")}</span>
        <span className="hidden sm:inline">{tStudents("historyTitle")}</span>
      </p>

      <ul className={`space-y-2 ${compact ? "sm:hidden" : "md:hidden"}`}>
        {history.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => onSelectItem(item)}
              className="w-full rounded-xl border border-[var(--card-border)] bg-[var(--background)] p-3 text-left transition-colors hover:border-[var(--accent)]/40 hover:bg-[var(--accent-soft)]/30"
            >
              <div className="flex items-start justify-between gap-2">
                <time
                  dateTime={item.createdAt}
                  className="shrink-0 text-[10px] font-medium tabular-nums text-[var(--muted)]"
                >
                  {formatHistoryDate(item.createdAt, true)}
                </time>
                <ResultBadge result={item.result} t={t} short />
              </div>
              <p className="mt-1.5 truncate text-sm font-semibold text-[var(--foreground-strong)]">
                {item.taskTitle}
              </p>
              <p className="mt-0.5 truncate text-[11px] text-[var(--muted)]">
                {shortTopicTitle(item.topicTitle)}
              </p>
              <p className="mt-1.5 truncate text-xs text-[var(--foreground-strong)]">
                {item.imageUrl ? (
                  <span className="text-[var(--accent)]">
                    📷 {item.answerDisplay !== "📷" ? item.answerDisplay : tStudents("photoAnswer")}
                  </span>
                ) : (
                  item.answerDisplay
                )}
              </p>
            </button>
          </li>
        ))}
      </ul>

      <div className={`overflow-x-auto rounded-2xl border border-[var(--card-border)] ${compact ? "hidden sm:block" : "hidden md:block"}`}>
        <table className="min-w-full text-left text-sm">
          <thead className="bg-[var(--background)] text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
            <tr>
              <th className="px-3 py-2.5 sm:px-4 sm:py-3">{tStudents("colDate")}</th>
              <th className="px-3 py-2.5 sm:px-4 sm:py-3">{tStudents("colTopic")}</th>
              <th className="px-3 py-2.5 sm:px-4 sm:py-3">{tStudents("colTask")}</th>
              <th className="px-3 py-2.5 sm:px-4 sm:py-3">{tStudents("colAnswer")}</th>
              <th className="px-3 py-2.5 sm:px-4 sm:py-3">{tStudents("colResult")}</th>
              <th className="hidden px-4 py-3 sm:table-cell">{tStudents("colAttempt")}</th>
              <th className="hidden px-4 py-3 md:table-cell">{tStudents("colHints")}</th>
              <th className="hidden px-4 py-3 lg:table-cell">{tStudents("colTime")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--card-border)] bg-white">
            {history.map((item) => (
              <tr
                key={item.id}
                className="cursor-pointer hover:bg-[var(--accent-soft)]/40"
                onClick={() => onSelectItem(item)}
              >
                <td className="whitespace-nowrap px-3 py-2.5 text-xs tabular-nums text-[var(--muted)] sm:px-4 sm:py-3">
                  {formatHistoryDate(item.createdAt, compact)}
                </td>
                <td className="max-w-[8rem] truncate px-3 py-2.5 text-[var(--foreground-strong)] sm:px-4 sm:py-3">
                  {item.topicTitle}
                </td>
                <td className="max-w-[8rem] truncate px-3 py-2.5 text-[var(--foreground-strong)] sm:px-4 sm:py-3">
                  {item.taskTitle}
                </td>
                <td className="max-w-[10rem] truncate px-3 py-2.5 sm:px-4 sm:py-3">
                  {item.imageUrl ? (
                    <span className="inline-flex items-center gap-1 text-[var(--accent)]">
                      📷 {item.answerDisplay !== "📷" ? item.answerDisplay : tStudents("photoAnswer")}
                    </span>
                  ) : (
                    item.answerDisplay
                  )}
                </td>
                <td className="px-3 py-2.5 sm:px-4 sm:py-3">
                  <ResultBadge result={item.result} t={t} short={compact} />
                </td>
                <td className="hidden px-4 py-3 sm:table-cell">{item.attemptNumber}</td>
                <td className="hidden px-4 py-3 md:table-cell">
                  {item.usedHint ? t("hintUsed") : tStudents("no")}
                </td>
                <td className="hidden px-4 py-3 font-mono text-xs lg:table-cell">
                  {formatDuration(item.durationSeconds)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ProgressBar({ done, total }: { done: number; total: number }) {
  const percent = total > 0 ? Math.round((done / total) * 100) : 0;
  return (
    <div className="w-full min-w-[8rem] max-w-[10rem]">
      <div className="flex items-center justify-between text-xs text-[var(--muted)]">
        <span>{percent}%</span>
      </div>
      <div className="mt-1 h-2 overflow-hidden rounded-full bg-[var(--background)]">
        <div
          className="h-full rounded-full bg-[var(--accent)]"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

function TaskStatusBadge({
  status,
  errorCount,
  t,
  expanded,
}: {
  status: string;
  errorCount: number;
  t: ReturnType<typeof useTranslations>;
  expanded: boolean;
}) {
  const label = statusLabel(status, t);
  const tone =
    status === "CORRECT"
      ? "bg-emerald-50 text-emerald-700"
      : status === "SUBMITTED"
        ? "bg-blue-50 text-blue-700"
        : status === "SKIPPED"
          ? "bg-gray-100 text-gray-600"
          : errorCount > 0
            ? "bg-red-50 text-red-600"
            : "bg-amber-50 text-amber-700";

  return (
    <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${tone}`}>
      {label}
      {errorCount > 0 ? ` (${errorCount})` : null}
      <span className="ml-1 opacity-60">{expanded ? "▲" : "▼"}</span>
    </span>
  );
}

function ResultBadge({
  result,
  t,
  short = false,
}: {
  result: "CORRECT" | "INCORRECT" | "SUBMITTED" | "SKIPPED";
  t: ReturnType<typeof useTranslations>;
  short?: boolean;
}) {
  const label = short
    ? result === "CORRECT"
      ? "✓"
      : result === "INCORRECT"
        ? "✗"
        : result === "SKIPPED"
          ? "—"
          : "…"
    : historyResultLabel(result, t);
  const tone =
    result === "CORRECT"
      ? "bg-emerald-100 text-emerald-800"
      : result === "INCORRECT"
        ? "bg-red-100 text-red-800"
        : result === "SKIPPED"
          ? "bg-gray-100 text-gray-700"
          : "bg-blue-100 text-blue-800";

  return (
    <span
      className={`inline-block shrink-0 rounded-full font-semibold ${tone} ${
        short ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs"
      }`}
      title={short ? historyResultLabel(result, t) : undefined}
    >
      {label}
    </span>
  );
}
