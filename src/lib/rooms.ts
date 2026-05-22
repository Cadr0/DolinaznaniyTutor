import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { localePath } from "@/lib/routes";

export const ROOM_INVITE_COOKIE = "room_invite_slug";

export function buildRoomInviteUrl(slug: string) {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return `${base}/invite/${slug}`;
}

export function createRoomSlug(title: string) {
  const normalized = title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u0400-\u04FF]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 32);
  const suffix = Math.random().toString(36).slice(2, 8);
  return `${normalized || "room"}-${suffix}`;
}

export async function setPendingRoomInvite(slug: string) {
  const cookieStore = await cookies();
  cookieStore.set(ROOM_INVITE_COOKIE, slug, {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
    sameSite: "lax",
  });
}

export async function getPendingRoomInviteSlug() {
  const cookieStore = await cookies();
  return cookieStore.get(ROOM_INVITE_COOKIE)?.value ?? null;
}

export async function clearPendingRoomInvite() {
  const cookieStore = await cookies();
  cookieStore.delete(ROOM_INVITE_COOKIE);
}

export async function joinRoomBySlug(userId: string, slug: string) {
  const room = await prisma.room.findUnique({
    where: { slug },
  });

  if (!room) {
    return null;
  }

  await prisma.roomMember.upsert({
    where: {
      roomId_userId: {
        roomId: room.id,
        userId,
      },
    },
    create: {
      roomId: room.id,
      userId,
      role: "STUDENT",
    },
    update: {},
  });

  return room;
}

export async function consumeRoomInvite(userId: string, locale: string) {
  const slug = await getPendingRoomInviteSlug();
  if (!slug) {
    return null;
  }

  const room = await joinRoomBySlug(userId, slug);
  await clearPendingRoomInvite();

  if (!room) {
    return null;
  }

  return localePath(locale, `/dashboard/rooms/${room.id}`);
}

export async function getRoomForUser(roomId: string, userId: string, userRole: string) {
  const room = await prisma.room.findUnique({
    where: { id: roomId },
    include: {
      owner: { select: { id: true, name: true, email: true } },
      members: {
        include: {
          user: {
            select: { id: true, name: true, email: true, profile: true },
          },
        },
        orderBy: { joinedAt: "asc" },
      },
      assignments: {
        orderBy: { createdAt: "desc" },
        include: {
          submissions: {
            include: {
              student: { select: { id: true, name: true } },
            },
          },
        },
      },
    },
  });

  if (!room) {
    return null;
  }

  const isOwner = room.ownerId === userId;
  const membership = room.members.find((member) => member.userId === userId);

  if (!isOwner && !membership) {
    return null;
  }

  return {
    room,
    isOwner,
    isTutor: userRole === "TUTOR" && isOwner,
    isStudent: membership?.role === "STUDENT",
  };
}

export async function publishAssignment(assignmentId: string, tutorId: string) {
  const assignment = await prisma.assignment.findUnique({
    where: { id: assignmentId },
    include: { room: true },
  });

  if (!assignment || assignment.room.ownerId !== tutorId) {
    throw new Error("Нет доступа к заданию");
  }

  const students = await prisma.roomMember.findMany({
    where: { roomId: assignment.roomId, role: "STUDENT" },
  });

  await prisma.$transaction(async (tx) => {
    await tx.assignment.update({
      where: { id: assignmentId },
      data: { status: "PUBLISHED" },
    });

    for (const student of students) {
      await tx.submission.upsert({
        where: {
          assignmentId_studentId: {
            assignmentId,
            studentId: student.userId,
          },
        },
        create: {
          assignmentId,
          studentId: student.userId,
          status: "PENDING",
        },
        update: {},
      });
    }
  });
}
