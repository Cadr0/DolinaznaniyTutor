import { NextRequest, NextResponse } from "next/server";
import { getAppOrigin } from "@/lib/app-url";
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
  const origin = getAppOrigin(request);

  if (!room) {
    return NextResponse.redirect(new URL("/register?invite=invalid", origin));
  }

  const session = await getCurrentSession();

  if (session?.user) {
    if (session.user.role === "STUDENT") {
      await joinRoomBySlug(session.user.id, room.slug);
      return NextResponse.redirect(new URL(`/dashboard/rooms/${room.id}`, origin));
    }

    return NextResponse.redirect(new URL("/dashboard/rooms", origin));
  }

  await setPendingRoomInvite(room.slug);

  const registerUrl = new URL("/register", origin);
  registerUrl.searchParams.set("role", "student");
  registerUrl.searchParams.set("room", room.slug);

  return NextResponse.redirect(registerUrl);
}
