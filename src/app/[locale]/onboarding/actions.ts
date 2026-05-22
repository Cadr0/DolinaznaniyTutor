"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
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
      phone: String(formData.get("phone") ?? "").trim() || null,
      city: String(formData.get("city") ?? "").trim() || null,
      timeZone: String(formData.get("timeZone") ?? "").trim() || null,
      gradeLevel: String(formData.get("gradeLevel") ?? "").trim() || null,
      learningGoal: String(formData.get("learningGoal") ?? "").trim() || null,
      subjects,
      experience: String(formData.get("experience") ?? "").trim() || null,
      bio: String(formData.get("bio") ?? "").trim() || null,
    },
    create: {
      userId: session.user.id,
      displayName,
      phone: String(formData.get("phone") ?? "").trim() || null,
      city: String(formData.get("city") ?? "").trim() || null,
      timeZone: String(formData.get("timeZone") ?? "").trim() || null,
      gradeLevel: String(formData.get("gradeLevel") ?? "").trim() || null,
      learningGoal: String(formData.get("learningGoal") ?? "").trim() || null,
      subjects,
      experience: String(formData.get("experience") ?? "").trim() || null,
      bio: String(formData.get("bio") ?? "").trim() || null,
    },
  });

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name: displayName,
      onboardingCompletedAt: new Date(),
    },
  });

  redirect(localePath(locale, "/dashboard"));
}
