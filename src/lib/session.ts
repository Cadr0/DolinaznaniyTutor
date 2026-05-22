import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { localePath } from "@/lib/routes";

export async function getCurrentSession() {
  return auth.api.getSession({
    headers: await headers(),
  });
}

export async function requireSession(locale: string) {
  const session = await getCurrentSession();

  if (!session) {
    redirect(localePath(locale, "/login"));
  }

  return session;
}

export async function redirectAfterAuth(locale: string) {
  const session = await getCurrentSession();

  if (!session) {
    redirect(localePath(locale, "/login"));
  }

  if (!session.user.onboardingCompletedAt) {
    redirect(localePath(locale, "/onboarding"));
  }

  redirect(localePath(locale, "/dashboard"));
}
