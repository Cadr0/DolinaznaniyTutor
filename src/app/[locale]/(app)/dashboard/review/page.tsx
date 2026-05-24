import { redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { ReviewQueue } from "@/components/homework/ReviewQueue";
import { getPendingImageReviews } from "@/lib/tutor-review";
import { localePath } from "@/lib/routes";
import { requireSession } from "@/lib/session";

type Props = { params: Promise<{ locale: string }> };

export const dynamic = "force-dynamic";

export default async function ReviewPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const session = await requireSession(locale);
  const t = await getTranslations("app.reviewPage");

  if (session.user.role !== "TUTOR") {
    redirect(localePath(locale, "/dashboard"));
  }

  const items = await getPendingImageReviews(session.user.id);

  return (
    <section className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8">
      <span className="rounded-full bg-[var(--accent-soft)] px-4 py-1.5 text-sm font-semibold text-[var(--accent)]">
        {t("eyebrow")}
      </span>
      <h1 className="mt-4 font-display text-3xl text-[var(--foreground-strong)]">{t("title")}</h1>
      <p className="mt-2 max-w-2xl text-[var(--muted)]">{t("description")}</p>
      <ReviewQueue locale={locale} items={items} />
    </section>
  );
}
