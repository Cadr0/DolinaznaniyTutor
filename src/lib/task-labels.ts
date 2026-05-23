import type { TaskAnswerType } from "@prisma/client";

export const answerTypeShortLabel: Record<TaskAnswerType, string> = {
  TEXT: "Текст",
  CHOICE: "Выбор",
  IMAGE: "Фото",
};

export const answerTypeFullLabel: Record<TaskAnswerType, string> = {
  TEXT: "Текстовый ответ",
  CHOICE: "Выбор варианта",
  IMAGE: "Ответ фото",
};

export const answerTypeOptions: { value: TaskAnswerType; label: string }[] = [
  { value: "TEXT", label: answerTypeShortLabel.TEXT },
  { value: "CHOICE", label: answerTypeShortLabel.CHOICE },
  { value: "IMAGE", label: answerTypeShortLabel.IMAGE },
];
