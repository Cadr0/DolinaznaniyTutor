"use server";

import { revalidatePath } from "next/cache";
import { getPendingImageReviews, reviewImageSubmission } from "@/lib/tutor-review";
import { localePath } from "@/lib/routes";
import { requireSession } from "@/lib/session";

function reviewPath(locale: string) {
  return localePath(locale, "/dashboard/review");
}

function studentPath(locale: string, studentId: string) {
  return localePath(locale, `/dashboard/students/${studentId}`);
}

async function requireTutor(locale: string) {
  const session = await requireSession(locale);
  if (session.user.role !== "TUTOR") {
    throw new Error("Только учитель может выполнять это действие");
  }
  return session;
}

export async function fetchPendingReviewsAction(locale: string) {
  const session = await requireTutor(locale);
  return getPendingImageReviews(session.user.id);
}

export async function reviewImageSubmissionAction(
  locale: string,
  progressId: string,
  accept: boolean,
  feedback?: string,
) {
  const session = await requireTutor(locale);
  await reviewImageSubmission(session.user.id, progressId, accept, feedback);
  revalidatePath(reviewPath(locale));
  revalidatePath(localePath(locale, "/dashboard"));
  return { ok: true as const };
}

export async function revalidateReviewPathsAction(locale: string, studentId?: string) {
  revalidatePath(reviewPath(locale));
  if (studentId) {
    revalidatePath(studentPath(locale, studentId));
  }
}
