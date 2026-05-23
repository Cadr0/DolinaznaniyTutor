"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import {
  revealTaskHintAction,
  skipTaskAction,
  submitTaskAnswerAction,
} from "@/app/[locale]/(app)/dashboard/homework/actions";
import { StudentTaskView } from "@/components/homework/StudentTaskView";
import { TaskImageDropzone } from "@/components/tasks/TaskImageDropzone";
import { Button } from "@/components/ui/Button";
import type { StudentTopicAssignmentSummary } from "@/lib/student-assignments";
import type { StudentRoomTask } from "@/lib/room-tasks";

type TaskPlayerProps = {
  locale: string;
  assignment: StudentTopicAssignmentSummary;
  initialTaskId: string;
  task: StudentRoomTask;
};

type Feedback = "correct" | "incorrect" | "submitted" | null;

export function TaskPlayer({ locale, assignment, initialTaskId, task }: TaskPlayerProps) {
  const t = useTranslations("app.homeworkPage");
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const taskId = initialTaskId;
  const currentTask = task;
  const [answerText, setAnswerText] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [hintRevealed, setHintRevealed] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [error, setError] = useState("");

  const taskIndex = useMemo(() => {
    const index = assignment.tasks.findIndex((item) => item.roomTaskId === taskId);
    return index >= 0 ? index + 1 : 1;
  }, [assignment.tasks, taskId]);

  const progressPercent =
    assignment.totalTasks > 0
      ? Math.round((assignment.completedTasks / assignment.totalTasks) * 100)
      : 0;

  const isMultiChoice = currentTask.choiceSelectionMode === "multiple";

  const resetForm = useCallback(() => {
    setAnswerText("");
    setSelectedIds([]);
    setImageUrl(null);
    setHintRevealed(null);
    setFeedback(null);
    setError("");
  }, []);

  useEffect(() => {
    resetForm();
  }, [taskId, resetForm]);

  function goToNext(nextTaskId: string | null, completed: boolean) {
    if (completed || !nextTaskId) {
      router.replace("/dashboard/homework");
    } else {
      router.replace(`/dashboard/homework/${assignment.id}?task=${nextTaskId}`);
    }
    router.refresh();
  }

  async function handleUpload(file: File) {
    setUploading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.set("file", file);
      const response = await fetch("/api/uploads/task-image", { method: "POST", body: formData });
      const payload = (await response.json()) as { url?: string; error?: string };
      if (!response.ok || !payload.url) {
        throw new Error(payload.error ?? "Upload failed");
      }
      setImageUrl(payload.url);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Upload failed");
      throw uploadError;
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

        goToNext(result.nextTaskId, result.completed);
      } catch (submitError) {
        setError(submitError instanceof Error ? submitError.message : "Error");
      }
    });
  }

  function handleHint() {
    startTransition(async () => {
      try {
        const result = await revealTaskHintAction(locale, assignment.id, taskId);
        setHintRevealed(result.hint ?? t("hintEmpty"));
      } catch (hintError) {
        setError(hintError instanceof Error ? hintError.message : "Error");
      }
    });
  }

  function handleSkip() {
    startTransition(async () => {
      setError("");
      try {
        const result = await skipTaskAction(locale, assignment.id, taskId);
        goToNext(result.nextTaskId, result.completed);
      } catch (skipError) {
        setError(skipError instanceof Error ? skipError.message : "Error");
      }
    });
  }

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-4 pb-28 sm:pb-8">
      <div>
        <p className="text-sm font-semibold text-[var(--muted)]">{assignment.topicTitle}</p>
        <p className="mt-1 text-sm text-[var(--foreground-strong)]">
          {t("taskOf", { current: taskIndex, total: assignment.totalTasks })}
        </p>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--background-soft)]">
          <div
            className="h-full rounded-full bg-[var(--accent)] transition-all"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <div className="rounded-[2rem] border border-[var(--card-border)] bg-white p-5 shadow-[var(--shadow-card)] sm:p-6">
        <StudentTaskView task={currentTask} hintRevealed={hintRevealed}>
          {currentTask.answerType === "TEXT" ? (
            <textarea
              value={answerText}
              onChange={(event) => setAnswerText(event.target.value)}
              placeholder={t("answerPlaceholder")}
              rows={3}
              className="mt-3 w-full resize-y rounded-2xl border-2 border-[var(--card-border)] px-4 py-3 text-sm outline-none focus:border-[var(--accent)]"
            />
          ) : null}

          {currentTask.answerType === "CHOICE" ? (
            <ul className="mt-3 space-y-2">
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
            <div className="mt-3">
              <TaskImageDropzone
                imageUrl={imageUrl}
                uploading={uploading}
                error={error}
                onUpload={handleUpload}
                onRemove={() => setImageUrl(null)}
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

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--card-border)] bg-white/95 p-4 backdrop-blur-sm sm:static sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none">
        <div className="mx-auto flex max-w-xl flex-col gap-2 sm:flex-row sm:flex-wrap">
          <Button
            type="button"
            variant="secondary"
            className="w-full sm:w-auto"
            disabled={pending}
            onClick={handleHint}
          >
            {t("hint")}
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="w-full sm:w-auto"
            disabled={pending}
            onClick={handleSkip}
          >
            {t("skip")}
          </Button>
          <Button
            type="button"
            className="w-full sm:ml-auto sm:w-auto"
            disabled={pending || uploading}
            onClick={handleSubmit}
          >
            {t("check")}
          </Button>
        </div>
      </div>
    </div>
  );
}
