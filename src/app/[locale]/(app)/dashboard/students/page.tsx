import { redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { StudentsList } from "@/components/students/StudentsList";
import { getTeacherStudentsOverview } from "@/lib/student-assignments";
import { localePath } from "@/lib/routes";
import { requireSession } from "@/lib/session";

type Props = { params: Promise<{ locale: string }> };

export const dynamic = "force-dynamic";

export default async function StudentsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const session = await requireSession(locale);
  const t = await getTranslations("app.studentsPage");

  if (session.user.role !== "TUTOR") {
    redirect(localePath(locale, "/dashboard"));
  }

  const students = await getTeacherStudentsOverview(session.user.id);

  return (
    <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <span className="rounded-full bg-[var(--accent-soft)] px-4 py-1.5 text-sm font-semibold text-[var(--accent)]">
        {t("eyebrow")}
      </span>
      <h1 className="mt-4 font-display text-3xl text-[var(--foreground-strong)]">{t("title")}</h1>
      <p className="mt-2 max-w-2xl text-[var(--muted)]">{t("description")}</p>
      <StudentsList students={students} />
    </section>
  );
}
