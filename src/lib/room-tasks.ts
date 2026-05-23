import { prisma } from "@/lib/prisma";
import type { TaskAnswerType } from "@prisma/client";

export type StudentRoomTask = {
  id: string;
  title: string;
  description: string | null;
  answerType: TaskAnswerType;
  hint: string | null;
  imageUrl: string | null;
  sortOrder: number;
  supportsMultipleAnswers: boolean;
  choiceSelectionMode: "single" | "multiple";
  choiceOptions: {
    id: string;
    text: string;
    sortOrder: number;
  }[];
};

export type StudentRoomTaskWithProgress = StudentRoomTask & {
  progress: {
    status: string;
    errorCount: number;
    hintUsedAt: Date | null;
  } | null;
};

function toStudentTask(task: {
  id: string;
  title: string;
  description: string | null;
  answerType: TaskAnswerType;
  hint: string | null;
  imageUrl: string | null;
  sortOrder: number;
  supportsMultipleAnswers: boolean;
  choiceOptions: { id: string; text: string; sortOrder: number; isCorrect: boolean }[];
}): StudentRoomTask {
  const correctCount = task.choiceOptions.filter((option) => option.isCorrect).length;

  return {
    id: task.id,
    title: task.title,
    description: task.description,
    answerType: task.answerType,
    hint: task.hint,
    imageUrl: task.imageUrl,
    sortOrder: task.sortOrder,
    supportsMultipleAnswers: task.supportsMultipleAnswers,
    choiceSelectionMode: correctCount > 1 ? "multiple" : "single",
    choiceOptions: task.choiceOptions.map((option) => ({
      id: option.id,
      text: option.text,
      sortOrder: option.sortOrder,
    })),
  };
}

export async function getRoomTasksForTopic(roomTopicId: string): Promise<StudentRoomTask[]> {
  const tasks = await prisma.roomTask.findMany({
    where: { roomTopicId },
    orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
    select: {
      id: true,
      title: true,
      description: true,
      answerType: true,
      hint: true,
      imageUrl: true,
      sortOrder: true,
      supportsMultipleAnswers: true,
      choiceOptions: {
        orderBy: { sortOrder: "asc" },
        select: { id: true, text: true, sortOrder: true, isCorrect: true },
      },
    },
  });

  return tasks.map(toStudentTask);
}

export async function getRoomTaskForStudent(
  roomTaskId: string,
  studentId: string,
): Promise<StudentRoomTaskWithProgress | null> {
  const task = await prisma.roomTask.findUnique({
    where: { id: roomTaskId },
    select: {
      id: true,
      title: true,
      description: true,
      answerType: true,
      hint: true,
      imageUrl: true,
      sortOrder: true,
      supportsMultipleAnswers: true,
      choiceOptions: {
        orderBy: { sortOrder: "asc" },
        select: { id: true, text: true, sortOrder: true, isCorrect: true },
      },
    },
  });

  if (!task) {
    return null;
  }

  const progress = await prisma.studentTaskProgress.findUnique({
    where: {
      studentId_roomTaskId: { studentId, roomTaskId },
    },
    select: {
      status: true,
      errorCount: true,
      hintUsedAt: true,
    },
  });

  return {
    ...toStudentTask(task),
    progress,
  };
}

export async function getGradingTask(roomTaskId: string) {
  return prisma.roomTask.findUnique({
    where: { id: roomTaskId },
    select: {
      id: true,
      answerType: true,
      correctAnswer: true,
      supportsMultipleAnswers: true,
      alternativeAnswers: { select: { answerText: true } },
      choiceOptions: { select: { id: true, isCorrect: true } },
    },
  });
}

export async function getRoomTopicWithTasks(roomTopicId: string) {
  return prisma.roomTopic.findUnique({
    where: { id: roomTopicId },
    include: {
      tasks: {
        orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
        select: {
          id: true,
          title: true,
          sortOrder: true,
          answerType: true,
        },
      },
      room: { select: { id: true, title: true, ownerId: true } },
    },
  });
}
