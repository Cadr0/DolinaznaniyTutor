import { prisma } from "@/lib/prisma";

export type TutorDashboardStats = {
  roomCount: number;
  studentCount: number;
  pendingReviewCount: number;
  activeAssignmentCount: number;
};

export async function getTutorDashboardStats(tutorId: string): Promise<TutorDashboardStats> {
  const rooms = await prisma.room.findMany({
    where: { ownerId: tutorId },
    select: {
      id: true,
      members: {
        where: { role: "STUDENT" },
        select: { userId: true },
      },
    },
  });

  const studentIds = new Set<string>();
  for (const room of rooms) {
    for (const member of room.members) {
      studentIds.add(member.userId);
    }
  }

  const roomIds = rooms.map((room) => room.id);

  const [pendingReviewCount, activeAssignmentCount] = await Promise.all([
    roomIds.length === 0
      ? 0
      : prisma.studentTaskProgress.count({
          where: {
            status: "SUBMITTED",
            roomTask: { roomTopic: { roomId: { in: roomIds } } },
          },
        }),
    roomIds.length === 0
      ? 0
      : prisma.studentTopicAssignment.count({
          where: { roomId: { in: roomIds } },
        }),
  ]);

  return {
    roomCount: rooms.length,
    studentCount: studentIds.size,
    pendingReviewCount,
    activeAssignmentCount,
  };
}
