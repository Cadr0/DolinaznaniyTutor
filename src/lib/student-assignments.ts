import type { TaskProgressStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type AssignmentTaskItem = {
  id: string;
  roomTaskId: string;
  sortOrder: number;
  title: string;
  answerType: string;
  progress: {
    status: TaskProgressStatus;
    errorCount: number;
    hintUsedAt: Date | null;
    completedAt: Date | null;
    skippedAt: Date | null;
  } | null;
};

export type StudentTopicAssignmentSummary = {
  id: string;
  roomId: string;
  roomTitle: string;
  roomTopicId: string;
  topicTitle: string;
  sortOrder: number;
  assignedAt: Date;
  totalTasks: number;
  completedTasks: number;
  errorTasks: number;
  hintsUsed: number;
  tasks: AssignmentTaskItem[];
};

export type StudentProgressOverview = {
  studentId: string;
  studentName: string;
  studentEmail: string;
  assignments: StudentTopicAssignmentSummary[];
  totals: {
    assignedTasks: number;
    completedTasks: number;
    errorTasks: number;
    hintsUsed: number;
  };
};

export type TaskAttemptRecord = {
  id: string;
  answerText: string | null;
  selectedOptionIds: string[];
  imageUrl: string | null;
  isCorrect: boolean | null;
  usedHint: boolean;
  createdAt: Date;
  optionLabels: string[];
};

const COMPLETED_STATUSES: TaskProgressStatus[] = ["CORRECT", "SKIPPED", "SUBMITTED"];

function isCompleted(status: TaskProgressStatus) {
  return COMPLETED_STATUSES.includes(status);
}

export async function assignTopicToStudent(
  tutorId: string,
  roomId: string,
  studentId: string,
  roomTopicId: string,
  roomTaskIds?: string[],
) {
  const room = await prisma.room.findFirst({
    where: { id: roomId, ownerId: tutorId },
  });

  if (!room) {
    throw new Error("Комната не найдена");
  }

  const membership = await prisma.roomMember.findUnique({
    where: { roomId_userId: { roomId, userId: studentId } },
  });

  if (!membership || membership.role !== "STUDENT") {
    throw new Error("Ученик не состоит в этой комнате");
  }

  const roomTopic = await prisma.roomTopic.findFirst({
    where: { id: roomTopicId, roomId },
    include: {
      tasks: { orderBy: [{ sortOrder: "asc" }, { title: "asc" }] },
    },
  });

  if (!roomTopic) {
    throw new Error("Тема не найдена в комнате");
  }

  const taskIds =
    roomTaskIds && roomTaskIds.length > 0
      ? roomTaskIds
      : roomTopic.tasks.map((task) => task.id);

  const validTaskIds = new Set(roomTopic.tasks.map((task) => task.id));
  for (const taskId of taskIds) {
    if (!validTaskIds.has(taskId)) {
      throw new Error("Задание не принадлежит выбранной теме");
    }
  }

  const lastAssignment = await prisma.studentTopicAssignment.findFirst({
    where: { studentId, roomId },
    orderBy: { sortOrder: "desc" },
    select: { sortOrder: true },
  });

  const orderedTasks = roomTopic.tasks
    .filter((task) => taskIds.includes(task.id))
    .sort((a, b) => a.sortOrder - b.sortOrder || a.title.localeCompare(b.title, "ru"));

  return prisma.$transaction(async (tx) => {
    const assignment = await tx.studentTopicAssignment.upsert({
      where: {
        studentId_roomTopicId: { studentId, roomTopicId },
      },
      create: {
        roomId,
        studentId,
        roomTopicId,
        tutorId,
        sortOrder: (lastAssignment?.sortOrder ?? 0) + 1,
      },
      update: {
        tutorId,
      },
    });

    await tx.studentTaskAssignment.deleteMany({
      where: { studentTopicAssignmentId: assignment.id },
    });

    await tx.studentTaskAssignment.createMany({
      data: orderedTasks.map((task, index) => ({
        studentTopicAssignmentId: assignment.id,
        roomTaskId: task.id,
        sortOrder: index + 1,
      })),
    });

    return assignment;
  });
}

export async function revokeStudentAssignment(tutorId: string, assignmentId: string) {
  const assignment = await prisma.studentTopicAssignment.findUnique({
    where: { id: assignmentId },
    include: { room: true },
  });

  if (!assignment || assignment.room.ownerId !== tutorId) {
    throw new Error("Назначение не найдено");
  }

  await prisma.studentTopicAssignment.delete({ where: { id: assignmentId } });
}

export async function getStudentAssignments(studentId: string) {
  const assignments = await prisma.studentTopicAssignment.findMany({
    where: { studentId },
    orderBy: [{ sortOrder: "asc" }, { assignedAt: "asc" }],
    include: {
      room: { select: { id: true, title: true } },
      roomTopic: { select: { id: true, title: true } },
      taskItems: {
        orderBy: { sortOrder: "asc" },
        include: {
          roomTask: {
            select: {
              id: true,
              title: true,
              answerType: true,
            },
          },
        },
      },
    },
  });

  const taskIds = assignments.flatMap((assignment) =>
    assignment.taskItems.map((item) => item.roomTaskId),
  );

  const progressRows =
    taskIds.length > 0
      ? await prisma.studentTaskProgress.findMany({
          where: { studentId, roomTaskId: { in: taskIds } },
        })
      : [];

  const progressByTaskId = new Map(progressRows.map((row) => [row.roomTaskId, row]));

  return assignments.map((assignment) => {
    const tasks: AssignmentTaskItem[] = assignment.taskItems.map((item) => {
      const progress = progressByTaskId.get(item.roomTaskId) ?? null;
      return {
        id: item.id,
        roomTaskId: item.roomTaskId,
        sortOrder: item.sortOrder,
        title: item.roomTask.title,
        answerType: item.roomTask.answerType,
        progress: progress
          ? {
              status: progress.status,
              errorCount: progress.errorCount,
              hintUsedAt: progress.hintUsedAt,
              completedAt: progress.completedAt,
              skippedAt: progress.skippedAt,
            }
          : null,
      };
    });

    const completedTasks = tasks.filter(
      (task) => task.progress && isCompleted(task.progress.status),
    ).length;
    const errorTasks = tasks.filter((task) => (task.progress?.errorCount ?? 0) > 0).length;
    const hintsUsed = tasks.filter((task) => task.progress?.hintUsedAt).length;

    return {
      id: assignment.id,
      roomId: assignment.roomId,
      roomTitle: assignment.room.title,
      roomTopicId: assignment.roomTopicId,
      topicTitle: assignment.roomTopic.title,
      sortOrder: assignment.sortOrder,
      assignedAt: assignment.assignedAt,
      totalTasks: tasks.length,
      completedTasks,
      errorTasks,
      hintsUsed,
      tasks,
    } satisfies StudentTopicAssignmentSummary;
  });
}

export async function getStudentProgressForTutor(
  tutorId: string,
  roomId: string,
  studentId: string,
): Promise<StudentProgressOverview | null> {
  const room = await prisma.room.findFirst({
    where: { id: roomId, ownerId: tutorId },
  });

  if (!room) {
    return null;
  }

  const member = await prisma.roomMember.findUnique({
    where: { roomId_userId: { roomId, userId: studentId } },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          profile: { select: { displayName: true } },
        },
      },
    },
  });

  if (!member) {
    return null;
  }

  const assignments = await getStudentAssignments(studentId);
  const roomAssignments = assignments.filter((assignment) => assignment.roomId === roomId);

  const totals = roomAssignments.reduce(
    (acc, assignment) => ({
      assignedTasks: acc.assignedTasks + assignment.totalTasks,
      completedTasks: acc.completedTasks + assignment.completedTasks,
      errorTasks: acc.errorTasks + assignment.errorTasks,
      hintsUsed: acc.hintsUsed + assignment.hintsUsed,
    }),
    { assignedTasks: 0, completedTasks: 0, errorTasks: 0, hintsUsed: 0 },
  );

  return {
    studentId: member.user.id,
    studentName: member.user.profile?.displayName ?? member.user.name,
    studentEmail: member.user.email,
    assignments: roomAssignments,
    totals,
  };
}

