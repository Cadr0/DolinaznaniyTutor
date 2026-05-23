import { saveOnboarding } from "@/app/[locale]/(app)/dashboard/actions";

type OnboardingModalProps = {
  locale: string;
  userName: string;
  isTutor: boolean;
};

export function OnboardingModal({ locale, userName, isTutor }: OnboardingModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center dialog-scrim p-4 backdrop-blur-[2px] sm:items-center">
      <div
        className="w-full max-w-lg rounded-[2rem] border border-[var(--card-border)] bg-white p-5 shadow-[var(--shadow-card)] sm:p-8"
        role="dialog"
        aria-modal="true"
        aria-labelledby="onboarding-title"
      >
        <span className="rounded-full bg-[var(--accent-soft)] px-4 py-1.5 text-sm font-semibold text-[var(--accent)]">
          {isTutor ? "Профиль учителя" : "Профиль ученика"}
        </span>
        <h2
          id="onboarding-title"
          className="mt-4 font-display text-3xl text-[var(--foreground-strong)]"
        >
          Как к вам обращаться?
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
          Заполните короткую анкету — за кабинетом уже видна ваша рабочая зона.
        </p>

        <form action={saveOnboarding.bind(null, locale)} className="mt-8 grid gap-4">
          <label className="block text-sm font-semibold text-[var(--foreground-strong)]">
            Имя
            <input
              name="displayName"
              required
              defaultValue={userName}
              className="touch-target mt-2 w-full rounded-2xl border-2 border-[var(--card-border)] px-4 text-base font-normal outline-none focus:border-[var(--accent)]"
            />
          </label>

          {isTutor ? (
            <label className="block text-sm font-semibold text-[var(--foreground-strong)]">
              Предметы
              <input
                name="subjects"
                placeholder="Математика, физика"
                className="touch-target mt-2 w-full rounded-2xl border-2 border-[var(--card-border)] px-4 text-base font-normal outline-none focus:border-[var(--accent)]"
              />
            </label>
          ) : null}

          <button className="touch-target mt-2 rounded-full bg-[var(--accent)] px-6 text-base font-semibold text-white shadow-[var(--shadow-soft)] transition-colors hover:bg-[var(--accent-hover)]">
            Перейти в кабинет
          </button>
        </form>
      </div>
    </div>
  );
}
