import type { TaskAnswerType } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type TaskWithDetails = Awaited<ReturnType<typeof getTutorTaskById>>;

export async function getTutorTopics(tutorId: string) {
  return prisma.taskTopic.findMany({
    where: { tutorId },
    orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
    include: {
      _count: { select: { tasks: true } },
    },
  });
}

export async function getTutorTasksForTopic(tutorId: string, topicId: string) {
  return prisma.task.findMany({
    where: { tutorId, topicId },
    orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
    select: {
      id: true,
      title: true,
      answerType: true,
      sortOrder: true,
      isActive: true,
      imageUrl: true,
    },
  });
}

export async function getTutorTaskById(tutorId: string, taskId: string) {
  return prisma.task.findFirst({
    where: { id: taskId, tutorId },
    include: {
      alternativeAnswers: { orderBy: { createdAt: "asc" } },
      choiceOptions: { orderBy: { sortOrder: "asc" } },
      topic: { select: { id: true, title: true } },
    },
  });
}

export async function assertTopicOwner(tutorId: string, topicId: string) {
  const topic = await prisma.taskTopic.findFirst({
    where: { id: topicId, tutorId },
  });

  if (!topic) {
    throw new Error("Тема не найдена");
  }

  return topic;
}

export function assertTopicNotPublished(topic: { isPublished: boolean }) {
  if (topic.isPublished) {
    throw new Error("Снимите тему с маркетплейса, чтобы редактировать или удалить");
  }
}

export async function assertTaskOwner(tutorId: string, taskId: string) {
  const task = await prisma.task.findFirst({
    where: { id: taskId, tutorId },
  });

  if (!task) {
    throw new Error("Задание не найдено");
  }

  return task;
}

export function mapLegacyAnswerType(value: string): TaskAnswerType {
  switch (value.toLowerCase()) {
    case "choice":
      return "CHOICE";
    case "image":
      return "IMAGE";
    default:
      return "TEXT";
  }
}

export type TaskFormAlternative = {
  answerText: string;
  explanation?: string;
};

export type TaskFormChoiceOption = {
  text: string;
  isCorrect: boolean;
};

export type TaskFormInput = {
  topicId: string;
  title: string;
  description?: string;
  answerType: TaskAnswerType;
  correctAnswer?: string;
  hint?: string;
  imageUrl?: string;
  supportsMultipleAnswers?: boolean;
  alternatives?: TaskFormAlternative[];
  choiceOptions?: TaskFormChoiceOption[];
};

export async function syncTaskRelations(
  taskId: string,
  input: Pick<TaskFormInput, "alternatives" | "choiceOptions" | "answerType">,
) {
  await prisma.taskAlternativeAnswer.deleteMany({ where: { taskId } });
  await prisma.taskChoiceOption.deleteMany({ where: { taskId } });

  if (input.answerType === "TEXT" && input.alternatives?.length) {
    await prisma.taskAlternativeAnswer.createMany({
      data: input.alternatives
        .filter((item) => item.answerText.trim())
        .map((item) => ({
          taskId,
          answerText: item.answerText.trim(),
          explanation: item.explanation?.trim() || null,
        })),
    });
  }

  if (input.answerType === "CHOICE" && input.choiceOptions?.length) {
    await prisma.taskChoiceOption.createMany({
      data: input.choiceOptions
        .filter((item) => item.text.trim())
        .map((item, index) => ({
          taskId,
          text: item.text.trim(),
          isCorrect: item.isCorrect,
          sortOrder: index,
        })),
    });
  }
}

export async function getNextTaskSortOrder(topicId: string) {
  const last = await prisma.task.findFirst({
    where: { topicId },
    orderBy: { sortOrder: "desc" },
    select: { sortOrder: true },
  });

  return (last?.sortOrder ?? 0) + 1;
}
