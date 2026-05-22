import { setRequestLocale } from "next-intl/server";
import { requireSession } from "@/lib/session";

type Props = { params: Promise<{ locale: string }> };

export const dynamic = "force-dynamic";

export default async function DashboardPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const session = await requireSession(locale);
  const isTutor = session.user.role === "TUTOR";

  return (
    <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <div className="rounded-[2rem] border border-[var(--card-border)] bg-white p-5 shadow-[var(--shadow-card)] sm:p-8">
        <span className="rounded-full bg-[var(--accent-soft)] px-4 py-1.5 text-sm font-semibold text-[var(--accent)]">
          {isTutor ? "Кабинет учителя" : "Кабинет ученика"}
        </span>
        <h1 className="mt-4 font-display text-3xl text-[var(--foreground-strong)]">
          Добро пожаловать, {session.user.name}
        </h1>
        <p className="mt-3 max-w-2xl text-[var(--muted)]">
          {isTutor
            ? "Здесь вы будете вести учеников, комнаты и проверку домашних работ."
            : "Здесь будут ваши задания, домашняя работа и прогресс по предметам."}
        </p>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {isTutor ? (
            <>
              <OverviewCard title="Ученики" text="Список учеников появится после этапа комнат." />
              <OverviewCard title="Комнаты" text="Учебные комнаты и приглашения." />
              <OverviewCard title="Проверка" text="Домашние работы на проверке." />
              <OverviewCard title="Материалы" text="Ваши материалы для занятий." />
            </>
          ) : (
            <>
              <OverviewCard title="Задания" text="Новые задания от учителя." />
              <OverviewCard title="Домашняя работа" text="Что нужно сдать и когда." />
              <OverviewCard title="Комнаты" text="Ваши учебные комнаты." />
              <OverviewCard title="Прогресс" text="Как вы двигаетесь по предметам." />
            </>
          )}
        </div>
      </div>
    </section>
  );
}

function OverviewCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-[1.5rem] border border-[var(--card-border)] bg-[var(--background)] p-5">
      <h2 className="font-display text-xl text-[var(--foreground-strong)]">{title}</h2>
      <p className="mt-2 text-sm text-[var(--muted)]">{text}</p>
    </div>
  );
}
