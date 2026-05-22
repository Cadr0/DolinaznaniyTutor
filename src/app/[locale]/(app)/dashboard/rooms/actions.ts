"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ensureMarketplaceSampleTasks } from "@/lib/marketplace";
import { prisma } from "@/lib/prisma";
import { localePath } from "@/lib/routes";
import { createRoomSlug, publishAssignment } from "@/lib/rooms";
import { requireSession } from "@/lib/session";

function revalidateRoomPaths(locale: string, roomId: string) {
  revalidatePath(localePath(locale, "/dashboard/rooms"));
  revalidatePath(localePath(locale, `/dashboard/rooms/${roomId}`));
}

export async function createRoom(locale: string, formData: FormData) {
  const session = await requireSession(locale);

  if (session.user.role !== "TUTOR") {
    throw new Error("Только учитель может создавать комнаты");
  }

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();

  if (!title) {
    throw new Error("Введите название комнаты");
  }

  const slug = createRoomSlug(title);

  const room = await prisma.room.create({
    data: {
      title,
      description: description || null,
      slug,
      ownerId: session.user.id,
      members: {
        create: {
          userId: session.user.id,
          role: "TUTOR",
        },
      },
    },
  });

  revalidatePath(localePath(locale, "/dashboard/rooms"));
  redirect(localePath(locale, `/dashboard/rooms/${room.id}`));
}

export async function createAssignment(locale: string, roomId: string, formData: FormData) {
  const session = await requireSession(locale);
  const title = String(formData.get("title") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();

  if (!title || !content) {
    throw new Error("Заполните название и текст задания");
  }

  const room = await prisma.room.findFirst({
    where: { id: roomId, ownerId: session.user.id },
  });

  if (!room) {
    throw new Error("Комната не найдена");
  }

  await prisma.assignment.create({
    data: {
      roomId,
      title,
      content,
      status: "DRAFT",
    },
  });

  revalidateRoomPaths(locale, roomId);
}

export async function publishAssignmentAction(locale: string, assignmentId: string) {
  const session = await requireSession(locale);
  await publishAssignment(assignmentId, session.user.id);

  const assignment = await prisma.assignment.findUnique({
    where: { id: assignmentId },
    select: { roomId: true },
  });

  if (assignment) {
    revalidateRoomPaths(locale, assignment.roomId);
  }
}

export async function importMarketplaceTask(
  locale: string,
  roomId: string,
  taskId: string
) {
  const session = await requireSession(locale);

  const room = await prisma.room.findFirst({
    where: { id: roomId, ownerId: session.user.id },
  });

  if (!room) {
    throw new Error("Комната не найдена");
  }

  await ensureMarketplaceSampleTasks(session.user.id);

  const task = await prisma.marketplaceTask.findFirst({
    where: { id: taskId, isPublic: true },
  });

  if (!task) {
    throw new Error("Задание не найдено");
  }

  await prisma.assignment.create({
    data: {
      roomId,
      title: task.title,
      content: task.content,
      status: "DRAFT",
      sourceTaskId: task.id,
    },
  });

  revalidateRoomPaths(locale, roomId);
}

export async function submitAssignment(
  locale: string,
  assignmentId: string,
  formData: FormData
) {
  const session = await requireSession(locale);
  const content = String(formData.get("content") ?? "").trim();

  if (!content) {
    throw new Error("Напишите ответ");
  }

  const assignment = await prisma.assignment.findUnique({
    where: { id: assignmentId },
    include: { room: true },
  });

  if (!assignment || assignment.status !== "PUBLISHED") {
    throw new Error("Задание недоступно");
  }

  const membership = await prisma.roomMember.findUnique({
    where: {
      roomId_userId: {
        roomId: assignment.roomId,
        userId: session.user.id,
      },
    },
  });

  if (!membership || membership.role !== "STUDENT") {
    throw new Error("Нет доступа к заданию");
  }

  await prisma.submission.upsert({
    where: {
      assignmentId_studentId: {
        assignmentId,
        studentId: session.user.id,
      },
    },
    create: {
      assignmentId,
      studentId: session.user.id,
      content,
      status: "SUBMITTED",
      submittedAt: new Date(),
    },
    update: {
      content,
      status: "SUBMITTED",
      submittedAt: new Date(),
    },
  });

  revalidateRoomPaths(locale, assignment.roomId);
}
