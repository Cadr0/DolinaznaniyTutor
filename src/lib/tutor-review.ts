import { prisma } from "@/lib/prisma";

export type PendingReviewItem = {
  progressId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  roomId: string;
  roomTitle: string;
  topicTitle: string;
  taskTitle: string;
  taskId: string;
  imageUrl: string;
  submittedAt: Date;
  attemptId: string;
};

export async function getPendingImageReviews(tutorId: string): Promise<PendingReviewItem[]> {
  const rooms = await prisma.room.findMany({
    where: { ownerId: tutorId },
    select: { id: true },
  });

  const roomIds = rooms.map((room) => room.id);
  if (roomIds.length === 0) {
    return [];
  }

  const progressRows = await prisma.studentTaskProgress.findMany({
    where: {
      status: "SUBMITTED",
      roomTask: { roomTopic: { roomId: { in: roomIds } } },
    },
    include: {
      student: {
        select: {
          id: true,
          name: true,
          email: true,
          profile: { select: { displayName: true } },
        },
      },
      roomTask: {
        select: {
          id: true,
          title: true,
          roomTopic: {
            select: {
              title: true,
              room: { select: { id: true, title: true } },
            },
          },
        },
      },
      attempts: {
        where: { imageUrl: { not: null } },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return progressRows
    .filter((row) => row.attempts.length > 0 && row.attempts[0].imageUrl)
    .map((row) => {
      const attempt = row.attempts[0];
      return {
        progressId: row.id,
        studentId: row.student.id,
        studentName: row.student.profile?.displayName ?? row.student.name,
        studentEmail: row.student.email,
        roomId: row.roomTask.roomTopic.room.id,
        roomTitle: row.roomTask.roomTopic.room.title,
        topicTitle: row.roomTask.roomTopic.title,
        taskTitle: row.roomTask.title,
        taskId: row.roomTask.id,
        imageUrl: attempt.imageUrl!,
        submittedAt: attempt.createdAt,
        attemptId: attempt.id,
      };
    });
}

export async function reviewImageSubmission(
  tutorId: string,
  progressId: string,
  accept: boolean,
  feedback?: string,
) {
  const progress = await prisma.studentTaskProgress.findUnique({
    where: { id: progressId },
    include: {
      roomTask: {
        include: {
          roomTopic: { include: { room: true } },
        },
      },
      attempts: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  if (!progress || progress.roomTask.roomTopic.room.ownerId !== tutorId) {
    throw new Error("Ответ не найден");
  }

  if (progress.status !== "SUBMITTED") {
    throw new Error("Ответ уже проверен");
  }

  const latestAttempt = progress.attempts[0];
  if (!latestAttempt) {
    throw new Error("Попытка не найдена");
  }

  await prisma.$transaction(async (tx) => {
    await tx.studentTaskAttempt.update({
      where: { id: latestAttempt.id },
      data: {
        isCorrect: accept,
        answerText: feedback?.trim() ? feedback.trim() : latestAttempt.answerText,
      },
    });

    if (accept) {
      await tx.studentTaskProgress.update({
        where: { id: progressId },
        data: {
          status: "CORRECT",
          completedAt: new Date(),
        },
      });
    } else {
      await tx.studentTaskProgress.update({
        where: { id: progressId },
        data: {
          status: "IN_PROGRESS",
          completedAt: null,
          errorCount: { increment: 1 },
        },
      });
    }
  });
}
