import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    service: "dolinaznaniy-tutor",
    commit: process.env.GIT_COMMIT ?? "unknown",
    commitFull: process.env.GIT_COMMIT_FULL ?? "unknown",
    environment: process.env.NODE_ENV ?? "development",
    url: process.env.NEXT_PUBLIC_APP_URL ?? null,
    timestamp: new Date().toISOString(),
  });
}
