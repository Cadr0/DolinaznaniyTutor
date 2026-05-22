import { setRequestLocale } from "next-intl/server";
import { saveOnboarding } from "./actions";
import { requireSession } from "@/lib/session";

type Props = { params: Promise<{ locale: string }> };

export const dynamic = "force-dynamic";

export default async function OnboardingPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const session = await requireSession(locale);
  const isTutor = session.user.role === "TUTOR";

  return (
    <section className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="rounded-[2rem] border border-[var(--card-border)] bg-white p-5 shadow-[var(--shadow-card)] sm:p-8">
        <span className="rounded-full bg-[var(--accent-soft)] px-4 py-1.5 text-sm font-semibold text-[var(--accent)]">
          {isTutor ? "Анкета учителя" : "Анкета ученика"}
        </span>
        <h1 className="mt-4 font-display text-3xl text-[var(--foreground-strong)]">
          Расскажите немного о себе
        </h1>
        <p className="mt-2 text-[var(--muted)]">
          Это обязательный первый шаг после подтверждения почты. Потом эти данные можно будет
          изменить в настройках.
        </p>

        <form action={saveOnboarding.bind(null, locale)} className="mt-8 grid gap-4">
          <Field name="displayName" label="Имя и фамилия" required defaultValue={session.user.name} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field name="phone" label="Телефон (необязательно)" />
            <Field name="city" label="Город" />
          </div>
          <Field name="timeZone" label="Часовой пояс" placeholder="Например, Москва" />

          {isTutor ? (
            <>
              <Field name="subjects" label="Предметы через запятую" placeholder="Математика, физика" />
              <Field name="experience" label="Опыт" placeholder="Например, 5 лет" />
              <TextArea name="bio" label="Коротко о подходе к обучению" />
            </>
          ) : (
            <>
              <Field name="gradeLevel" label="Класс или уровень" placeholder="Например, 8 класс" />
              <TextArea name="learningGoal" label="Цель обучения" />
            </>
          )}

          <button className="touch-target mt-2 rounded-full bg-[var(--accent)] px-6 text-base font-semibold text-white shadow-[var(--shadow-soft)] transition-colors hover:bg-[var(--accent-hover)]">
            Сохранить и перейти в кабинет
          </button>
        </form>
      </div>
    </section>
  );
}

function Field({
  name,
  label,
  required,
  defaultValue,
  placeholder,
}: {
  name: string;
  label: string;
  required?: boolean;
  defaultValue?: string;
  placeholder?: string;
}) {
  return (
    <label className="block text-sm font-semibold text-[var(--foreground-strong)]">
      {label}
      <input
        name={name}
        required={required}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="touch-target mt-2 w-full rounded-2xl border-2 border-[var(--card-border)] px-4 text-base font-normal outline-none focus:border-[var(--accent)]"
      />
    </label>
  );
}

function TextArea({ name, label }: { name: string; label: string }) {
  return (
    <label className="block text-sm font-semibold text-[var(--foreground-strong)]">
      {label}
      <textarea
        name={name}
        rows={4}
        className="mt-2 w-full rounded-2xl border-2 border-[var(--card-border)] px-4 py-3 text-base font-normal outline-none focus:border-[var(--accent)]"
      />
    </label>
  );
}
