"use server";

import { revalidatePath } from "next/cache";
import type { TaskProgressStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { localePath } from "@/lib/routes";
import { getGradingTask } from "@/lib/room-tasks";
import { requireSession } from "@/lib/session";
import {
  assignTopicToStudent,
  assertStudentOwnsTask,
  assertTutorRoomAccess,
  ensureTaskProgress,
  getAssignmentById,
  getNextTaskInAssignment,
  getStudentAssignments,
  getStudentProgressForTutor,
  getTaskAttemptsForTutor,
  getTaskAttemptContextForTutor,
  revokeStudentAssignment,
} from "@/lib/student-assignments";
import { gradeRoomTaskAnswer } from "@/lib/task-grading";

function homeworkPath(locale: string) {
  return localePath(locale, "/dashboard/homework");
}

function roomPath(locale: string, roomId: string) {
  return localePath(locale, `/dashboard/rooms/${roomId}`);
}

function revalidateHomework(locale: string, roomId?: string) {
  revalidatePath(homeworkPath(locale));
  if (roomId) {
    revalidatePath(roomPath(locale, roomId));
  }
}

async function requireTutor(locale: string) {
  const session = await requireSession(locale);
  if (session.user.role !== "TUTOR") {
    throw new Error("Только учитель может выполнять это действие");
  }
  return session;
}

async function requireStudent(locale: string) {
  const session = await requireSession(locale);
  if (session.user.role !== "STUDENT") {
    throw new Error("Только ученик может выполнять это действие");
  }
  return session;
}

export async function assignTopicToStudentAction(
  locale: string,
  roomId: string,
  studentId: string,
  roomTopicId: string,
  roomTaskIds?: string[],
) {
  const session = await requireTutor(locale);
  await assignTopicToStudent(
    session.user.id,
    roomId,
    studentId,
    roomTopicId,
    roomTaskIds,
  );
  revalidateHomework(locale, roomId);
  return { ok: true as const };
}

export async function revokeStudentAssignmentAction(
  locale: string,
  roomId: string,
  assignmentId: string,
) {
  const session = await requireTutor(locale);
  await revokeStudentAssignment(session.user.id, assignmentId);
  revalidateHomework(locale, roomId);
  return { ok: true as const };
}

export async function fetchStudentProgressAction(
  locale: string,
  roomId: string,
  studentId: string,
) {
  const session = await requireTutor(locale);
  return getStudentProgressForTutor(session.user.id, roomId, studentId);
}

export async function fetchTaskAttemptsAction(
  locale: string,
  roomId: string,
  studentId: string,
  roomTaskId: string,
) {
  const session = await requireTutor(locale);
  await assertTutorRoomAccess(session.user.id, roomId);
  return getTaskAttemptsForTutor(session.user.id, roomId, studentId, roomTaskId);
}

export async function fetchTaskAttemptContextAction(
  locale: string,
  roomId: string,
  roomTaskId: string,
) {
  const session = await requireTutor(locale);
  return getTaskAttemptContextForTutor(session.user.id, roomId, roomTaskId);
}

export async function fetchStudentHomeworkAction(locale: string) {
  const session = await requireStudent(locale);
  return getStudentAssignments(session.user.id);
}

export async function fetchAssignmentSessionAction(locale: string, assignmentId: string) {
  const session = await requireStudent(locale);
  const assignment = await getAssignmentById(assignmentId, session.user.id);
  if (!assignment) {
    throw new Error("Назначение не найдено");
  }
  const nextTask = await getNextTaskInAssignment(assignmentId, session.user.id);
  return { assignment, nextTask };
}

type SubmitPayload = {
  answerText?: string;
  selectedOptionIds?: string[];
  imageUrl?: string;
};

function mapGradeToStatus(status: "CORRECT" | "INCORRECT" | "SUBMITTED"): TaskProgressStatus {
  if (status === "CORRECT") {
    return "CORRECT";
  }
  if (status === "SUBMITTED") {
    return "SUBMITTED";
  }
  return "IN_PROGRESS";
}

export async function submitTaskAnswerAction(
  locale: string,
  assignmentId: string,
  roomTaskId: string,
  payload: SubmitPayload,
) {
  const session = await requireStudent(locale);
  const studentId = session.user.id;

  await assertStudentOwnsTask(studentId, roomTaskId);

  const assignment = await getAssignmentById(assignmentId, studentId);
  if (!assignment) {
    throw new Error("Назначение не найдено");
  }

  const gradingTask = await getGradingTask(roomTaskId);
  if (!gradingTask) {
    throw new Error("Задание не найдено");
  }

  const grade = gradeRoomTaskAnswer(gradingTask, payload);
  const progress = await ensureTaskProgress(studentId, roomTaskId);

  const usedHint = Boolean(progress.hintUsedAt);

  await prisma.studentTaskAttempt.create({
    data: {
      progressId: progress.id,
      answerText: payload.answerText ?? null,
      selectedOptionIds: payload.selectedOptionIds ?? [],
      imageUrl: payload.imageUrl ?? null,
      isCorrect: grade.isCorrect,
      usedHint,
    },
  });

  const isWrong = grade.status === "INCORRECT";
  const isDone = grade.status === "CORRECT" || grade.status === "SUBMITTED";

  await prisma.studentTaskProgress.update({
    where: { id: progress.id },
    data: {
      status: mapGradeToStatus(grade.status),
      errorCount: isWrong ? { increment: 1 } : undefined,
      completedAt: isDone ? new Date() : null,
    },
  });

  revalidateHomework(locale, assignment.roomId);

  const nextTask = isDone ? await getNextTaskInAssignment(assignmentId, studentId) : null;

  return {
    ok: true as const,
    isCorrect: grade.isCorrect,
    status: grade.status,
    nextTaskId: isDone ? (nextTask?.roomTaskId ?? null) : null,
    completed: isDone && !nextTask,
  };
}

export async function revealTaskHintAction(
  locale: string,
  assignmentId: string,
  roomTaskId: string,
) {
  const session = await requireStudent(locale);
  const studentId = session.user.id;

  await assertStudentOwnsTask(studentId, roomTaskId);

  const assignment = await getAssignmentById(assignmentId, studentId);
  if (!assignment) {
    throw new Error("Назначение не найдено");
  }

  const progress = await ensureTaskProgress(studentId, roomTaskId);

  if (!progress.hintUsedAt) {
    await prisma.studentTaskProgress.update({
      where: { id: progress.id },
      data: { hintUsedAt: new Date() },
    });
  }

  const task = await prisma.roomTask.findUnique({
    where: { id: roomTaskId },
    select: { hint: true },
  });

  revalidateHomework(locale, assignment.roomId);

  return { ok: true as const, hint: task?.hint ?? null };
}

export async function skipTaskAction(locale: string, assignmentId: string, roomTaskId: string) {
  const session = await requireStudent(locale);
  const studentId = session.user.id;

  await assertStudentOwnsTask(studentId, roomTaskId);

  const assignment = await getAssignmentById(assignmentId, studentId);
  if (!assignment) {
    throw new Error("Назначение не найдено");
  }

  const progress = await ensureTaskProgress(studentId, roomTaskId);

  await prisma.studentTaskProgress.update({
    where: { id: progress.id },
    data: {
      status: "SKIPPED",
      skippedAt: new Date(),
      completedAt: new Date(),
    },
  });

  await prisma.studentTaskAttempt.create({
    data: {
      progressId: progress.id,
      isCorrect: false,
      usedHint: Boolean(progress.hintUsedAt),
    },
  });

  revalidateHomework(locale, assignment.roomId);

  const nextTask = await getNextTaskInAssignment(assignmentId, studentId);

  return {
    ok: true as const,
    nextTaskId: nextTask?.roomTaskId ?? null,
    completed: !nextTask,
  };
}

export async function getRoomTopicsForAssignAction(locale: string, roomId: string) {
  const session = await requireTutor(locale);
  await assertTutorRoomAccess(session.user.id, roomId);

  return prisma.roomTopic.findMany({
    where: { roomId },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    include: {
      tasks: {
        orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
        select: { id: true, title: true, answerType: true, sortOrder: true },
      },
    },
  });
}
