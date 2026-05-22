import { notFound, redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { joinRoomBySlug, setPendingRoomInvite } from "@/lib/rooms";
import { localePath } from "@/lib/routes";
import { getCurrentSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export default async function InvitePage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const room = await prisma.room.findUnique({
    where: { slug },
    select: { id: true, title: true },
  });

  if (!room) {
    notFound();
  }

  const session = await getCurrentSession();

  if (session?.user) {
    if (session.user.role === "STUDENT") {
      await joinRoomBySlug(session.user.id, slug);
      redirect(localePath(locale, `/dashboard/rooms/${room.id}`));
    }

    redirect(localePath(locale, "/dashboard/rooms"));
  }

  await setPendingRoomInvite(slug);
  redirect(localePath(locale, `/register?role=student&room=${slug}`));
}
