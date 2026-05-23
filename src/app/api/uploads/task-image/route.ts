import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { saveTaskImage } from "@/lib/uploads";

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session || (session.user.role !== "TUTOR" && session.user.role !== "STUDENT")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Файл не передан" }, { status: 400 });
  }

  try {
    const url = await saveTaskImage(file);
    return NextResponse.json({ url });
  } catch (error) {
    const raw = error instanceof Error ? error.message : "Не удалось загрузить файл";
    const message =
      raw.includes("EACCES") || raw.includes("permission denied")
        ? "Не удалось сохранить фото на сервере. Попробуйте позже."
        : raw;
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
