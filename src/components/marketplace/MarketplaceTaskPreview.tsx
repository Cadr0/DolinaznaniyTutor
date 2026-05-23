"use client";

import type { TaskAnswerType } from "@prisma/client";
import { answerTypeFullLabel } from "@/lib/task-labels";

export type MarketplaceTaskDetail = {
  id: string;
  title: string;
  description: string | null;
  answerType: TaskAnswerType;
  correctAnswer: string | null;
  hint: string | null;
  imageUrl: string | null;
  supportsMultipleAnswers: boolean;
  alternativeAnswers: {
    id: string;
    answerText: string;
    explanation: string | null;
  }[];
  choiceOptions: {
    id: string;
    text: string;
    isCorrect: boolean;
    sortOrder: number;
  }[];
};

function formatTaskText(text: string): string {
  return text.replace(/\\r\\n/g, "\n").replace(/\\n/g, "\n").replace(/\r\n/g, "\n");
}

type MarketplaceTaskPreviewProps = {
  task: MarketplaceTaskDetail;
};

export function MarketplaceTaskPreview({ task }: MarketplaceTaskPreviewProps) {
  return (
    <div className="space-y-4">
      {task.description ? (
        <p className="whitespace-pre-line text-sm leading-relaxed text-[var(--foreground-strong)]">
          {formatTaskText(task.description)}
        </p>
      ) : null}

      {task.imageUrl ? (
        <div className="overflow-hidden rounded-2xl border border-[var(--card-border)] bg-[var(--background)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={task.imageUrl}
            alt="Изображение к заданию"
            className="max-h-[min(55vh,520px)] w-full object-contain"
          />
        </div>
      ) : null}

      <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--background)] p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
          Тип ответа
        </p>
        <p className="mt-1 text-sm font-semibold text-[var(--foreground-strong)]">
          {answerTypeFullLabel[task.answerType]}
        </p>

        {task.answerType === "TEXT" && task.correctAnswer ? (
          <div className="mt-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
              Основной ответ
            </p>
            <p className="mt-1 whitespace-pre-line text-sm text-[var(--foreground-strong)]">
              {formatTaskText(task.correctAnswer)}
            </p>
          </div>
        ) : null}

        {task.answerType === "TEXT" && task.alternativeAnswers.length > 0 ? (
          <div className="mt-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
              Альтернативные ответы
              {task.supportsMultipleAnswers ? " (несколько верных)" : null}
            </p>
            <ul className="mt-2 space-y-2">
              {task.alternativeAnswers.map((alt) => (
                <li
                  key={alt.id}
                  className="rounded-xl border border-[var(--card-border)] bg-white px-3 py-2 text-sm"
                >
                  <p className="font-semibold text-[var(--foreground-strong)]">
                    {formatTaskText(alt.answerText)}
                  </p>
                  {alt.explanation ? (
                    <p className="mt-1 text-xs text-[var(--muted)]">
                      {formatTaskText(alt.explanation)}
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {task.answerType === "CHOICE" && task.choiceOptions.length > 0 ? (
          <div className="mt-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
              Варианты ответа
            </p>
            <ul className="mt-2 space-y-2">
              {task.choiceOptions.map((option) => (
                <li
                  key={option.id}
                  className={`rounded-xl border px-3 py-2 text-sm ${
                    option.isCorrect
                      ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                      : "border-[var(--card-border)] bg-white"
                  }`}
                >
                  <span className="text-[var(--foreground-strong)]">
                    {formatTaskText(option.text)}
                  </span>
                  {option.isCorrect ? (
                    <span className="ml-2 text-xs font-semibold text-[var(--accent)]">
                      ✓ верный
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {task.answerType === "IMAGE" ? (
          <p className="mt-4 text-sm text-[var(--muted)]">
            Ученик загружает фото в качестве ответа.
          </p>
        ) : null}
      </div>

      {task.hint ? (
        <div className="rounded-2xl border border-dashed border-[var(--card-border)] bg-[var(--background-soft)] p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
            Подсказка
          </p>
          <p className="mt-1 whitespace-pre-line text-sm text-[var(--foreground-strong)]">
            {formatTaskText(task.hint)}
          </p>
        </div>
      ) : null}
    </div>
  );
}
