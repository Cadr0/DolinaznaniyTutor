import { setRequestLocale } from "next-intl/server";

type Props = { params: Promise<{ locale: string }> };

export default async function PrivacyPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <LegalPage
      title="Политика обработки персональных данных"
      items={[
        "Мы используем почту для регистрации, входа, восстановления пароля и сервисных уведомлений.",
        "Профильные данные нужны для работы кабинета ученика или учителя.",
        "Данные не публикуются без действия пользователя и не передаются третьим лицам, кроме инфраструктурных сервисов: хостинг, база данных и SMTP.",
        "Пользователь может запросить удаление аккаунта и данных через контакт владельца платформы.",
      ]}
    />
  );
}

function LegalPage({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="rounded-[2rem] border border-[var(--card-border)] bg-white p-5 shadow-[var(--shadow-card)] sm:p-8">
        <h1 className="font-display text-3xl text-[var(--foreground-strong)]">{title}</h1>
        <p className="mt-3 text-[var(--muted)]">
          Минимальная редакция для запуска регистрации. Документ будет расширен перед публичным
          масштабированием платформы.
        </p>
        <ul className="mt-6 space-y-3 text-[var(--foreground)]">
          {items.map((item) => (
            <li key={item} className="rounded-2xl bg-[var(--background)] p-4">
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
