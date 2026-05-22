import { NextRequest, NextResponse } from "next/server";
import {
  findRoomByInviteSlug,
  joinRoomBySlug,
  setPendingRoomInvite,
} from "@/lib/rooms";
import { getCurrentSession } from "@/lib/session";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ slug: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  const { slug: rawSlug } = await params;
  const room = await findRoomByInviteSlug(rawSlug);

  if (!room) {
    return NextResponse.redirect(new URL("/register?invite=invalid", request.url));
  }

  const session = await getCurrentSession();
  const origin = new URL(request.url).origin;

  if (session?.user) {
    if (session.user.role === "STUDENT") {
      await joinRoomBySlug(session.user.id, room.slug);
      return NextResponse.redirect(`${origin}/dashboard/rooms/${room.id}`);
    }

    return NextResponse.redirect(`${origin}/dashboard/rooms`);
  }

  await setPendingRoomInvite(room.slug);

  const registerUrl = new URL("/register", origin);
  registerUrl.searchParams.set("role", "student");
  registerUrl.searchParams.set("room", room.slug);

  return NextResponse.redirect(registerUrl);
}
