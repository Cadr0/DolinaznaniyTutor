"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import type { AssignmentTaskItem } from "@/lib/student-assignments";

type TaskProgressDotsProps = {
  assignmentId: string;
  tasks: AssignmentTaskItem[];
  currentTaskId: string;
};

type DotTone = "current" | "correct" | "incorrect" | "pending" | "skipped" | "submitted";

function resolveDotTone(task: AssignmentTaskItem, currentTaskId: string): DotTone {
  if (task.roomTaskId === currentTaskId) {
    return "current";
  }

  const progress = task.progress;
  if (!progress || progress.status === "NOT_STARTED") {
    return "pending";
  }

  if (progress.status === "CORRECT") {
    return "correct";
  }

  if (progress.errorCount > 0) {
    return "incorrect";
  }

  if (progress.status === "SKIPPED") {
    return "skipped";
  }

  if (progress.status === "SUBMITTED") {
    return "submitted";
  }

  return "pending";
}

const toneClass: Record<DotTone, string> = {
  current: "bg-[var(--accent)] ring-2 ring-[var(--accent)] ring-offset-2 ring-offset-[var(--background-soft)]",
  correct: "bg-emerald-500 hover:bg-emerald-600",
  incorrect: "bg-red-500 hover:bg-red-600",
  pending: "bg-[var(--card-border)] hover:bg-[var(--muted)]/40",
  skipped: "bg-amber-400 hover:bg-amber-500",
  submitted: "bg-sky-500 hover:bg-sky-600",
};

export function TaskProgressDots({
  assignmentId,
  tasks,
  currentTaskId,
}: TaskProgressDotsProps) {
  const t = useTranslations("app.homeworkPage");

  if (tasks.length <= 1) {
    return null;
  }

  return (
    <div
      className="mt-3 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      role="navigation"
      aria-label={t("taskNavLabel")}
    >
      {tasks.map((task, index) => {
        const tone = resolveDotTone(task, currentTaskId);
        const isCurrent = task.roomTaskId === currentTaskId;

        return (
          <Link
            key={task.roomTaskId}
            href={`/dashboard/homework/${assignmentId}?task=${task.roomTaskId}`}
            title={task.title}
            aria-label={t("taskNavItem", { n: index + 1, title: task.title })}
            aria-current={isCurrent ? "step" : undefined}
            className={`flex h-3.5 w-3.5 shrink-0 rounded-full transition-colors ${toneClass[tone]}`}
          />
        );
      })}
    </div>
  );
}
