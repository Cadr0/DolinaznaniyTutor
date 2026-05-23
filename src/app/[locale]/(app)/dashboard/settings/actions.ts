"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { localePath } from "@/lib/routes";
import { requireSession } from "@/lib/session";

export type DeleteAccountState = { error: string };

export async function signOutAccount(formData: FormData) {
  const locale = String(formData.get("locale") ?? "ru");
  await auth.api.signOut({
    headers: await headers(),
  });
  redirect(localePath(locale, "/login"));
}

export async function deleteAccount(
  _prevState: DeleteAccountState,
  formData: FormData,
): Promise<DeleteAccountState> {
  const locale = String(formData.get("locale") ?? "ru");
  const session = await requireSession(locale);
  const password = String(formData.get("password") ?? "");
  const confirmText = String(formData.get("confirmText") ?? "").trim();

  if (confirmText !== "УДАЛИТЬ") {
    return { error: 'Введите слово «УДАЛИТЬ» для подтверждения.' };
  }

  if (password.length < 8) {
    return { error: "Введите текущий пароль." };
  }

  const email = session.user.email;
  const userId = session.user.id;

  const signIn = await auth.api.signInEmail({
    body: { email, password },
    headers: await headers(),
    asResponse: true,
  });

  if (!signIn.ok) {
    return { error: "Неверный пароль." };
  }

  await prisma.$transaction(async (tx) => {
    await tx.verification.deleteMany({ where: { identifier: email } });
    await tx.user.delete({ where: { id: userId } });
  });

  await auth.api.signOut({
    headers: await headers(),
  });

  redirect(localePath(locale, "/"));
}
