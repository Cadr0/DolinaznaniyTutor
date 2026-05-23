"use client";

import { TagPicker } from "@/components/marketplace/TagPicker";

export type TopicFormData = {
  id: string;
  title: string;
  description: string | null;
  tags: string[];
  isPublished: boolean;
};

type TopicFormProps = {
  locale: string;
  topic?: TopicFormData;
  onDone: () => void;
  onSubmit: (locale: string, formData: FormData) => Promise<void>;
  onDelete?: () => void;
  labels?: {
    title: string;
    name: string;
    description: string;
    publish: string;
    save: string;
    create: string;
    delete: string;
  };
};

const defaultLabels = {
  title: "Название",
  name: "Название",
  description: "Описание (необязательно)",
  publish: "Опубликовать в маркетплейсе",
  save: "Сохранить",
  create: "Создать тему",
  delete: "Удалить тему",
};

export function TopicForm({
  locale,
  topic,
  onDone,
  onSubmit,
  onDelete,
  labels: labelOverrides,
}: TopicFormProps) {
  const labels = { ...defaultLabels, ...labelOverrides };

  return (
    <form
      action={async (formData) => {
        await onSubmit(locale, formData);
        onDone();
      }}
      className="grid gap-4"
    >
      <label className="block text-sm font-semibold text-[var(--foreground-strong)]">
        {labels.name}
        <input
          name="title"
          required
          defaultValue={topic?.title ?? ""}
          placeholder="Задание 8. Степени и корни"
          className="touch-target mt-2 w-full rounded-2xl border-2 border-[var(--card-border)] px-4 text-base font-normal outline-none focus:border-[var(--accent)]"
        />
      </label>
      <label className="block text-sm font-semibold text-[var(--foreground-strong)]">
        {labels.description}
        <textarea
          name="description"
          rows={3}
          defaultValue={topic?.description ?? ""}
          placeholder="Краткое описание темы"
          className="mt-2 w-full rounded-2xl border-2 border-[var(--card-border)] px-4 py-3 text-base font-normal outline-none focus:border-[var(--accent)]"
        />
      </label>
      <TagPicker defaultTags={topic?.tags ?? []} />
      <label className="flex items-center gap-2 text-sm font-semibold text-[var(--foreground-strong)]">
        <input
          type="checkbox"
          name="isPublished"
          defaultChecked={topic?.isPublished ?? false}
          className="h-4 w-4 rounded border-[var(--card-border)]"
        />
        {labels.publish}
      </label>
      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          className="touch-target rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white hover:bg-[var(--accent-hover)]"
        >
          {topic ? labels.save : labels.create}
        </button>
        {onDelete ? (
          <button
            type="button"
            onClick={onDelete}
            className="touch-target rounded-full border-2 border-red-200 px-5 py-3 text-sm font-semibold text-red-600 hover:bg-red-50"
          >
            {labels.delete}
          </button>
        ) : null}
      </div>
    </form>
  );
}
