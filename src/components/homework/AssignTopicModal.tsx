"use client";

import { useEffect, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import {
  assignTopicToStudentAction,
  getRoomTopicsForAssignAction,
} from "@/app/[locale]/(app)/dashboard/homework/actions";
import { RoomDialog } from "@/components/rooms/RoomDialog";
import { Button } from "@/components/ui/Button";
import { answerTypeShortLabel } from "@/lib/task-labels";

type RoomTopicForAssign = Awaited<ReturnType<typeof getRoomTopicsForAssignAction>>[number];

type AssignTopicModalProps = {
  locale: string;
  roomId: string;
  studentId: string;
  studentName: string;
  open: boolean;
  onClose: () => void;
};

export function AssignTopicModal({
  locale,
  roomId,
  studentId,
  studentName,
  open,
  onClose,
}: AssignTopicModalProps) {
  const t = useTranslations("app.homeworkPage");
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [topics, setTopics] = useState<RoomTopicForAssign[]>([]);
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) {
      return;
    }

    startTransition(async () => {
      try {
        const data = await getRoomTopicsForAssignAction(locale, roomId);
        setTopics(data);
        if (data.length > 0) {
          setSelectedTopicId(data[0].id);
          setSelectedTaskIds(new Set(data[0].tasks.map((task) => task.id)));
        }
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : t("genericError"));
      }
    });
  }, [open, locale, roomId]);

  const selectedTopic = topics.find((topic) => topic.id === selectedTopicId) ?? null;

  function selectTopic(topicId: string) {
    const topic = topics.find((item) => item.id === topicId);
    setSelectedTopicId(topicId);
    setSelectedTaskIds(new Set(topic?.tasks.map((task) => task.id) ?? []));
  }

  function toggleTask(taskId: string) {
    setSelectedTaskIds((prev) => {
      const next = new Set(prev);
      if (next.has(taskId)) {
        next.delete(taskId);
      } else {
        next.add(taskId);
      }
      return next;
    });
  }

  function selectAllTasks() {
    if (!selectedTopic) {
      return;
    }
    setSelectedTaskIds(new Set(selectedTopic.tasks.map((task) => task.id)));
  }

  function handleAssign() {
    if (!selectedTopicId || selectedTaskIds.size === 0) {
      setError(t("selectAtLeastOneTask"));
      return;
    }

    startTransition(async () => {
      setError("");
      try {
        await assignTopicToStudentAction(
          locale,
          roomId,
          studentId,
          selectedTopicId,
          [...selectedTaskIds],
        );
        router.refresh();
        onClose();
      } catch (assignError) {
        setError(assignError instanceof Error ? assignError.message : t("genericError"));
      }
    });
  }

  return (
    <RoomDialog
      open={open}
      title={t("assignTitle")}
      onClose={onClose}
      maxWidthClass="max-w-lg"
    >
      <p className="mb-4 text-sm text-[var(--muted)]">{studentName}</p>

      {topics.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">{t("noTopicsInRoom")}</p>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
              {t("topicLabel")}
            </label>
            <select
              value={selectedTopicId ?? ""}
              onChange={(event) => selectTopic(event.target.value)}
              className="touch-target mt-2 w-full rounded-2xl border-2 border-[var(--card-border)] px-4 py-2 text-sm outline-none focus:border-[var(--accent)]"
            >
              {topics.map((topic) => (
                <option key={topic.id} value={topic.id}>
                  {topic.title} ({topic.tasks.length})
                </option>
              ))}
            </select>
          </div>

          {selectedTopic ? (
            <div>
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                  {t("tasksLabel")}
                </p>
                <button
                  type="button"
                  onClick={selectAllTasks}
                  className="text-xs font-semibold text-[var(--accent)] hover:underline"
                >
                  {t("assignAllTasks")}
                </button>
              </div>
              <ul className="mt-2 max-h-48 space-y-2 overflow-y-auto">
                {selectedTopic.tasks.map((task) => (
                  <li key={task.id}>
                    <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-[var(--card-border)] p-3">
                      <input
                        type="checkbox"
                        checked={selectedTaskIds.has(task.id)}
                        onChange={() => toggleTask(task.id)}
                        className="mt-1"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold text-[var(--foreground-strong)]">
                          {task.title}
                        </span>
                        <span className="text-xs text-[var(--muted)]">
                          {answerTypeShortLabel[task.answerType]}
                        </span>
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      )}

      {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

      <div className="mt-6 flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onClose} disabled={pending}>
          {t("cancel")}
        </Button>
        <Button type="button" onClick={handleAssign} disabled={pending || topics.length === 0}>
          {t("assignSubmit")}
        </Button>
      </div>
    </RoomDialog>
  );
}
