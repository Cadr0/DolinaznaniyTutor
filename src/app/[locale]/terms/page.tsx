import { setRequestLocale } from "next-intl/server";

type Props = { params: Promise<{ locale: string }> };

export default async function TermsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <section className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="rounded-[2rem] border border-[var(--card-border)] bg-white p-5 shadow-[var(--shadow-card)] sm:p-8">
        <h1 className="font-display text-3xl text-[var(--foreground-strong)]">
          Пользовательское соглашение
        </h1>
        <p className="mt-3 text-[var(--muted)]">
          Минимальная редакция для запуска регистрации и тестирования личных кабинетов.
        </p>
        <div className="mt-6 space-y-3 text-[var(--foreground)]">
          <p className="rounded-2xl bg-[var(--background)] p-4">
            Платформа «Долина знаний» предназначена для организации обучения между учителями и
            учениками.
          </p>
          <p className="rounded-2xl bg-[var(--background)] p-4">
            Пользователь отвечает за достоверность данных профиля и безопасность доступа к своей
            почте и паролю.
          </p>
          <p className="rounded-2xl bg-[var(--background)] p-4">
            На этапе запуска часть разделов может быть доступна как заглушка до реализации комнат,
            заданий и приглашений.
          </p>
        </div>
      </div>
    </section>
  );
}
