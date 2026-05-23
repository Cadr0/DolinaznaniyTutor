import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { localePath } from "@/lib/routes";

export const ROOM_INVITE_COOKIE = "room_invite_slug";

export function createRoomSlug() {
  const suffix = Math.random().toString(36).slice(2, 10);
  return `room-${suffix}`;
}

export function isAsciiInviteSlug(slug: string) {
  return /^[a-z0-9-]+$/.test(slug);
}

export function normalizeInviteSlug(raw: string) {
  try {
    return decodeURIComponent(raw).trim();
  } catch {
    return raw.trim();
  }
}

export async function findRoomByInviteSlug(rawSlug: string) {
  const slug = normalizeInviteSlug(rawSlug);

  const direct = await prisma.room.findUnique({
    where: { slug },
    select: { id: true, title: true, slug: true },
  });

  if (direct) {
    return direct;
  }

  const rooms = await prisma.room.findMany({
    select: { id: true, title: true, slug: true },
  });

  return (
    rooms.find((room) => normalizeInviteSlug(room.slug) === slug) ??
    rooms.find((room) => room.slug.endsWith(slug.split("-").pop() ?? "")) ??
    null
  );
}

export async function ensureAsciiRoomSlug(roomId: string, currentSlug: string) {
  if (isAsciiInviteSlug(currentSlug)) {
    return currentSlug;
  }

  const nextSlug = createRoomSlug();

  await prisma.room.update({
    where: { id: roomId },
    data: { slug: nextSlug },
  });

  return nextSlug;
}

export function buildRoomInviteUrl(slug: string) {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return `${base}/invite/${encodeURIComponent(slug)}`;
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
  const room = await findRoomByInviteSlug(slug);

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

export async function consumeRoomInvite(
  userId: string,
  locale: string,
  slugOverride?: string,
) {
  const slug = slugOverride ?? (await getPendingRoomInviteSlug());
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

export type TeacherStudent = {
  id: string;
  name: string;
  email: string;
  roomTitle: string;
  roomId: string;
};

export async function getTeacherStudents(ownerId: string): Promise<TeacherStudent[]> {
  const rooms = await prisma.room.findMany({
    where: { ownerId },
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

  const students: TeacherStudent[] = [];

  for (const room of rooms) {
    for (const member of room.members) {
      students.push({
        id: member.user.id,
        name: member.user.profile?.displayName ?? member.user.name,
        email: member.user.email,
        roomTitle: room.title,
        roomId: room.id,
      });
    }
  }

  return students;
}
