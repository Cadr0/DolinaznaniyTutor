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

const toneClass: Record<Exclude<DotTone, "current">, string> = {
  correct: "h-3.5 w-3.5 bg-emerald-500 hover:bg-emerald-600",
  incorrect: "h-3.5 w-3.5 bg-red-500 hover:bg-red-600",
  pending: "h-3.5 w-3.5 bg-[var(--card-border)] hover:bg-[var(--muted)]/40",
  skipped: "h-3.5 w-3.5 bg-amber-400 hover:bg-amber-500",
  submitted: "h-3.5 w-3.5 bg-sky-500 hover:bg-sky-600",
};

const currentDotClass =
  "h-4 w-4 bg-[var(--coral)] ring-[3px] ring-[var(--coral)]/35 ring-offset-2 ring-offset-[var(--background-soft)] shadow-[0_0_0_4px_rgba(244,168,150,0.25)] animate-pulse";

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
      className="mt-3 -mx-1 overflow-x-auto overflow-y-visible px-2 py-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      role="navigation"
      aria-label={t("taskNavLabel")}
    >
      <div className="flex min-w-min items-center gap-2.5">
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
              className={`flex shrink-0 rounded-full transition-colors ${
                isCurrent
                  ? currentDotClass
                  : toneClass[tone as Exclude<DotTone, "current">]
              }`}
            />
          );
        })}
      </div>
    </div>
  );
}
