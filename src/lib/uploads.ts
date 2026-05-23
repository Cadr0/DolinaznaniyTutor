import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_BYTES = 5 * 1024 * 1024;

export function getUploadsRoot() {
  return process.env.UPLOADS_DIR ?? path.join(process.cwd(), "uploads");
}

export function getTaskImagesDir() {
  return path.join(getUploadsRoot(), "tasks");
}

export function taskImagePublicUrl(filename: string) {
  return `/uploads/tasks/${filename}`;
}

export function taskImageAbsolutePath(filename: string) {
  return path.join(getTaskImagesDir(), filename);
}

export async function saveTaskImage(file: File): Promise<string> {
  if (!ALLOWED_MIME.has(file.type)) {
    throw new Error("Допустимы только JPEG, PNG и WebP");
  }

  if (file.size > MAX_BYTES) {
    throw new Error("Файл слишком большой (максимум 5 МБ)");
  }

  const ext =
    file.type === "image/jpeg" ? "jpg" : file.type === "image/png" ? "png" : "webp";
  const filename = `${randomUUID()}.${ext}`;
  const dir = getTaskImagesDir();

  await mkdir(dir, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(dir, filename), buffer);

  return taskImagePublicUrl(filename);
}

export async function copyLegacyTaskImage(
  legacyRelativePath: string,
  legacyUploadsDir: string,
): Promise<string | null> {
  const basename = path.basename(legacyRelativePath.replace(/^uploads\/tasks\//, ""));
  const sourcePath = path.join(legacyUploadsDir, basename);

  try {
    const { readFile } = await import("fs/promises");
    const buffer = await readFile(sourcePath);
    const ext = path.extname(basename).slice(1).toLowerCase() || "png";
    const filename = `${randomUUID()}.${ext}`;
    const dir = getTaskImagesDir();

    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, filename), buffer);

    return taskImagePublicUrl(filename);
  } catch {
    return null;
  }
}