export async function getAssignmentById(assignmentId: string, studentId: string) {
  const assignment = await prisma.studentTopicAssignment.findFirst({
    where: { id: assignmentId, studentId },
    include: {
      room: { select: { id: true, title: true } },
      roomTopic: { select: { id: true, title: true } },
      taskItems: {
        orderBy: { sortOrder: "asc" },
        include: {
          roomTask: {
            select: { id: true, title: true, answerType: true },
          },
        },
      },
    },
  });

  if (!assignment) {
    return null;
  }

  const summaries = await getStudentAssignments(studentId);
  return summaries.find((item) => item.id === assignmentId) ?? null;
}

export async function getNextTaskInAssignment(assignmentId: string, studentId: string) {
  const summary = await getAssignmentById(assignmentId, studentId);
  if (!summary) {
    return null;
  }

  return (
    summary.tasks.find((task) => !task.progress || !isCompleted(task.progress.status)) ?? null
  );
}

export async function ensureTaskProgress(studentId: string, roomTaskId: string) {
  return prisma.studentTaskProgress.upsert({
    where: {
      studentId_roomTaskId: { studentId, roomTaskId },
    },
    create: {
      studentId,
      roomTaskId,
      status: "IN_PROGRESS",
    },
    update: {
      status: "IN_PROGRESS",
    },
  });
}

export async function getTaskAttemptsForTutor(
  tutorId: string,
  roomId: string,
  studentId: string,
  roomTaskId: string,
): Promise<TaskAttemptRecord[]> {
  const room = await prisma.room.findFirst({
    where: { id: roomId, ownerId: tutorId },
  });

  if (!room) {
    throw new Error("Нет доступа");
  }

  const progress = await prisma.studentTaskProgress.findUnique({
    where: { studentId_roomTaskId: { studentId, roomTaskId } },
    include: {
      attempts: { orderBy: { createdAt: "asc" } },
      roomTask: {
        select: {
          choiceOptions: { select: { id: true, text: true } },
        },
      },
    },
  });

  if (!progress) {
    return [];
  }

  const optionMap = new Map(
    progress.roomTask.choiceOptions.map((option) => [option.id, option.text]),
  );

  return progress.attempts.map((attempt) => ({
    id: attempt.id,
    answerText: attempt.answerText,
    selectedOptionIds: attempt.selectedOptionIds,
    imageUrl: attempt.imageUrl,
    isCorrect: attempt.isCorrect,
    usedHint: attempt.usedHint,
    createdAt: attempt.createdAt,
    optionLabels: attempt.selectedOptionIds.map((id) => optionMap.get(id) ?? id),
  }));
}

export async function assertStudentOwnsTask(studentId: string, roomTaskId: string) {
  const link = await prisma.studentTaskAssignment.findFirst({
    where: {
      roomTaskId,
      assignment: { studentId },
    },
  });

  if (!link) {
    throw new Error("Задание не назначено");
  }

  return link;
}

export async function assertTutorRoomAccess(tutorId: string, roomId: string) {
  const room = await prisma.room.findFirst({
    where: { id: roomId, ownerId: tutorId },
  });

  if (!room) {
    throw new Error("Комната не найдена");
  }

  return room;
}
