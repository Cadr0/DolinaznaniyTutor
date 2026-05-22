import { setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { localePath } from "@/lib/routes";
import { requireSession } from "@/lib/session";

type Props = { params: Promise<{ locale: string }> };

export const dynamic = "force-dynamic";

export default async function DashboardPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const session = await requireSession(locale);

  if (!session.user.onboardingCompletedAt) {
    redirect(localePath(locale, "/onboarding"));
  }

  const isTutor = session.user.role === "TUTOR";

  return (
    <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="grid gap-4 lg:grid-cols-[1fr_20rem]">
        <div className="rounded-[2rem] border border-[var(--card-border)] bg-white p-5 shadow-[var(--shadow-card)] sm:p-8">
          <span className="rounded-full bg-[var(--accent-soft)] px-4 py-1.5 text-sm font-semibold text-[var(--accent)]">
            {isTutor ? "Кабинет учителя" : "Кабинет ученика"}
          </span>
          <h1 className="mt-4 font-display text-3xl text-[var(--foreground-strong)]">
            Добро пожаловать, {session.user.name}
          </h1>
          <p className="mt-3 max-w-2xl text-[var(--muted)]">
            Регистрация работает. Следующий этап проекта добавит комнаты, приглашения и задания.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <PlaceholderCard
              title={isTutor ? "Мои ученики" : "Мои задания"}
              text={isTutor ? "Список учеников появится после этапа комнат." : "Задания появятся после приглашения в комнату."}
            />
            <PlaceholderCard
              title={isTutor ? "Комнаты" : "Прогресс"}
              text={isTutor ? "Здесь будут учебные комнаты и приглашения." : "Здесь будет виден прогресс по заданиям."}
            />
          </div>
        </div>

        <aside className="hidden rounded-[2rem] border border-[var(--card-border)] bg-white p-5 shadow-[var(--shadow-card)] lg:block">
          <h2 className="font-display text-xl text-[var(--foreground-strong)]">Настройки</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">
            На компьютере настройки находятся справа сверху, как привычный аккаунт-блок в
            маркетплейсах. На телефоне быстрый доступ вынесен вниз.
          </p>
        </aside>
      </div>
    </section>
  );
}

function PlaceholderCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-[1.5rem] border border-[var(--card-border)] bg-[var(--background)] p-5">
      <h2 className="font-display text-xl text-[var(--foreground-strong)]">{title}</h2>
      <p className="mt-2 text-sm text-[var(--muted)]">{text}</p>
    </div>
  );
}
