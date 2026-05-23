"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  copyTopicToRoom,
  deleteRoomTopic,
  getPublishedTopicDetail,
} from "@/lib/marketplace-topics";
import { localePath } from "@/lib/routes";
import { requireSession } from "@/lib/session";

function marketplacePath(locale: string) {
  return localePath(locale, "/dashboard/marketplace");
}

function roomPath(locale: string, roomId: string) {
  return localePath(locale, `/dashboard/rooms/${roomId}`);
}

async function requireTutor(locale: string) {
  const session = await requireSession(locale);

  if (session.user.role !== "TUTOR") {
    throw new Error("Только учитель может работать с маркетплейсом");
  }

  return session;
}

export async function copyMarketplaceTopicToRoom(
  locale: string,
  topicId: string,
  roomId: string,
) {
  const session = await requireTutor(locale);
  await copyTopicToRoom(session.user.id, topicId, roomId);

  revalidatePath(marketplacePath(locale));
  revalidatePath(roomPath(locale, roomId));
  redirect(roomPath(locale, roomId));
}

export async function removeRoomTopic(locale: string, roomTopicId: string, roomId: string) {
  const session = await requireTutor(locale);
  await deleteRoomTopic(session.user.id, roomTopicId);

  revalidatePath(roomPath(locale, roomId));
}

export async function fetchMarketplaceTopicDetail(topicId: string) {
  return getPublishedTopicDetail(topicId);
}
