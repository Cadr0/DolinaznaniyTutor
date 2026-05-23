"use server";

import { revalidatePath } from "next/cache";
import type { TaskAnswerType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { localePath } from "@/lib/routes";
import { requireSession } from "@/lib/session";
import {
  assertTaskOwner,
  assertTopicNotPublished,
  assertTopicOwner,
  getNextTaskSortOrder,
  syncTaskRelations,
  type TaskFormAlternative,
  type TaskFormChoiceOption,
} from "@/lib/tasks";
import { publishTopic, unpublishTopic } from "@/lib/marketplace-topics";
import { normalizeTags, parseTagsInput } from "@/lib/topic-tags";

function materialsPath(locale: string) {
  return localePath(locale, "/dashboard/materials");
}

function marketplacePath(locale: string) {
  return localePath(locale, "/dashboard/marketplace");
}

function revalidateMaterials(locale: string) {
  revalidatePath(materialsPath(locale));
  revalidatePath(marketplacePath(locale));
}

function parseTagsFromForm(formData: FormData): string[] {
  const rawTags = String(formData.get("tags") ?? "");
  const tagsJson = String(formData.get("tagsJson") ?? "");

  if (tagsJson) {
    try {
      const parsed = JSON.parse(tagsJson) as string[];
      if (Array.isArray(parsed)) {
        return normalizeTags(parsed);
      }
    } catch {
      // fall through
    }
  }

  return normalizeTags(parseTagsInput(rawTags));
}

async function requireTutor(locale: string) {
  const session = await requireSession(locale);

  if (session.user.role !== "TUTOR") {
    throw new Error("Только учитель может управлять материалами");
  }

  return session;
}

function parseAnswerType(value: string): TaskAnswerType {
  if (value === "CHOICE" || value === "IMAGE") {
    return value;
  }

  return "TEXT";
}

function parseAlternatives(formData: FormData): TaskFormAlternative[] {
  const raw = String(formData.get("alternativesJson") ?? "[]");

  try {
    const parsed = JSON.parse(raw) as TaskFormAlternative[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function parseChoiceOptions(formData: FormData): TaskFormChoiceOption[] {
  const raw = String(formData.get("choiceOptionsJson") ?? "[]");

  try {
    const parsed = JSON.parse(raw) as TaskFormChoiceOption[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function createTopic(locale: string, formData: FormData) {
  const session = await requireTutor(locale);
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const tags = parseTagsFromForm(formData);
  const isPublished = formData.has("isPublished") && formData.get("isPublished") === "on";

  if (!title) {
    throw new Error("Введите название темы");
  }

  const last = await prisma.taskTopic.findFirst({
    where: { tutorId: session.user.id },
    orderBy: { sortOrder: "desc" },
    select: { sortOrder: true },
  });

  const topic = await prisma.taskTopic.create({
    data: {
      tutorId: session.user.id,
      title,
      description: description || null,
      tags,
      isPublished,
      publishedAt: isPublished ? new Date() : null,
      sortOrder: (last?.sortOrder ?? 0) + 1,
    },
  });

  revalidateMaterials(locale);
  return topic.id;
}

export async function updateTopic(locale: string, topicId: string, formData: FormData) {
  const session = await requireTutor(locale);
  const existing = await assertTopicOwner(session.user.id, topicId);
  assertTopicNotPublished(existing);

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const tags = parseTagsFromForm(formData);
  const isPublished = formData.has("isPublished")
    ? formData.get("isPublished") === "on"
    : existing.isPublished;

  if (!title) {
    throw new Error("Введите название темы");
  }

  await prisma.taskTopic.update({
    where: { id: topicId },
    data: {
      title,
      description: description || null,
      tags,
      isPublished,
      publishedAt: isPublished ? (existing?.publishedAt ?? new Date()) : null,
    },
  });

  revalidateMaterials(locale);
}

export async function deleteTopic(locale: string, topicId: string) {
  const session = await requireTutor(locale);
  const topic = await assertTopicOwner(session.user.id, topicId);
  assertTopicNotPublished(topic);

  await prisma.taskTopic.delete({ where: { id: topicId } });
  revalidateMaterials(locale);
}

export async function createTask(locale: string, formData: FormData) {
  const session = await requireTutor(locale);
  const topicId = String(formData.get("topicId") ?? "");
  const topic = await assertTopicOwner(session.user.id, topicId);
  assertTopicNotPublished(topic);

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const answerType = parseAnswerType(String(formData.get("answerType") ?? "TEXT"));
  const correctAnswer = String(formData.get("correctAnswer") ?? "").trim();
  const hint = String(formData.get("hint") ?? "").trim();
  const imageUrl = String(formData.get("imageUrl") ?? "").trim();
  const supportsMultipleAnswers = formData.get("supportsMultipleAnswers") === "on";

  if (!title) {
    throw new Error("Введите название задания");
  }

  if (answerType === "TEXT" && !correctAnswer) {
    throw new Error("Введите основной правильный ответ");
  }

  const sortOrder = await getNextTaskSortOrder(topicId);

  const task = await prisma.task.create({
    data: {
      topicId,
      tutorId: session.user.id,
      title,
      description: description || null,
      answerType,
      correctAnswer: correctAnswer || null,
      hint: hint || null,
      imageUrl: imageUrl || null,
      supportsMultipleAnswers,
      sortOrder,
    },
  });

  await syncTaskRelations(task.id, {
    answerType,
    alternatives: parseAlternatives(formData),
    choiceOptions: parseChoiceOptions(formData),
  });

  revalidateMaterials(locale);
  return task.id;
}

export async function updateTask(locale: string, taskId: string, formData: FormData) {
  const session = await requireTutor(locale);
  const task = await assertTaskOwner(session.user.id, taskId);

  const topicId = String(formData.get("topicId") ?? "");
  const topic = await assertTopicOwner(session.user.id, topicId);
  assertTopicNotPublished(topic);

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const answerType = parseAnswerType(String(formData.get("answerType") ?? "TEXT"));
  const correctAnswer = String(formData.get("correctAnswer") ?? "").trim();
  const hint = String(formData.get("hint") ?? "").trim();
  const imageUrl = String(formData.get("imageUrl") ?? "").trim();
  const supportsMultipleAnswers = formData.get("supportsMultipleAnswers") === "on";
  const removeImage = formData.get("removeImage") === "on";

  if (!title) {
    throw new Error("Введите название задания");
  }

  if (answerType === "TEXT" && !correctAnswer) {
    throw new Error("Введите основной правильный ответ");
  }

  await prisma.task.update({
    where: { id: taskId },
    data: {
      topicId,
      title,
      description: description || null,
      answerType,
      correctAnswer: correctAnswer || null,
      hint: hint || null,
      imageUrl: removeImage ? null : imageUrl || null,
      supportsMultipleAnswers,
    },
  });

  await syncTaskRelations(taskId, {
    answerType,
    alternatives: parseAlternatives(formData),
    choiceOptions: parseChoiceOptions(formData),
  });

  revalidateMaterials(locale);
}

export async function deleteTask(locale: string, taskId: string) {
  const session = await requireTutor(locale);
  const task = await assertTaskOwner(session.user.id, taskId);
  const topic = await assertTopicOwner(session.user.id, task.topicId);
  assertTopicNotPublished(topic);

  await prisma.task.delete({ where: { id: taskId } });
  revalidateMaterials(locale);
}

export async function reorderTask(locale: string, taskId: string, direction: "up" | "down") {
  const session = await requireTutor(locale);
  const task = await assertTaskOwner(session.user.id, taskId);
  const topic = await assertTopicOwner(session.user.id, task.topicId);
  assertTopicNotPublished(topic);

  const siblings = await prisma.task.findMany({
    where: { topicId: task.topicId },
    orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
    select: { id: true, sortOrder: true },
  });

  const index = siblings.findIndex((item) => item.id === taskId);
  const swapIndex = direction === "up" ? index - 1 : index + 1;

  if (index < 0 || swapIndex < 0 || swapIndex >= siblings.length) {
    return;
  }

  const current = siblings[index];
  const swap = siblings[swapIndex];

  await prisma.$transaction([
    prisma.task.update({
      where: { id: current.id },
      data: { sortOrder: swap.sortOrder },
    }),
    prisma.task.update({
      where: { id: swap.id },
      data: { sortOrder: current.sortOrder },
    }),
  ]);

  revalidateMaterials(locale);
}

export async function toggleTopicPublish(locale: string, topicId: string, publish: boolean) {
  const session = await requireTutor(locale);
  await assertTopicOwner(session.user.id, topicId);

  if (publish) {
    await publishTopic(session.user.id, topicId);
  } else {
    await unpublishTopic(session.user.id, topicId);
  }

  revalidateMaterials(locale);
}
