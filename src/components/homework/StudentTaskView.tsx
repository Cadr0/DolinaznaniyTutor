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
  children?: React.ReactNode;
};

export function StudentTaskView({ task, hintRevealed, children }: StudentTaskViewProps) {
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

      <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--background)] p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
          {answerTypeFullLabel[task.answerType]}
        </p>
        {children}
      </div>

      {hintRevealed ? (
        <div className="rounded-2xl border border-dashed border-[var(--accent)]/40 bg-[var(--accent-soft)]/40 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--accent)]">
            {t("hint")}
          </p>
          <p className="mt-2 whitespace-pre-line text-sm text-[var(--foreground-strong)]">
            {formatTaskText(hintRevealed)}
          </p>
        </div>
      ) : null}
    </div>
  );
}
