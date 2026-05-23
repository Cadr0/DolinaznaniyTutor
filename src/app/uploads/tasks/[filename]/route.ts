import { readFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { taskImageAbsolutePath } from "@/lib/uploads";

const MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ filename: string }> },
) {
  const { filename } = await params;
  const safeName = path.basename(filename);

  if (safeName !== filename || filename.includes("..")) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const filePath = taskImageAbsolutePath(safeName);
  const ext = path.extname(safeName).toLowerCase();

  try {
    const buffer = await readFile(filePath);
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": MIME[ext] ?? "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
