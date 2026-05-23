import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { HomeworkHub } from "@/components/homework/HomeworkHub";
import { getStudentAssignments } from "@/lib/student-assignments";
import { requireSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { localePath } from "@/lib/routes";

type Props = { params: Promise<{ locale: string }> };

export const dynamic = "force-dynamic";

export default async function HomeworkPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const session = await requireSession(locale);
  const t = await getTranslations("app.homeworkPage");

  if (session.user.role !== "STUDENT") {
    redirect(localePath(locale, "/dashboard"));
  }

  const assignments = await getStudentAssignments(session.user.id);

  return (
    <section className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
      <p className="text-sm font-semibold uppercase tracking-wide text-[var(--accent)]">
        {t("eyebrow")}
      </p>
      <h1 className="mt-2 font-display text-3xl text-[var(--foreground-strong)]">{t("title")}</h1>
      <p className="mt-2 text-sm text-[var(--muted)]">{t("subtitle")}</p>
      <HomeworkHub assignments={assignments} />
    </section>
  );
}
