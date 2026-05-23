import { NextResponse } from "next/server";
import { consumeRoomInvite } from "@/lib/rooms";
import { localePath } from "@/lib/routes";
import { getCurrentSession } from "@/lib/session";

export async function POST(request: Request) {
  const session = await getCurrentSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    locale?: string;
    room?: string;
  };
  const locale = body.locale === "en" ? "en" : "ru";
  const roomSlug = typeof body.room === "string" ? body.room.trim() : undefined;
  if (!session.user.onboardingCompletedAt) {
    return NextResponse.json({
      redirectTo: localePath(locale, "/dashboard"),
    });
  }

  const roomRedirect = await consumeRoomInvite(session.user.id, locale, roomSlug);

  return NextResponse.json({
    redirectTo: roomRedirect ?? localePath(locale, "/dashboard"),
  });
}
