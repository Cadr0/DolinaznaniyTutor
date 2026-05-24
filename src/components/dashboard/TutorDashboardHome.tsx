import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { TutorDashboardStats } from "@/lib/tutor-dashboard";

type TutorDashboardHomeProps = {
  stats: TutorDashboardStats;
  userName: string;
};

export async function TutorDashboardHome({ stats, userName }: TutorDashboardHomeProps) {
  const t = await getTranslations("app.dashboardPage");

  const cards = [
    {
      title: t("roomsTitle"),
      text: t("roomsText", { count: stats.roomCount }),
      href: "/dashboard/rooms",
    },
    {
      title: t("studentsTitle"),
      text: t("studentsText", { count: stats.studentCount }),
      href: "/dashboard/students",
    },
    {
      title: t("reviewTitle"),
      text: t("reviewText", { count: stats.pendingReviewCount }),
      href: "/dashboard/review",
      highlight: stats.pendingReviewCount > 0,
    },
    {
      title: t("materialsTitle"),
      text: t("materialsText"),
      href: "/dashboard/materials",
    },
  ];

  return (
    <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <div className="rounded-[2rem] border border-[var(--card-border)] bg-white p-5 shadow-[var(--shadow-card)] sm:p-8">
        <span className="rounded-full bg-[var(--accent-soft)] px-4 py-1.5 text-sm font-semibold text-[var(--accent)]">
          {t("tutorEyebrow")}
        </span>
        <h1 className="mt-4 font-display text-3xl text-[var(--foreground-strong)]">
          {t("welcome", { name: userName })}
        </h1>
        <p className="mt-3 max-w-2xl text-[var(--muted)]">{t("tutorSubtitle")}</p>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {cards.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className={`rounded-[1.5rem] border p-5 transition-colors hover:border-[var(--accent)]/40 ${
                card.highlight
                  ? "border-amber-200 bg-amber-50"
                  : "border-[var(--card-border)] bg-[var(--background)]"
              }`}
            >
              <h2 className="font-display text-xl text-[var(--foreground-strong)]">{card.title}</h2>
              <p className="mt-2 text-sm text-[var(--muted)]">{card.text}</p>
              <span className="mt-3 inline-block text-sm font-semibold text-[var(--accent)]">
                {t("open")} →
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
