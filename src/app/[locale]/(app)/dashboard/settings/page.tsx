import { setRequestLocale } from "next-intl/server";
import { SettingsPanel } from "@/components/settings/SettingsPanel";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

type Props = { params: Promise<{ locale: string }> };

export const dynamic = "force-dynamic";

export default async function SettingsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const session = await requireSession(locale);

  const profile = await prisma.userProfile.findUnique({
    where: { userId: session.user.id },
    select: { displayName: true },
  });

  const roleLabel =
    session.user.role === "TUTOR"
      ? "Учитель"
      : session.user.role === "ADMIN"
        ? "Администратор"
        : "Ученик";

  return (
    <SettingsPanel
      locale={locale}
      email={session.user.email}
      name={session.user.name}
      displayName={profile?.displayName ?? null}
      roleLabel={roleLabel}
    />
  );
}
