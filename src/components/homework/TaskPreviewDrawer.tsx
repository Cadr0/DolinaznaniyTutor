"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import type { TaskAttemptContext } from "@/lib/student-assignments";
import { answerTypeFullLabel } from "@/lib/task-labels";
import { lockPageScroll } from "@/lib/scroll-lock";

export type TaskPreviewAttempt = {
  answerDisplay: string;
  answerText: string | null;
  optionLabels: string[];
  imageUrl: string | null;
  result: "CORRECT" | "INCORRECT" | "SUBMITTED" | "SKIPPED";
  attemptNumber: number;
  usedHint: boolean;
  createdAt: Date;
};

type TaskPreviewDrawerProps = {
  open: boolean;
  loading?: boolean;
  task: TaskAttemptContext | null;
  attempt: TaskPreviewAttempt | null;
  onClose: () => void;
};

function formatTaskText(text: string) {
  return text.replace(/\\r\\n/g, "\n").replace(/\\n/g, "\n").replace(/\r\n/g, "\n");
}

function resultTone(result: TaskPreviewAttempt["result"]) {
  switch (result) {
    case "CORRECT":
      return "bg-emerald-100 text-emerald-800";
    case "INCORRECT":
      return "bg-red-100 text-red-800";
    case "SKIPPED":
      return "bg-gray-100 text-gray-700";
    default:
      return "bg-blue-100 text-blue-800";
  }
}

export function TaskPreviewDrawer({
  open,
  loading = false,
  task,
  attempt,
  onClose,
}: TaskPreviewDrawerProps) {
  const t = useTranslations("app.homeworkPage");
  const tStudents = useTranslations("app.studentsPage");

  useEffect(() => {
    if (!open) {
      return;
    }
    return lockPageScroll();
  }, [open]);

  if (!open) {
    return null;
  }

  const resultLabel =
    attempt?.result === "CORRECT"
      ? t("statusCorrect")
      : attempt?.result === "INCORRECT"
        ? t("statusIncorrect")
        : attempt?.result === "SKIPPED"
          ? t("statusSkipped")
          : t("statusSubmitted");

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label={tStudents("closePreview")}
        className="dialog-scrim absolute inset-0 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <aside className="absolute inset-y-0 right-0 flex w-full max-w-lg flex-col border-l border-[var(--card-border)] bg-white shadow-[0_0_40px_rgba(42,62,71,0.14)]">
        <div className="border-b border-[var(--card-border)] p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--accent)]">
                {task?.topicTitle}
              </p>
              <h2 className="mt-1 font-display text-2xl text-[var(--foreground-strong)]">
                {task?.title ?? tStudents("taskPreview")}
              </h2>
              {attempt ? (
                <p className="mt-1 text-xs text-[var(--muted)]">
                  {tStudents("attemptNumber", { n: attempt.attemptNumber })} ·{" "}
                  {new Date(attempt.createdAt).toLocaleString("ru-RU")}
                </p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="shrink-0 rounded-full px-3 py-1 text-sm font-semibold text-[var(--muted)] hover:bg-[var(--background-soft)]"
            >
              {tStudents("closePreview")}
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {loading ? (
            <p className="text-sm text-[var(--muted)]">{tStudents("loadingPreview")}</p>
          ) : (
            <div className="space-y-5">
              {task?.description ? (
                <section>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                    {tStudents("taskCondition")}
                  </h3>
                  <p className="mt-2 whitespace-pre-line rounded-2xl border border-[var(--card-border)] bg-[var(--background)] p-4 text-sm leading-relaxed text-[var(--foreground-strong)]">
                    {formatTaskText(task.description)}
                  </p>
                </section>
              ) : null}

              {task?.imageUrl ? (
                <section>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                    {tStudents("taskImage")}
                  </h3>
                  <div className="mt-2 overflow-hidden rounded-2xl border border-[var(--card-border)] bg-[var(--background)]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={task.imageUrl}
                      alt=""
                      className="max-h-[min(45vh,420px)] w-full object-contain"
                    />
                  </div>
                </section>
              ) : null}

              {attempt ? (
                <section>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                      {tStudents("studentAnswer")}
                    </h3>
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${resultTone(attempt.result)}`}
                    >
                      {resultLabel}
                    </span>
                  </div>
                  <div className="mt-2 space-y-3 rounded-2xl border border-[var(--card-border)] bg-[var(--background)] p-4">
                    {attempt.answerText ? (
                      <p className="whitespace-pre-line text-sm text-[var(--foreground-strong)]">
                        {formatTaskText(attempt.answerText)}
                      </p>
                    ) : null}
                    {attempt.optionLabels.length > 0 ? (
                      <ul className="space-y-1 text-sm text-[var(--foreground-strong)]">
                        {attempt.optionLabels.map((label) => (
                          <li key={label} className="rounded-lg bg-white px-3 py-2">
                            {label}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                    {!attempt.answerText &&
                    attempt.optionLabels.length === 0 &&
                    attempt.answerDisplay !== "—" &&
                    attempt.answerDisplay !== "📷" ? (
                      <p className="text-sm text-[var(--foreground-strong)]">{attempt.answerDisplay}</p>
                    ) : null}
                    {attempt.imageUrl ? (
                      <div className="overflow-hidden rounded-xl border border-[var(--card-border)] bg-white">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={attempt.imageUrl}
                          alt=""
                          className="max-h-[min(40vh,360px)] w-full object-contain"
                        />
                      </div>
                    ) : null}
                    {attempt.usedHint ? (
                      <p className="text-xs font-semibold text-amber-700">{t("hintUsed")}</p>
                    ) : null}
                  </div>
                </section>
              ) : null}

              {task ? (
                <section className="rounded-2xl border border-[var(--card-border)] bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                    {tStudents("answerType")}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-[var(--foreground-strong)]">
                    {answerTypeFullLabel[task.answerType as keyof typeof answerTypeFullLabel] ??
                      task.answerType}
                  </p>
                  {task.correctAnswer ? (
                    <div className="mt-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                        {tStudents("correctAnswer")}
                      </p>
                      <p className="mt-1 whitespace-pre-line text-sm text-[var(--foreground-strong)]">
                        {formatTaskText(task.correctAnswer)}
                      </p>
                    </div>
                  ) : null}
                  {task.choiceOptions.length > 0 ? (
                    <ul className="mt-4 space-y-2">
                      {task.choiceOptions.map((option) => (
                        <li
                          key={option.id}
                          className={`rounded-lg px-3 py-2 text-sm ${
                            option.isCorrect
                              ? "bg-emerald-50 font-semibold text-emerald-800"
                              : "bg-[var(--background)] text-[var(--foreground-strong)]"
                          }`}
                        >
                          {option.text}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </section>
              ) : null}
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
