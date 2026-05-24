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

export type TaskAttemptContext = {
  title: string;
  answerType: string;
  correctAnswer: string | null;
  description: string | null;
};

export type TeacherStudentOverview = {
  id: string;
  name: string;
  email: string;
  rooms: { roomId: string; roomTitle: string }[];
  totals: {
    assignedTasks: number;
    completedTasks: number;
    errorTasks: number;
    hintsUsed: number;
    pendingReview: number;
  };
};

export type StudentRoomOption = {
  roomId: string;
  roomTitle: string;
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

export type StudentRoomOverview = {
  id: string;
  title: string;
  topics: RoomTopicOverview[];
};

export type RoomTopicOverview = {
  id: string;
  title: string;
  description: string | null;
  tasks: RoomTaskOverviewItem[];
};

export type RoomTaskOverviewItem = {
  roomTaskId: string;
  title: string;
  answerType: string;
  sortOrder: number;
  isHomework: boolean;
  assignmentId: string | null;
  progress: {
    status: TaskProgressStatus;
    errorCount: number;
  } | null;
};

export async function getStudentRoomTaskOverview(studentId: string): Promise<StudentRoomOverview[]> {
  const memberships = await prisma.roomMember.findMany({
    where: { userId: studentId, role: "STUDENT" },
    include: {
      room: {
        select: {
          id: true,
          title: true,
          topics: {
            orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
            select: {
              id: true,
              title: true,
              description: true,
              tasks: {
                orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
                select: {
                  id: true,
                  title: true,
                  answerType: true,
                  sortOrder: true,
                },
              },
            },
          },
        },
      },
    },
    orderBy: { joinedAt: "desc" },
  });

  const assignments = await getStudentAssignments(studentId);
  const homeworkByTaskId = new Map<string, string>();
  for (const assignment of assignments) {
    for (const task of assignment.tasks) {
      homeworkByTaskId.set(task.roomTaskId, assignment.id);
    }
  }

  const allTaskIds = memberships.flatMap((membership) =>
    membership.room.topics.flatMap((topic) => topic.tasks.map((task) => task.id)),
  );

  const progressRows =
    allTaskIds.length > 0
      ? await prisma.studentTaskProgress.findMany({
          where: { studentId, roomTaskId: { in: allTaskIds } },
        })
      : [];

  const progressByTaskId = new Map(progressRows.map((row) => [row.roomTaskId, row]));

  return memberships.map((membership) => ({
    id: membership.room.id,
    title: membership.room.title,
    topics: membership.room.topics.map((topic) => ({
      id: topic.id,
      title: topic.title,
      description: topic.description,
      tasks: topic.tasks.map((task) => {
        const progress = progressByTaskId.get(task.id);
        return {
          roomTaskId: task.id,
          title: task.title,
          answerType: task.answerType,
          sortOrder: task.sortOrder,
          isHomework: homeworkByTaskId.has(task.id),
          assignmentId: homeworkByTaskId.get(task.id) ?? null,
          progress: progress
            ? {
                status: progress.status,
                errorCount: progress.errorCount,
              }
            : null,
        };
      }),
    })),
  }));
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

export async function getTaskAttemptContextForTutor(
  tutorId: string,
  roomId: string,
  roomTaskId: string,
): Promise<TaskAttemptContext | null> {
  const room = await prisma.room.findFirst({
    where: { id: roomId, ownerId: tutorId },
  });

  if (!room) {
    return null;
  }

  const task = await prisma.roomTask.findFirst({
    where: { id: roomTaskId, roomTopic: { roomId } },
    select: {
      title: true,
      answerType: true,
      correctAnswer: true,
      description: true,
    },
  });

  return task;
}

export async function getStudentRoomsForTutor(
  tutorId: string,
  studentId: string,
): Promise<StudentRoomOption[]> {
  const memberships = await prisma.roomMember.findMany({
    where: {
      userId: studentId,
      role: "STUDENT",
      room: { ownerId: tutorId },
    },
    include: {
      room: { select: { id: true, title: true } },
    },
    orderBy: { joinedAt: "asc" },
  });

  return memberships.map((membership) => ({
    roomId: membership.room.id,
    roomTitle: membership.room.title,
  }));
}

export async function getTeacherStudentsOverview(
  tutorId: string,
): Promise<TeacherStudentOverview[]> {
  const rooms = await prisma.room.findMany({
    where: { ownerId: tutorId },
    include: {
      members: {
        where: { role: "STUDENT" },
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
      },
    },
    orderBy: { title: "asc" },
  });

  const byStudent = new Map<
    string,
    {
      id: string;
      name: string;
      email: string;
      rooms: { roomId: string; roomTitle: string }[];
    }
  >();

  for (const room of rooms) {
    for (const member of room.members) {
      const existing = byStudent.get(member.user.id);
      const roomEntry = { roomId: room.id, roomTitle: room.title };

      if (existing) {
        existing.rooms.push(roomEntry);
      } else {
        byStudent.set(member.user.id, {
          id: member.user.id,
          name: member.user.profile?.displayName ?? member.user.name,
          email: member.user.email,
          rooms: [roomEntry],
        });
      }
    }
  }

  const studentIds = [...byStudent.keys()];
  if (studentIds.length === 0) {
    return [];
  }

  const assignments = await prisma.studentTopicAssignment.findMany({
    where: { studentId: { in: studentIds }, room: { ownerId: tutorId } },
    include: {
      taskItems: { select: { roomTaskId: true } },
    },
  });

  const taskIds = assignments.flatMap((assignment) =>
    assignment.taskItems.map((item) => item.roomTaskId),
  );

  const progressRows =
    taskIds.length > 0
      ? await prisma.studentTaskProgress.findMany({
          where: { studentId: { in: studentIds }, roomTaskId: { in: taskIds } },
        })
      : [];

  const progressByStudentTask = new Map(
    progressRows.map((row) => [`${row.studentId}:${row.roomTaskId}`, row]),
  );

  return [...byStudent.values()].map((student) => {
    const studentAssignments = assignments.filter((a) => a.studentId === student.id);
    let assignedTasks = 0;
    let completedTasks = 0;
    let errorTasks = 0;
    let hintsUsed = 0;
    let pendingReview = 0;

    for (const assignment of studentAssignments) {
      for (const item of assignment.taskItems) {
        assignedTasks += 1;
        const progress = progressByStudentTask.get(`${student.id}:${item.roomTaskId}`);
        if (!progress) {
          continue;
        }
        if (isCompleted(progress.status)) {
          completedTasks += 1;
        }
        if (progress.errorCount > 0) {
          errorTasks += 1;
        }
        if (progress.hintUsedAt) {
          hintsUsed += 1;
        }
        if (progress.status === "SUBMITTED") {
          pendingReview += 1;
        }
      }
    }

    return {
      ...student,
      totals: {
        assignedTasks,
        completedTasks,
        errorTasks,
        hintsUsed,
        pendingReview,
      },
    };
  });
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
