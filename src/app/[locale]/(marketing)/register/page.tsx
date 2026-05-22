import { setRequestLocale } from "next-intl/server";
import { AuthForm } from "@/components/auth/AuthForm";
import { prisma } from "@/lib/prisma";

type Role = "STUDENT" | "TUTOR";
type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ role?: string; room?: string }>;
};

export default async function RegisterPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { role, room: roomSlug } = await searchParams;
  setRequestLocale(locale);

  const inviteRoom = roomSlug
    ? await prisma.room.findUnique({
        where: { slug: roomSlug },
        select: { slug: true, title: true },
      })
    : null;

  const initialRole: Role = inviteRoom
    ? "STUDENT"
    : role === "teacher" || role === "tutor"
      ? "TUTOR"
      : "STUDENT";

  return (
    <AuthForm
      mode="register"
      initialRole={initialRole}
      inviteRoomSlug={inviteRoom?.slug}
      inviteRoomTitle={inviteRoom?.title}
      lockRole={Boolean(inviteRoom)}
    />
  );
}
