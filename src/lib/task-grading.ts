import type { TaskAnswerType } from "@prisma/client";

export type GradingTask = {
  answerType: TaskAnswerType;
  correctAnswer: string | null;
  supportsMultipleAnswers: boolean;
  alternativeAnswers: { answerText: string }[];
  choiceOptions: { id: string; isCorrect: boolean }[];
};

export type AnswerPayload = {
  answerText?: string;
  selectedOptionIds?: string[];
  imageUrl?: string;
};

export type GradeResult = {
  isCorrect: boolean | null;
  status: "CORRECT" | "INCORRECT" | "SUBMITTED";
};

export function normalizeTextAnswer(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/,/g, ".");
}

function acceptedTextAnswers(task: GradingTask): string[] {
  const answers = new Set<string>();

  if (task.correctAnswer) {
    answers.add(normalizeTextAnswer(task.correctAnswer));
  }

  for (const alt of task.alternativeAnswers) {
    if (alt.answerText.trim()) {
      answers.add(normalizeTextAnswer(alt.answerText));
    }
  }

  return [...answers];
}

function gradeTextAnswer(task: GradingTask, answerText: string): GradeResult {
  const normalized = normalizeTextAnswer(answerText);
  const accepted = acceptedTextAnswers(task);

  if (accepted.length === 0) {
    return { isCorrect: false, status: "INCORRECT" };
  }

  if (task.supportsMultipleAnswers) {
    const parts = answerText
      .split(/[;\n]/)
      .map((part) => normalizeTextAnswer(part))
      .filter(Boolean);

    if (parts.length === 0) {
      return { isCorrect: false, status: "INCORRECT" };
    }

    const allValid = parts.every((part) => accepted.includes(part));
    return { isCorrect: allValid, status: allValid ? "CORRECT" : "INCORRECT" };
  }

  const isCorrect = accepted.includes(normalized);
  return { isCorrect, status: isCorrect ? "CORRECT" : "INCORRECT" };
}

function gradeChoiceAnswer(task: GradingTask, selectedOptionIds: string[]): GradeResult {
  const correctIds = new Set(
    task.choiceOptions.filter((option) => option.isCorrect).map((option) => option.id),
  );
  const selectedIds = new Set(selectedOptionIds);

  if (correctIds.size === 0) {
    return { isCorrect: false, status: "INCORRECT" };
  }

  const isCorrect =
    correctIds.size === selectedIds.size &&
    [...correctIds].every((id) => selectedIds.has(id));

  return { isCorrect, status: isCorrect ? "CORRECT" : "INCORRECT" };
}

export function gradeRoomTaskAnswer(task: GradingTask, payload: AnswerPayload): GradeResult {
  if (task.answerType === "IMAGE") {
    if (!payload.imageUrl?.trim()) {
      return { isCorrect: null, status: "INCORRECT" };
    }

    return { isCorrect: null, status: "SUBMITTED" };
  }

  if (task.answerType === "CHOICE") {
    return gradeChoiceAnswer(task, payload.selectedOptionIds ?? []);
  }

  return gradeTextAnswer(task, payload.answerText ?? "");
}
