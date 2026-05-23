"use client";

import { useMemo, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import type { TaskAnswerType } from "@prisma/client";
import {
  createTask,
  deleteTask,
  updateTask,
} from "@/app/[locale]/(app)/dashboard/materials/actions";
import type { TaskWithDetails } from "@/lib/tasks";

type TopicOption = {
  id: string;
  title: string;
};

type TaskEditorProps = {
  locale: string;
  topics: TopicOption[];
  selectedTopicId: string | null;
  task: TaskWithDetails | null;
  mode: "create" | "edit";
  onCreated: (taskId: string) => void;
  onDeleted: () => void;
};

const answerTypes: { value: TaskAnswerType; label: string }[] = [
  { value: "TEXT", label: "Текстовый ответ" },
  { value: "CHOICE", label: "Выбор варианта" },
  { value: "IMAGE", label: "Ответ фото" },
];

export function TaskEditor({
  locale,
  topics,
  selectedTopicId,
  task,
  mode,
  onCreated,
  onDeleted,
}: TaskEditorProps) {
  const [answerType, setAnswerType] = useState<TaskAnswerType>(
    task?.answerType ?? "TEXT",
  );
  const [alternatives, setAlternatives] = useState(
    task?.alternativeAnswers.map((item) => ({
      answerText: item.answerText,
      explanation: item.explanation ?? "",
    })) ?? [{ answerText: "", explanation: "" }],
  );
  const [choiceOptions, setChoiceOptions] = useState(
    task?.choiceOptions.map((item) => ({
      text: item.text,
      isCorrect: item.isCorrect,
    })) ?? [
      { text: "", isCorrect: true },
      { text: "", isCorrect: false },
    ],
  );
  const [imageUrl, setImageUrl] = useState(task?.imageUrl ?? "");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [removeImage, setRemoveImage] = useState(false);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const defaultTopicId = useMemo(
    () => task?.topicId ?? selectedTopicId ?? topics[0]?.id ?? "",
    [task?.topicId, selectedTopicId, topics],
  );

  if (mode === "create" && !selectedTopicId && topics.length === 0) {
    return (
      <div className="rounded-[2rem] border border-[var(--card-border)] bg-white p-6 shadow-[var(--shadow-card)]">
        <p className="text-sm text-[var(--muted)]">Сначала создайте тему.</p>
      </div>
    );
  }

  async function handleImageUpload(file: File) {
    setUploading(true);
    setError("");

    try {
      const body = new FormData();
      body.append("file", file);

      const response = await fetch("/api/uploads/task-image", {
        method: "POST",
        body,
      });
      const data = (await response.json()) as { url?: string; error?: string };

      if (!response.ok || !data.url) {
        throw new Error(data.error ?? "Не удалось загрузить изображение");
      }

      setImageUrl(data.url);
      setRemoveImage(false);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Ошибка загрузки");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");

    const formData = new FormData(event.currentTarget);
    formData.set("answerType", answerType);
    formData.set("imageUrl", imageUrl);
    formData.set("alternativesJson", JSON.stringify(alternatives));
    formData.set("choiceOptionsJson", JSON.stringify(choiceOptions));

    if (removeImage) {
      formData.set("removeImage", "on");
    }

    try {
      if (mode === "create") {
        const taskId = await createTask(locale, formData);
        if (taskId) {
          onCreated(taskId);
        }
      } else if (task) {
        await updateTask(locale, task.id, formData);
        router.refresh();
      }
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Не удалось сохранить");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!task) {
      return;
    }

    if (!confirm(`Удалить задание «${task.title}»?`)) {
      return;
    }

    await deleteTask(locale, task.id);
    onDeleted();
  }

  return (
    <div className="rounded-[2rem] border border-[var(--card-border)] bg-white p-4 shadow-[var(--shadow-card)] sm:p-6">
      <h2 className="font-display text-2xl text-[var(--foreground-strong)]">
        {mode === "create" ? "Новое задание" : "Конструктор задания"}
      </h2>

      <form onSubmit={handleSubmit} className="mt-5 grid gap-4">
        <label className="block text-sm font-semibold text-[var(--foreground-strong)]">
          Тема
          <select
            name="topicId"
            defaultValue={defaultTopicId}
            required
            className="touch-target mt-2 w-full rounded-2xl border-2 border-[var(--card-border)] px-4 py-3 text-base font-normal outline-none focus:border-[var(--accent)]"
          >
            {topics.map((topic) => (
              <option key={topic.id} value={topic.id}>
                {topic.title}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm font-semibold text-[var(--foreground-strong)]">
          Название
          <input
            name="title"
            required
            defaultValue={task?.title ?? ""}
            placeholder="№6 Степени"
            className="touch-target mt-2 w-full rounded-2xl border-2 border-[var(--card-border)] px-4 text-base font-normal outline-none focus:border-[var(--accent)]"
          />
        </label>

        <label className="block text-sm font-semibold text-[var(--foreground-strong)]">
          Описание задания
          <textarea
            name="description"
            rows={4}
            defaultValue={task?.description ?? ""}
            placeholder="Найдите значение выражения на рисунке."
            className="mt-2 w-full rounded-2xl border-2 border-[var(--card-border)] px-4 py-3 text-base font-normal outline-none focus:border-[var(--accent)]"
          />
        </label>

        <label className="block text-sm font-semibold text-[var(--foreground-strong)]">
          Тип ответа
          <select
            value={answerType}
            onChange={(event) => setAnswerType(event.target.value as TaskAnswerType)}
            className="touch-target mt-2 w-full rounded-2xl border-2 border-[var(--card-border)] px-4 py-3 text-base font-normal outline-none focus:border-[var(--accent)]"
          >
            {answerTypes.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>

        {answerType === "TEXT" ? (
          <>
            <label className="block text-sm font-semibold text-[var(--foreground-strong)]">
              Основной правильный ответ
              <input
                name="correctAnswer"
                required
                defaultValue={task?.correctAnswer ?? ""}
                placeholder="125"
                className="touch-target mt-2 w-full rounded-2xl border-2 border-[var(--card-border)] px-4 text-base font-normal outline-none focus:border-[var(--accent)]"
              />
            </label>

            <div>
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-[var(--foreground-strong)]">
                  Альтернативные правильные ответы
                </p>
                <button
                  type="button"
                  onClick={() =>
                    setAlternatives((items) => [...items, { answerText: "", explanation: "" }])
                  }
                  className="text-sm font-semibold text-[var(--accent)] hover:underline"
                >
                  + Добавить
                </button>
              </div>
              <div className="mt-2 space-y-2">
                {alternatives.map((item, index) => (
                  <div key={index} className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
                    <input
                      value={item.answerText}
                      onChange={(event) =>
                        setAlternatives((items) =>
                          items.map((alt, altIndex) =>
                            altIndex === index
                              ? { ...alt, answerText: event.target.value }
                              : alt,
                          ),
                        )
                      }
                      placeholder="Альтернативный ответ"
                      className="touch-target rounded-2xl border-2 border-[var(--card-border)] px-4 py-2 text-sm outline-none focus:border-[var(--accent)]"
                    />
                    <input
                      value={item.explanation}
                      onChange={(event) =>
                        setAlternatives((items) =>
                          items.map((alt, altIndex) =>
                            altIndex === index
                              ? { ...alt, explanation: event.target.value }
                              : alt,
                          ),
                        )
                      }
                      placeholder="Пояснение (необяз.)"
                      className="touch-target rounded-2xl border-2 border-[var(--card-border)] px-4 py-2 text-sm outline-none focus:border-[var(--accent)]"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setAlternatives((items) => items.filter((_, altIndex) => altIndex !== index))
                      }
                      className="rounded-full px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      Удалить
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm text-[var(--foreground-strong)]">
              <input
                type="checkbox"
                name="supportsMultipleAnswers"
                defaultChecked={task?.supportsMultipleAnswers ?? false}
                className="h-4 w-4 rounded border-[var(--card-border)]"
              />
              Несколько правильных ответов одновременно
            </label>
          </>
        ) : null}

        {answerType === "CHOICE" ? (
          <div>
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-[var(--foreground-strong)]">
                Варианты ответа
              </p>
              <button
                type="button"
                onClick={() =>
                  setChoiceOptions((items) => [...items, { text: "", isCorrect: false }])
                }
                className="text-sm font-semibold text-[var(--accent)] hover:underline"
              >
                + Вариант
              </button>
            </div>
            <div className="mt-2 space-y-2">
              {choiceOptions.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={item.isCorrect}
                    onChange={(event) =>
                      setChoiceOptions((items) =>
                        items.map((option, optionIndex) =>
                          optionIndex === index
                            ? { ...option, isCorrect: event.target.checked }
                            : option,
                        ),
                      )
                    }
                    className="h-4 w-4"
                  />
                  <input
                    value={item.text}
                    onChange={(event) =>
                      setChoiceOptions((items) =>
                        items.map((option, optionIndex) =>
                          optionIndex === index
                            ? { ...option, text: event.target.value }
                            : option,
                        ),
                      )
                    }
                    placeholder={`Вариант ${index + 1}`}
                    className="touch-target min-w-0 flex-1 rounded-2xl border-2 border-[var(--card-border)] px-4 py-2 text-sm outline-none focus:border-[var(--accent)]"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setChoiceOptions((items) =>
                        items.filter((_, optionIndex) => optionIndex !== index),
                      )
                    }
                    className="rounded-full px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {answerType === "IMAGE" ? (
          <p className="rounded-2xl bg-[var(--background-soft)] px-4 py-3 text-sm text-[var(--muted)]">
            Ученик отправит фото в качестве ответа. Автопроверка будет добавлена на следующем
            этапе.
          </p>
        ) : null}

        <label className="block text-sm font-semibold text-[var(--foreground-strong)]">
          Подсказка (необязательно)
          <textarea
            name="hint"
            rows={3}
            defaultValue={task?.hint ?? ""}
            placeholder="Воспользуйтесь свойствами степеней..."
            className="mt-2 w-full rounded-2xl border-2 border-[var(--card-border)] px-4 py-3 text-base font-normal outline-none focus:border-[var(--accent)]"
          />
        </label>

        <div>
          <p className="text-sm font-semibold text-[var(--foreground-strong)]">
            Изображение задания
          </p>
          {imageUrl && !removeImage ? (
            <div className="mt-2 overflow-hidden rounded-2xl border border-[var(--card-border)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imageUrl} alt="Изображение задания" className="max-h-64 w-full object-contain" />
            </div>
          ) : null}
          <div className="mt-2 flex flex-wrap gap-3">
            <label className="touch-target cursor-pointer rounded-full border-2 border-[var(--card-border)] px-4 py-2 text-sm font-semibold text-[var(--foreground-strong)] hover:border-[var(--accent)]">
              {uploading ? "Загрузка…" : "Загрузить изображение"}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) {
                    void handleImageUpload(file);
                  }
                }}
              />
            </label>
            {imageUrl && !removeImage ? (
              <button
                type="button"
                onClick={() => {
                  setRemoveImage(true);
                  setImageUrl("");
                }}
                className="touch-target rounded-full px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
              >
                Убрать изображение
              </button>
            ) : null}
          </div>
        </div>

        {error ? (
          <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
        ) : null}

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            type="submit"
            disabled={saving || uploading}
            className="touch-target rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white hover:bg-[var(--accent-hover)] disabled:opacity-60"
          >
            {saving ? "Сохраняем…" : mode === "create" ? "Создать задание" : "Сохранить"}
          </button>
          {mode === "edit" && task ? (
            <button
              type="button"
              onClick={() => void handleDelete()}
              className="touch-target rounded-full border-2 border-red-200 px-5 py-3 text-sm font-semibold text-red-600 hover:bg-red-50"
            >
              Удалить задание
            </button>
          ) : null}
        </div>
      </form>
    </div>
  );
}
