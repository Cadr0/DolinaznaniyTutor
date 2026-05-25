"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import {
  assignTopicToStudentAction,
  getRoomTopicsForAssignAction,
} from "@/app/[locale]/(app)/dashboard/homework/actions";
import { Button } from "@/components/ui/Button";
import type { StudentTopicAssignmentSummary } from "@/lib/student-assignments";
import type { TaskAnswerType } from "@prisma/client";
import { answerTypeShortLabel } from "@/lib/task-labels";

type RoomTopicForAssign = Awaited<ReturnType<typeof getRoomTopicsForAssignAction>>[number];

type AssignHomeworkPanelProps = {
  locale: string;
  roomId: string;
  studentId: string;
  assignments: StudentTopicAssignmentSummary[];
  onAssigned: () => void;
  onOpenTaskPreview: (roomTaskId: string) => void;
};

export function AssignHomeworkPanel({
  locale,
  roomId,
  studentId,
  assignments,
  onAssigned,
  onOpenTaskPreview,
}: AssignHomeworkPanelProps) {
  const t = useTranslations("app.homeworkPage");
  const tStudents = useTranslations("app.studentsPage");
  const [pending, startTransition] = useTransition();
  const [topics, setTopics] = useState<RoomTopicForAssign[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [expandedTopicId, setExpandedTopicId] = useState<string | null>(null);
  const [selectedByTopic, setSelectedByTopic] = useState<Map<string, Set<string>>>(new Map());
  const [error, setError] = useState("");

  const assignmentByTopicId = useMemo(
    () => new Map(assignments.map((assignment) => [assignment.roomTopicId, assignment])),
    [assignments],
  );

  const loadTopics = useCallback(() => {
    startTransition(async () => {
      try {
        const data = await getRoomTopicsForAssignAction(locale, roomId);
        setTopics(data);
        setLoaded(true);
        setError("");
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : t("genericError"));
      }
    });
  }, [locale, roomId, t]);

  useEffect(() => {
    loadTopics();
  }, [loadTopics]);

  function getDefaultSelection(topic: RoomTopicForAssign) {
    const existing = assignmentByTopicId.get(topic.id);
    if (existing) {
      return new Set(existing.tasks.map((task) => task.roomTaskId));
    }
    return new Set(topic.tasks.map((task) => task.id));
  }

  function toggleTopic(topicId: string) {
    setExpandedTopicId((current) => {
      if (current === topicId) {
        return null;
      }
      const topic = topics.find((item) => item.id === topicId);
      if (topic && !selectedByTopic.has(topicId)) {
        setSelectedByTopic((prev) => {
          const next = new Map(prev);
          next.set(topicId, getDefaultSelection(topic));
          return next;
        });
      }
      return topicId;
    });
  }

  function toggleTask(topicId: string, taskId: string) {
    setSelectedByTopic((prev) => {
      const next = new Map(prev);
      const topic = topics.find((item) => item.id === topicId);
      const current = new Set(next.get(topicId) ?? (topic ? getDefaultSelection(topic) : []));
      if (current.has(taskId)) {
        current.delete(taskId);
      } else {
        current.add(taskId);
      }
      next.set(topicId, current);
      return next;
    });
  }

  function selectAllTasks(topic: RoomTopicForAssign) {
    setSelectedByTopic((prev) => {
      const next = new Map(prev);
      next.set(topic.id, new Set(topic.tasks.map((task) => task.id)));
      return next;
    });
  }

  function clearSelection(topicId: string) {
    setSelectedByTopic((prev) => {
      const next = new Map(prev);
      next.set(topicId, new Set());
      return next;
    });
  }

  function handleAssign(topicId: string) {
    const topic = topics.find((item) => item.id === topicId);
    const selected = selectedByTopic.get(topicId) ?? (topic ? getDefaultSelection(topic) : new Set());
    if (!topic || selected.size === 0) {
      setError(t("selectAtLeastOneTask"));
      return;
    }

    startTransition(async () => {
      setError("");
      try {
        await assignTopicToStudentAction(locale, roomId, studentId, topicId, [...selected]);
        onAssigned();
        setExpandedTopicId(null);
      } catch (assignError) {
        setError(assignError instanceof Error ? assignError.message : t("genericError"));
      }
    });
  }

  if (!loaded && pending) {
    return <p className="text-sm text-[var(--muted)]">{tStudents("loadingTopics")}</p>;
  }

  if (topics.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-[var(--card-border)] bg-[var(--background)] p-6 text-center text-sm text-[var(--muted)]">
        {t("noTopicsInRoom")}
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--accent-soft)] text-lg font-bold text-[var(--accent)]">
          +
        </span>
        <h3 className="font-semibold text-[var(--foreground-strong)]">{tStudents("assignNewHomework")}</h3>
      </div>

      <div className="space-y-2">
        {topics.map((topic) => {
          const expanded = expandedTopicId === topic.id;
          const selected =
            selectedByTopic.get(topic.id) ?? (expanded ? getDefaultSelection(topic) : new Set());
          const assignment = assignmentByTopicId.get(topic.id);
          const selectedCount = expanded ? selected.size : 0;

          return (
            <div
              key={topic.id}
              className="overflow-hidden rounded-2xl border border-[var(--card-border)] bg-[var(--background)]"
            >
              <button
                type="button"
                onClick={() => toggleTopic(topic.id)}
                className="flex w-full items-center gap-3 px-4 py-4 text-left hover:bg-white/60"
              >
                <span
                  className={`shrink-0 text-[var(--muted)] transition-transform ${expanded ? "rotate-90" : ""}`}
                  aria-hidden
                >
                  ▶
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold text-[var(--foreground-strong)]">
                    {topic.title}
                  </span>
                  <span className="mt-0.5 block text-xs text-[var(--muted)]">
                    {tStudents("tasksInTopic", { count: topic.tasks.length })}
                    {assignment ? ` · ${tStudents("homeworkBadge").toLowerCase()}` : ""}
                  </span>
                </span>
                {expanded && selectedCount > 0 ? (
                  <span className="shrink-0 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                    {tStudents("selectedCount", { count: selectedCount })}
                  </span>
                ) : null}
              </button>

              {expanded ? (
                <div className="border-t border-[var(--card-border)] bg-white px-4 py-4">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => selectAllTasks(topic)}
                      className="text-xs font-semibold text-[var(--accent)] hover:underline"
                    >
                      {t("assignAllTasks")}
                    </button>
                    <button
                      type="button"
                      onClick={() => clearSelection(topic.id)}
                      className="text-xs font-semibold text-[var(--muted)] hover:underline"
                    >
                      {tStudents("clearSelection")}
                    </button>
                  </div>

                  <ul className="grid gap-2 sm:grid-cols-2">
                    {topic.tasks.map((task) => {
                      const assignedTask = assignment?.tasks.find(
                        (item) => item.roomTaskId === task.id,
                      );
                      const inProgress = assignedTask?.progress?.status === "IN_PROGRESS";

                      return (
                        <li key={task.id}>
                          <label
                            className={`flex h-full cursor-pointer flex-col rounded-xl border p-3 transition-colors ${
                              selected.has(task.id)
                                ? "border-[var(--accent)] bg-[var(--accent-soft)]/40"
                                : "border-[var(--card-border)] bg-[var(--background)] hover:border-[var(--accent)]/30"
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <input
                                type="checkbox"
                                checked={selected.has(task.id)}
                                onChange={() => toggleTask(topic.id, task.id)}
                                className="mt-1 shrink-0"
                              />
                              <span className="min-w-0 flex-1">
                                <span className="block text-sm font-semibold text-[var(--foreground-strong)]">
                                  {task.title}
                                </span>
                                <span className="mt-1 inline-block text-xs text-[var(--muted)]">
                                  {answerTypeShortLabel[task.answerType as TaskAnswerType]}
                                </span>
                              </span>
                            </div>
                            <div className="mt-3 flex flex-wrap items-center gap-2">
                              <button
                                type="button"
                                onClick={(event) => {
                                  event.preventDefault();
                                  onOpenTaskPreview(task.id);
                                }}
                                className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[var(--accent)] ring-1 ring-[var(--card-border)] hover:bg-[var(--accent-soft)]"
                              >
                                {tStudents("previewTask")}
                              </button>
                              {inProgress ? (
                                <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-semibold text-amber-700">
                                  {t("statusPending")}
                                </span>
                              ) : null}
                              {assignedTask ? (
                                <span className="rounded-full bg-[var(--accent-soft)] px-2.5 py-1 text-[10px] font-semibold text-[var(--accent)]">
                                  {tStudents("alreadyAssigned")}
                                </span>
                              ) : null}
                            </div>
                          </label>
                        </li>
                      );
                    })}
                  </ul>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button
                      type="button"
                      className="flex-1 sm:flex-none"
                      disabled={pending || selected.size === 0}
                      onClick={() => handleAssign(topic.id)}
                    >
                      {tStudents("assignSelected")}
                    </Button>
                  </div>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
