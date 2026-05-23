"use client";

import { useTranslations } from "next-intl";
import type { StudentRoomTask } from "@/lib/room-tasks";
import { answerTypeFullLabel } from "@/lib/task-labels";

function formatTaskText(text: string): string {
  return text.replace(/\\r\\n/g, "\n").replace(/\\n/g, "\n").replace(/\r\n/g, "\n");
}

type StudentTaskViewProps = {
  task: StudentRoomTask;
  hintRevealed?: string | null;
  hintPending?: boolean;
  onHintRequest?: () => void;
  children?: React.ReactNode;
  composer?: React.ReactNode;
};

export function StudentTaskView({
  task,
  hintRevealed,
  hintPending,
  onHintRequest,
  children,
  composer,
}: StudentTaskViewProps) {
  const t = useTranslations("app.homeworkPage");

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-display text-xl text-[var(--foreground-strong)]">{task.title}</h3>
        {task.description ? (
          <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-[var(--foreground-strong)]">
            {formatTaskText(task.description)}
          </p>
        ) : null}

        {hintRevealed ? (
          <p className="mt-3 text-xs leading-relaxed text-[var(--muted)]">
            <span className="font-medium text-[var(--accent)]/80">{t("hint")}: </span>
            {formatTaskText(hintRevealed)}
          </p>
        ) : onHintRequest ? (
          <button
            type="button"
            onClick={onHintRequest}
            disabled={hintPending}
            className="mt-3 text-xs text-[var(--muted)]/70 transition-colors hover:text-[var(--accent)] disabled:opacity-50"
          >
            {t("hint")}
          </button>
        ) : null}
      </div>

      {task.imageUrl ? (
        <div className="overflow-hidden rounded-2xl border border-[var(--card-border)] bg-[var(--background)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={task.imageUrl}
            alt=""
            className="max-h-[min(55vh,520px)] w-full object-contain"
          />
        </div>
      ) : null}

      <div className="rounded-[1.25rem] border border-[var(--card-border)] bg-[var(--background)] p-3 sm:p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
          {answerTypeFullLabel[task.answerType]}
        </p>
        {children}
        {composer}
      </div>
    </div>
  );
}
