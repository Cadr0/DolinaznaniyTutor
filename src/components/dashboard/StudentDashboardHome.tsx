import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

type StudentDashboardHomeProps = {
  userName: string;
};

export async function StudentDashboardHome({ userName }: StudentDashboardHomeProps) {
  const t = await getTranslations("app.dashboardPage");

  const cards = [
    { title: t("studentHomeworkTitle"), text: t("studentHomeworkText"), href: "/dashboard/homework" },
    { title: t("studentAssignmentsTitle"), text: t("studentAssignmentsText"), href: "/dashboard/assignments" },
    { title: t("studentRoomsTitle"), text: t("studentRoomsText"), href: "/dashboard/rooms" },
    { title: t("studentProgressTitle"), text: t("studentProgressText"), href: "/dashboard/progress" },
  ];

  return (
    <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <div className="rounded-[2rem] border border-[var(--card-border)] bg-white p-5 shadow-[var(--shadow-card)] sm:p-8">
        <span className="rounded-full bg-[var(--accent-soft)] px-4 py-1.5 text-sm font-semibold text-[var(--accent)]">
          {t("studentEyebrow")}
        </span>
        <h1 className="mt-4 font-display text-3xl text-[var(--foreground-strong)]">
          {t("welcome", { name: userName })}
        </h1>
        <p className="mt-3 max-w-2xl text-[var(--muted)]">{t("studentSubtitle")}</p>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {cards.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="rounded-[1.5rem] border border-[var(--card-border)] bg-[var(--background)] p-5 transition-colors hover:border-[var(--accent)]/40"
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
