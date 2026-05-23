"use server";

import { revalidatePath } from "next/cache";
import { deleteRoomTopic } from "@/lib/marketplace-topics";
import { localePath } from "@/lib/routes";
import { requireSession } from "@/lib/session";

export async function removeRoomTopicAction(locale: string, roomTopicId: string, roomId: string) {
  const session = await requireSession(locale);

  if (session.user.role !== "TUTOR") {
    throw new Error("Только учитель может удалять темы");
  }

  await deleteRoomTopic(session.user.id, roomTopicId);
  revalidatePath(localePath(locale, `/dashboard/rooms/${roomId}`));
}
