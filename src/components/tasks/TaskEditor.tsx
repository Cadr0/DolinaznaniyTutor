"use client";

import { useMemo, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import type { TaskAnswerType } from "@prisma/client";
import {
  createTask,
  deleteTask,
  updateTask,
} from "@/app/[locale]/(app)/dashboard/materials/actions";
import {
  MarketplaceTaskPreview,
  type MarketplaceTaskDetail,
} from "@/components/marketplace/MarketplaceTaskPreview";
import { RoomDialog } from "@/components/rooms/RoomDialog";
import { TaskImageDropzone } from "@/components/tasks/TaskImageDropzone";
import type { TaskWithDetails } from "@/lib/tasks";
import { answerTypeOptions } from "@/lib/task-labels";
import { parseUploadResponse, uploadErrorMessage } from "@/lib/upload-client";

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
  readOnly?: boolean;
  onCreated: (taskId: string) => void;
  onDeleted: () => void;
};

type EditorTab = "edit" | "preview";

export function TaskEditor({
  locale,
  topics,
  selectedTopicId,
  task,
  mode,
  readOnly = false,
  onCreated,
  onDeleted,
}: TaskEditorProps) {
  const [tab, setTab] = useState<EditorTab>("edit");
  const [answerType, setAnswerType] = useState<TaskAnswerType>(task?.answerType ?? "TEXT");
  const [title, setTitle] = useState(task?.title ?? "");
  const [description, setDescription] = useState(task?.description ?? "");
  const [correctAnswer, setCorrectAnswer] = useState(task?.correctAnswer ?? "");
  const [hint, setHint] = useState(task?.hint ?? "");
  const [supportsMultipleAnswers, setSupportsMultipleAnswers] = useState(
    task?.supportsMultipleAnswers ?? false,
  );
  const [alternatives, setAlternatives] = useState(
    task?.alternativeAnswers.map((item) => ({
      answerText: item.answerText,
      explanation: item.explanation ?? "",
    })) ?? [],
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
  const [showTopicPicker, setShowTopicPicker] = useState(mode === "create");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const router = useRouter();

  const defaultTopicId = useMemo(
    () => task?.topicId ?? selectedTopicId ?? topics[0]?.id ?? "",
    [task?.topicId, selectedTopicId, topics],
  );
  const [topicId, setTopicId] = useState(defaultTopicId);

  const previewTask = useMemo((): MarketplaceTaskDetail => {
    return {
      id: task?.id ?? "preview",
      title: title || "Без названия",
      description: description || null,
      answerType,
      correctAnswer: correctAnswer || null,
      hint: hint || null,
      imageUrl: removeImage ? null : imageUrl || null,
      supportsMultipleAnswers,
      alternativeAnswers: alternatives
        .filter((alt) => alt.answerText.trim())
        .map((alt, index) => ({
          id: `alt-${index}`,
          answerText: alt.answerText,
          explanation: alt.explanation || null,
        })),
      choiceOptions: choiceOptions
        .filter((opt) => opt.text.trim())
        .map((opt, index) => ({
          id: `opt-${index}`,
          text: opt.text,
          isCorrect: opt.isCorrect,
          sortOrder: index,
        })),
    };
  }, [
    task?.id,
    title,
    description,
    answerType,
    correctAnswer,
    hint,
    imageUrl,
    removeImage,
    supportsMultipleAnswers,
    alternatives,
    choiceOptions,
  ]);

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
      const data = await parseUploadResponse(response);

      if (!response.ok || !data.url) {
        throw new Error(
          uploadErrorMessage(data.error, {
            tooLarge: "Файл слишком большой (максимум 5 МБ)",
            unauthorized: "Не удалось загрузить изображение",
            failed: "Не удалось загрузить изображение",
          }),
        );
      }

      setImageUrl(data.url);
      setRemoveImage(false);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Ошибка загрузки");
      throw uploadError;
    } finally {
      setUploading(false);
    }
  }

  function validateForm(): string | null {
    if (!title.trim()) {
      return "Укажите название задания";
    }

    if (answerType === "TEXT" && !correctAnswer.trim()) {
      return "Укажите основной правильный ответ";
    }

    if (answerType === "CHOICE") {
      const filled = choiceOptions.filter((opt) => opt.text.trim());

      if (filled.length < 2) {
        return "Добавьте минимум 2 варианта ответа";
      }

      if (!filled.some((opt) => opt.isCorrect)) {
        return "Отметьте хотя бы один правильный вариант";
      }
    }

    return null;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (readOnly) {
      return;
    }

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      setTab("edit");
      return;
    }

    setSaving(true);
    setError("");

    const formData = new FormData(event.currentTarget);
    formData.set("title", title);
    formData.set("description", description);
    formData.set("topicId", topicId);
    formData.set("answerType", answerType);
    formData.set("correctAnswer", correctAnswer);
    formData.set("hint", hint);
    formData.set("imageUrl", imageUrl);
    formData.set("alternativesJson", JSON.stringify(alternatives));
    formData.set("choiceOptionsJson", JSON.stringify(choiceOptions));

    if (supportsMultipleAnswers) {
      formData.set("supportsMultipleAnswers", "on");
    }

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

    await deleteTask(locale, task.id);
    setDeleteOpen(false);
    onDeleted();
  }

  return (
    <div className="rounded-[2rem] border border-[var(--card-border)] bg-white shadow-[var(--shadow-card)]">
      {readOnly ? (
        <div className="border-b border-[var(--card-border)] px-4 py-4 sm:px-6">
          <p className="rounded-xl bg-[var(--accent-soft)] px-4 py-3 text-sm text-[var(--foreground-strong)]">
            Тема опубликована в маркетплейсе. Снимите её с каталога, чтобы редактировать задания.
          </p>
        </div>
      ) : null}
      <div className="border-b border-[var(--card-border)] px-4 py-4 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--accent)]">
            {mode === "create" ? "Новое задание" : "Конструктор"}
          </p>
          <div className="flex rounded-full border border-[var(--card-border)] p-0.5">
            <button
              type="button"
              onClick={() => setTab("edit")}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold ${
                tab === "edit"
                  ? "bg-[var(--accent)] text-white"
                  : "text-[var(--muted)] hover:text-[var(--foreground-strong)]"
              }`}
            >
              Редактор
            </button>
            <button
              type="button"
              onClick={() => setTab("preview")}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold ${
                tab === "preview"
                  ? "bg-[var(--accent)] text-white"
                  : "text-[var(--muted)] hover:text-[var(--foreground-strong)]"
              }`}
            >
              Предпросмотр
            </button>
          </div>
        </div>

        {tab === "edit" ? (
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
            placeholder="Название задания"
            className="mt-3 w-full border-0 bg-transparent font-display text-2xl text-[var(--foreground-strong)] outline-none placeholder:text-[var(--muted)]"
          />
        ) : (
          <h2 className="mt-3 font-display text-2xl text-[var(--foreground-strong)]">
            {title || "Без названия"}
          </h2>
        )}
      </div>

      {tab === "preview" ? (
        <div className="px-4 py-5 sm:px-6">
          <MarketplaceTaskPreview task={previewTask} />
        </div>
      ) : (
        <fieldset disabled={readOnly}>
        <form id="task-editor-form" onSubmit={handleSubmit} className="px-4 py-5 sm:px-6">
          <input type="hidden" name="title" value={title} />
          <input type="hidden" name="description" value={description} />
          <input type="hidden" name="topicId" value={topicId} />
          <input type="hidden" name="correctAnswer" value={correctAnswer} />
          <input type="hidden" name="hint" value={hint} />

          {showTopicPicker && topics.length > 1 ? (
            <div className="mb-5">
              <label className="block text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                Тема
                <select
                  value={topicId}
                  onChange={(event) => setTopicId(event.target.value)}
                  className="touch-target mt-1.5 w-full rounded-2xl border-2 border-[var(--card-border)] px-4 py-2.5 text-sm outline-none focus:border-[var(--accent)]"
                >
                  {topics.map((topic) => (
                    <option key={topic.id} value={topic.id}>
                      {topic.title}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          ) : mode === "edit" ? (
            <div className="mb-5 flex items-center justify-between gap-2 rounded-xl bg-[var(--background)] px-3 py-2">
              <p className="truncate text-sm text-[var(--muted)]">
                {topics.find((t) => t.id === topicId)?.title ?? "Тема"}
              </p>
              {topics.length > 1 ? (
                <button
                  type="button"
                  onClick={() => setShowTopicPicker((value) => !value)}
                  className="shrink-0 text-xs font-semibold text-[var(--accent)] hover:underline"
                >
                  {showTopicPicker ? "Скрыть" : "Перенести"}
                </button>
              ) : null}
            </div>
          ) : null}

          <section className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-[var(--foreground-strong)]">
                Условие
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  rows={4}
                  placeholder="Текст задания для ученика"
                  className="mt-2 w-full rounded-2xl border-2 border-[var(--card-border)] px-4 py-3 text-base outline-none focus:border-[var(--accent)]"
                />
              </label>
            </div>

            <div>
              <p className="mb-2 text-sm font-semibold text-[var(--foreground-strong)]">
                Изображение
              </p>
              <TaskImageDropzone
                imageUrl={removeImage ? null : imageUrl || null}
                uploading={uploading}
                error={error && error.includes("загруз") ? error : undefined}
                onUpload={handleImageUpload}
                onRemove={() => {
                  setRemoveImage(true);
                  setImageUrl("");
                }}
              />
            </div>
          </section>

          <section className="mt-6 space-y-4">
            <div>
              <p className="text-sm font-semibold text-[var(--foreground-strong)]">Проверка ответа</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {answerTypeOptions.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setAnswerType(item.value)}
                    className={`rounded-full px-4 py-2 text-sm font-semibold ${
                      answerType === item.value
                        ? "bg-[var(--accent)] text-white"
                        : "border border-[var(--card-border)] text-[var(--muted)] hover:border-[var(--accent)]"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {answerType === "TEXT" ? (
              <>
                <label className="block text-sm font-semibold text-[var(--foreground-strong)]">
                  Основной ответ
                  <input
                    value={correctAnswer}
                    onChange={(event) => setCorrectAnswer(event.target.value)}
                    placeholder="125"
                    className="touch-target mt-2 w-full rounded-2xl border-2 border-[var(--card-border)] px-4 py-3 text-base outline-none focus:border-[var(--accent)]"
                  />
                </label>

                <div>
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-[var(--foreground-strong)]">
                      Альтернативные ответы
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
                  {alternatives.length > 0 ? (
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
                            placeholder="Пояснение"
                            className="touch-target rounded-2xl border-2 border-[var(--card-border)] px-4 py-2 text-sm outline-none focus:border-[var(--accent)]"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setAlternatives((items) =>
                                items.filter((_, altIndex) => altIndex !== index),
                              )
                            }
                            className="rounded-full px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>

                <label className="flex items-center gap-2 text-sm text-[var(--foreground-strong)]">
                  <input
                    type="checkbox"
                    checked={supportsMultipleAnswers}
                    onChange={(event) => setSupportsMultipleAnswers(event.target.checked)}
                    className="h-4 w-4 rounded border-[var(--card-border)]"
                  />
                  Несколько правильных ответов
                </label>
              </>
            ) : null}

            {answerType === "CHOICE" ? (
              <div>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-[var(--foreground-strong)]">
                    Варианты
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
                        title="Правильный вариант"
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
                Ученик отправит фото в качестве ответа.
              </p>
            ) : null}
          </section>

          <details className="mt-6 rounded-2xl border border-[var(--card-border)] bg-[var(--background)] px-4 py-3">
            <summary className="cursor-pointer text-sm font-semibold text-[var(--foreground-strong)]">
              Дополнительно — подсказка
            </summary>
            <textarea
              value={hint}
              onChange={(event) => setHint(event.target.value)}
              rows={3}
              placeholder="Подсказка для ученика (необязательно)"
              className="mt-3 w-full rounded-2xl border-2 border-[var(--card-border)] bg-white px-4 py-3 text-sm outline-none focus:border-[var(--accent)]"
            />
          </details>

          {error && !error.includes("загруз") ? (
            <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
          ) : null}
        </form>
        </fieldset>
      )}

      <div className="sticky bottom-0 border-t border-[var(--card-border)] bg-white/95 px-4 py-3 backdrop-blur sm:px-6 sm:py-4">
        <div className="flex flex-wrap gap-3">
          {tab === "edit" && !readOnly ? (
            <button
              type="submit"
              form="task-editor-form"
              disabled={saving || uploading}
              className="touch-target rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white hover:bg-[var(--accent-hover)] disabled:opacity-60"
            >
              {saving ? "Сохраняем…" : mode === "create" ? "Создать" : "Сохранить"}
            </button>
          ) : null}
          {mode === "edit" && task && !readOnly ? (
            <button
              type="button"
              onClick={() => setDeleteOpen(true)}
              className="touch-target rounded-full border-2 border-red-200 px-5 py-3 text-sm font-semibold text-red-600 hover:bg-red-50"
            >
              Удалить
            </button>
          ) : null}
        </div>
      </div>

      <RoomDialog open={deleteOpen} title="Удалить задание?" onClose={() => setDeleteOpen(false)}>
        <div className="space-y-4">
          <p className="text-sm text-[var(--muted)]">
            Задание «{task?.title ?? title}» будет удалено без возможности восстановления.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => void handleDelete()}
              className="touch-target rounded-full bg-red-600 px-5 py-3 text-sm font-semibold text-white hover:bg-red-700"
            >
              Удалить
            </button>
            <button
              type="button"
              onClick={() => setDeleteOpen(false)}
              className="touch-target rounded-full border-2 border-[var(--card-border)] px-5 py-3 text-sm font-semibold"
            >
              Отмена
            </button>
          </div>
        </div>
      </RoomDialog>
    </div>
  );
}
