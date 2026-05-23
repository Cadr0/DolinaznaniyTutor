"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import {
  revealTaskHintAction,
  skipTaskAction,
  submitTaskAnswerAction,
} from "@/app/[locale]/(app)/dashboard/homework/actions";
import { StudentTaskView } from "@/components/homework/StudentTaskView";
import { TaskComposerActions } from "@/components/homework/TaskComposerActions";
import { TaskProgressDots } from "@/components/homework/TaskProgressDots";
import { TaskImageDropzone } from "@/components/tasks/TaskImageDropzone";
import type { StudentTopicAssignmentSummary } from "@/lib/student-assignments";
import type { StudentRoomTask } from "@/lib/room-tasks";
import { parseUploadResponse, uploadErrorMessage } from "@/lib/upload-client";

type TaskPlayerProps = {
  locale: string;
  assignment: StudentTopicAssignmentSummary;
  initialTaskId: string;
  task: StudentRoomTask;
};

type Feedback = "correct" | "incorrect" | "submitted" | null;

export function TaskPlayer({ locale, assignment, initialTaskId, task }: TaskPlayerProps) {
  const t = useTranslations("app.homeworkPage");
  const [pending, startTransition] = useTransition();

  const taskId = initialTaskId;
  const currentTask = task;
  const [completedCount, setCompletedCount] = useState(assignment.completedTasks);
  const [answerText, setAnswerText] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [hintRevealed, setHintRevealed] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [error, setError] = useState("");
  const [uploadError, setUploadError] = useState("");

  const taskIndex = useMemo(() => {
    const index = assignment.tasks.findIndex((item) => item.roomTaskId === taskId);
    return index >= 0 ? index + 1 : 1;
  }, [assignment.tasks, taskId]);

  const progressPercent =
    assignment.totalTasks > 0
      ? Math.round((completedCount / assignment.totalTasks) * 100)
      : 0;

  useEffect(() => {
    setCompletedCount(assignment.completedTasks);
  }, [assignment.completedTasks, taskId]);

  const isMultiChoice = currentTask.choiceSelectionMode === "multiple";

  const resetForm = useCallback(() => {
    setAnswerText("");
    setSelectedIds([]);
    setImageUrl(null);
    setHintRevealed(null);
    setFeedback(null);
    setError("");
    setUploadError("");
  }, []);

  useEffect(() => {
    resetForm();
  }, [taskId, resetForm]);

  function goToNext(nextTaskId: string | null, completed: boolean) {
    const prefix = locale === "en" ? "/en" : "/ru";
    if (completed || !nextTaskId) {
      window.location.assign(`${prefix}/dashboard/homework`);
      return;
    }
    window.location.assign(`${prefix}/dashboard/homework/${assignment.id}?task=${nextTaskId}`);
  }

  function advanceAfterTask(result: { nextTaskId: string | null; completed: boolean }) {
    setCompletedCount((count) => Math.min(count + 1, assignment.totalTasks));
    goToNext(result.nextTaskId, result.completed);
  }

  async function handleUpload(file: File) {
    setUploading(true);
    setUploadError("");
    try {
      const formData = new FormData();
      formData.set("file", file);
      const response = await fetch("/api/uploads/task-image", { method: "POST", body: formData });
      const payload = await parseUploadResponse(response);
      if (!response.ok || !payload.url) {
        throw new Error(
          uploadErrorMessage(payload.error, {
            tooLarge: t("uploadTooLarge"),
            unauthorized: t("genericError"),
            failed: t("uploadFailed"),
          }),
        );
      }
      setImageUrl(payload.url);
    } catch (uploadFailure) {
      const message =
        uploadFailure instanceof Error ? uploadFailure.message : t("uploadFailed");
      setUploadError(message);
      throw uploadFailure;
    } finally {
      setUploading(false);
    }
  }

  function toggleOption(optionId: string) {
    if (isMultiChoice) {
      setSelectedIds((prev) =>
        prev.includes(optionId) ? prev.filter((id) => id !== optionId) : [...prev, optionId],
      );
      return;
    }
    setSelectedIds([optionId]);
  }

  function handleSubmit() {
    startTransition(async () => {
      setError("");
      setFeedback(null);
      try {
        const result = await submitTaskAnswerAction(locale, assignment.id, taskId, {
          answerText: answerText.trim() || undefined,
          selectedOptionIds: selectedIds,
          imageUrl: imageUrl ?? undefined,
        });

        if (result.status === "INCORRECT" || result.isCorrect === false) {
          setFeedback("incorrect");
          return;
        }

        advanceAfterTask(result);
      } catch (submitError) {
        setError(submitError instanceof Error ? submitError.message : t("genericError"));
      }
    });
  }

  function handleHint() {
    startTransition(async () => {
      try {
        const result = await revealTaskHintAction(locale, assignment.id, taskId);
        setHintRevealed(result.hint?.trim() ? result.hint : t("hintEmpty"));
      } catch (hintError) {
        setError(hintError instanceof Error ? hintError.message : t("genericError"));
      }
    });
  }

  function handleSkip() {
    startTransition(async () => {
      setError("");
      try {
        const result = await skipTaskAction(locale, assignment.id, taskId);
        advanceAfterTask(result);
      } catch (skipError) {
        setError(skipError instanceof Error ? skipError.message : t("genericError"));
      }
    });
  }

  function handleTextKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      if (!pending && !uploading) {
        handleSubmit();
      }
    }
  }

  const composerActions = (
    <TaskComposerActions
      submitLabel={t("check")}
      skipLabel={t("skip")}
      pending={pending}
      uploading={uploading}
      onSubmit={handleSubmit}
      onSkip={handleSkip}
    />
  );

  const isTextTask = currentTask.answerType === "TEXT";

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-4 pb-4 sm:pb-8">
      <div>
        <div className="flex items-baseline justify-between gap-3">
          <p className="min-w-0 truncate text-sm font-semibold text-[var(--foreground-strong)]">
            {assignment.topicTitle}
          </p>
          <p className="shrink-0 text-sm text-[var(--muted)]">
            {t("taskOf", { current: taskIndex, total: assignment.totalTasks })}
          </p>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--background-soft)]">
          <div
            className="h-full rounded-full bg-[var(--accent)] transition-all"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <TaskProgressDots
          assignmentId={assignment.id}
          tasks={assignment.tasks}
          currentTaskId={taskId}
        />
      </div>

      <div className="rounded-[2rem] border border-[var(--card-border)] bg-white p-5 shadow-[var(--shadow-card)] sm:p-6">
        <StudentTaskView
          task={currentTask}
          hintRevealed={hintRevealed}
          hintPending={pending}
          onHintRequest={hintRevealed ? undefined : handleHint}
          composer={isTextTask ? undefined : composerActions}
        >
          {isTextTask ? (
            <div className="mt-2 flex items-center gap-2">
              <textarea
                value={answerText}
                onChange={(event) => setAnswerText(event.target.value)}
                onKeyDown={handleTextKeyDown}
                placeholder={t("answerPlaceholder")}
                rows={2}
                className="min-h-[2.75rem] max-h-40 flex-1 resize-none rounded-2xl border-2 border-[var(--card-border)] bg-white px-3 py-2.5 text-sm outline-none transition-colors placeholder:text-[var(--muted)]/60 focus:border-[var(--accent)]"
              />
              <TaskComposerActions
                layout="inline"
                submitLabel={t("check")}
                skipLabel={t("skip")}
                pending={pending}
                uploading={uploading}
                onSubmit={handleSubmit}
                onSkip={handleSkip}
              />
            </div>
          ) : null}

          {currentTask.answerType === "CHOICE" ? (
            <ul className="mt-2 space-y-2">
              {currentTask.choiceOptions.map((option) => {
                const selected = selectedIds.includes(option.id);
                return (
                  <li key={option.id}>
                    <button
                      type="button"
                      onClick={() => toggleOption(option.id)}
                      className={`touch-target w-full rounded-2xl border-2 px-4 py-3 text-left text-sm transition-colors ${
                        selected
                          ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--foreground-strong)]"
                          : "border-[var(--card-border)] bg-white hover:border-[var(--accent)]/40"
                      }`}
                    >
                      {option.text}
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : null}

          {currentTask.answerType === "IMAGE" ? (
            <div className="mt-2">
              <TaskImageDropzone
                imageUrl={imageUrl}
                uploading={uploading}
                error={uploadError}
                onUpload={handleUpload}
                onRemove={() => {
                  setImageUrl(null);
                  setUploadError("");
                }}
                labels={{
                  idle: t("uploadPhoto"),
                  hint: t("uploadPhotoHint"),
                }}
              />
            </div>
          ) : null}
        </StudentTaskView>

        {feedback === "incorrect" ? (
          <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {t("incorrect")}
          </p>
        ) : null}
        {error && feedback !== "incorrect" ? (
          <p className="mt-4 text-sm text-red-600">{error}</p>
        ) : null}
      </div>
    </div>
  );
}
