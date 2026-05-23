import { prisma } from "@/lib/prisma";
import { normalizeTags } from "@/lib/topic-tags";

export type MarketplaceFilters = {
  search?: string;
  tags?: string[];
};

export async function getPublishedTopics(filters: MarketplaceFilters = {}) {
  const search = filters.search?.trim();
  const tags = filters.tags?.filter(Boolean) ?? [];

  return prisma.taskTopic.findMany({
    where: {
      isPublished: true,
      isActive: true,
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: "insensitive" } },
              { description: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(tags.length > 0 ? { tags: { hasEvery: tags } } : {}),
    },
    orderBy: [{ sortOrder: "asc" }, { publishedAt: "desc" }, { title: "asc" }],
    include: {
      tutor: { select: { id: true, name: true, email: true, role: true } },
      _count: { select: { tasks: true } },
    },
  });
}

export async function getPublishedTopicDetail(topicId: string) {
  return prisma.taskTopic.findFirst({
    where: { id: topicId, isPublished: true, isActive: true },
    include: {
      tutor: { select: { id: true, name: true, email: true, role: true } },
      tasks: {
        where: { isActive: true },
        orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
        select: {
          id: true,
          title: true,
          description: true,
          answerType: true,
          correctAnswer: true,
          hint: true,
          imageUrl: true,
          sortOrder: true,
          supportsMultipleAnswers: true,
          alternativeAnswers: {
            orderBy: { createdAt: "asc" },
            select: {
              id: true,
              answerText: true,
              explanation: true,
            },
          },
          choiceOptions: {
            orderBy: { sortOrder: "asc" },
            select: {
              id: true,
              text: true,
              isCorrect: true,
              sortOrder: true,
            },
          },
        },
      },
    },
  });
}

export async function getTutorRoomsForCopy(tutorId: string) {
  return prisma.room.findMany({
    where: { ownerId: tutorId },
    orderBy: { title: "asc" },
    select: { id: true, title: true },
  });
}

export async function getRoomTopics(roomId: string) {
  return prisma.roomTopic.findMany({
    where: { roomId },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    include: {
      _count: { select: { tasks: true } },
    },
  });
}

export function getTopicAuthorLabel(name: string, email: string) {
  if (email === "catalog@dolinaznaniy.ru" || name === "Долина знаний") {
    return "Долина знаний";
  }

  return name || email;
}

export async function publishTopic(tutorId: string, topicId: string, tags?: string[]) {
  const topic = await prisma.taskTopic.findFirst({
    where: { id: topicId, tutorId },
  });

  if (!topic) {
    throw new Error("Тема не найдена");
  }

  return prisma.taskTopic.update({
    where: { id: topicId },
    data: {
      isPublished: true,
      publishedAt: new Date(),
      tags: tags ? normalizeTags(tags) : topic.tags,
    },
  });
}

export async function unpublishTopic(tutorId: string, topicId: string) {
  const topic = await prisma.taskTopic.findFirst({
    where: { id: topicId, tutorId },
  });

  if (!topic) {
    throw new Error("Тема не найдена");
  }

  return prisma.taskTopic.update({
    where: { id: topicId },
    data: {
      isPublished: false,
      publishedAt: null,
    },
  });
}

/**
 * Copies a published marketplace topic into a room as an immutable snapshot.
 * RoomTopic/RoomTask rows are independent — later edits to TaskTopic do not propagate.
 */
export async function copyTopicToRoom(tutorId: string, topicId: string, roomId: string) {
  const room = await prisma.room.findFirst({
    where: { id: roomId, ownerId: tutorId },
  });

  if (!room) {
    throw new Error("Комната не найдена");
  }

  const source = await prisma.taskTopic.findFirst({
    where: {
      id: topicId,
      isPublished: true,
      isActive: true,
    },
    include: {
      tasks: {
        where: { isActive: true },
        orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
        include: {
          alternativeAnswers: true,
          choiceOptions: { orderBy: { sortOrder: "asc" } },
        },
      },
    },
  });

  if (!source) {
    throw new Error("Тема не найдена в маркетплейсе");
  }

  const last = await prisma.roomTopic.findFirst({
    where: { roomId },
    orderBy: { sortOrder: "desc" },
    select: { sortOrder: true },
  });

  return prisma.$transaction(async (tx) => {
    const roomTopic = await tx.roomTopic.create({
      data: {
        roomId,
        tutorId,
        sourceTopicId: source.id,
        title: source.title,
        description: source.description,
        tags: source.tags,
        sortOrder: (last?.sortOrder ?? 0) + 1,
      },
    });

    for (const task of source.tasks) {
      const roomTask = await tx.roomTask.create({
        data: {
          roomTopicId: roomTopic.id,
          title: task.title,
          description: task.description,
          answerType: task.answerType,
          correctAnswer: task.correctAnswer,
          hint: task.hint,
          imageUrl: task.imageUrl,
          sortOrder: task.sortOrder,
          supportsMultipleAnswers: task.supportsMultipleAnswers,
        },
      });

      if (task.alternativeAnswers.length > 0) {
        await tx.roomTaskAlternativeAnswer.createMany({
          data: task.alternativeAnswers.map((alt) => ({
            roomTaskId: roomTask.id,
            answerText: alt.answerText,
            explanation: alt.explanation,
          })),
        });
      }

      if (task.choiceOptions.length > 0) {
        await tx.roomTaskChoiceOption.createMany({
          data: task.choiceOptions.map((option) => ({
            roomTaskId: roomTask.id,
            text: option.text,
            isCorrect: option.isCorrect,
            sortOrder: option.sortOrder,
          })),
        });
      }
    }

    return roomTopic;
  });
}

export async function deleteRoomTopic(tutorId: string, roomTopicId: string) {
  const roomTopic = await prisma.roomTopic.findFirst({
    where: { id: roomTopicId },
    include: { room: true },
  });

  if (!roomTopic || roomTopic.room.ownerId !== tutorId) {
    throw new Error("Тема не найдена");
  }

  await prisma.roomTopic.delete({ where: { id: roomTopicId } });
}

export async function getAllPublishedTags() {
  const topics = await prisma.taskTopic.findMany({
    where: { isPublished: true, isActive: true },
    select: { tags: true },
  });

  const tagSet = new Set<string>();
  for (const topic of topics) {
    for (const tag of topic.tags) {
      tagSet.add(tag);
    }
  }

  return [...tagSet].sort((a, b) => a.localeCompare(b, "ru"));
}
