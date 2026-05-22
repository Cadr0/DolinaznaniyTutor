"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { consumeRoomInvite } from "@/lib/rooms";
import { localePath } from "@/lib/routes";
import { requireSession } from "@/lib/session";

export async function saveOnboarding(locale: string, formData: FormData) {
  const session = await requireSession(locale);
  const displayName = String(formData.get("displayName") ?? "").trim();

  if (!displayName) {
    throw new Error("Введите имя");
  }

  const subjects = String(formData.get("subjects") ?? "")
    .split(",")
    .map((subject) => subject.trim())
    .filter(Boolean);

  await prisma.userProfile.upsert({
    where: { userId: session.user.id },
    update: {
      displayName,
      subjects,
    },
    create: {
      userId: session.user.id,
      displayName,
      subjects,
    },
  });

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name: displayName,
      onboardingCompletedAt: new Date(),
    },
  });

  const roomRedirect = await consumeRoomInvite(session.user.id, locale);
  redirect(roomRedirect ?? localePath(locale, "/dashboard"));
}
