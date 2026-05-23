import { setRequestLocale } from "next-intl/server";
import { AuthForm } from "@/components/auth/AuthForm";
import { findRoomByInviteSlug } from "@/lib/rooms";

type Role = "STUDENT" | "TUTOR";
type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ role?: string; room?: string; invite?: string }>;
};

export default async function RegisterPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { role, room: roomSlug, invite } = await searchParams;
  setRequestLocale(locale);

  const inviteRoom = roomSlug ? await findRoomByInviteSlug(roomSlug) : null;

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
      inviteRoomTitle={invite === "invalid" ? undefined : inviteRoom?.title}
      lockRole={Boolean(inviteRoom)}
      inviteInvalid={invite === "invalid"}
    />
  );
}
