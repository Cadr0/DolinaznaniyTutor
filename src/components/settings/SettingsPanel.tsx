"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { Link } from "@/i18n/navigation";
import {
  deleteAccount,
  type DeleteAccountState,
} from "@/app/[locale]/(app)/dashboard/settings/actions";

type SettingsPanelProps = {
  locale: string;
  email: string;
  name: string;
  displayName: string | null;
  roleLabel: string;
};

type Tab = "profile" | "danger";

export function SettingsPanel({
  locale,
  email,
  name,
  displayName,
  roleLabel,
}: SettingsPanelProps) {
  const [tab, setTab] = useState<Tab>("profile");
  const [deleteState, deleteAction] = useActionState<DeleteAccountState, FormData>(
    deleteAccount,
    { error: "" },
  );

  return (
    <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <div className="rounded-[2rem] border border-[var(--card-border)] bg-white p-5 shadow-[var(--shadow-card)] sm:p-8">
        <span className="rounded-full bg-[var(--accent-soft)] px-4 py-1.5 text-sm font-semibold text-[var(--accent)]">
          Настройки
        </span>
        <h1 className="mt-4 font-display text-3xl text-[var(--foreground-strong)]">Профиль</h1>

        <div className="mt-6 flex gap-2 border-b border-[var(--card-border)]">
          <TabButton active={tab === "profile"} onClick={() => setTab("profile")}>
            Данные
          </TabButton>
          <TabButton active={tab === "danger"} onClick={() => setTab("danger")}>
            Удаление аккаунта
          </TabButton>
        </div>

        {tab === "profile" ? (
          <dl className="mt-6 grid gap-4 sm:grid-cols-2">
            <InfoItem label="Почта" value={email} />
            <InfoItem label="Роль" value={roleLabel} />
            <InfoItem label="Имя в профиле" value={displayName ?? name} />
            <InfoItem label="Имя в аккаунте" value={name} />
          </dl>
        ) : (
          <div className="mt-6 max-w-lg">
            <p className="text-sm leading-relaxed text-[var(--muted)]">
              Аккаунт и все связанные данные будут удалены без возможности восстановления:
              профиль, комнаты, участие в комнатах и сессии входа.
            </p>

            <form action={deleteAction} className="mt-6 grid gap-4">
              <input type="hidden" name="locale" value={locale} />
              <label className="block text-sm font-semibold text-[var(--foreground-strong)]">
                Текущий пароль
                <input
                  name="password"
                  type="password"
                  required
                  minLength={8}
                  autoComplete="current-password"
                  className="touch-target mt-2 w-full rounded-2xl border-2 border-[var(--card-border)] px-4 text-base font-normal outline-none focus:border-red-400"
                />
              </label>
              <label className="block text-sm font-semibold text-[var(--foreground-strong)]">
                Введите <span className="text-red-600">УДАЛИТЬ</span> для подтверждения
                <input
                  name="confirmText"
                  required
                  placeholder="УДАЛИТЬ"
                  className="touch-target mt-2 w-full rounded-2xl border-2 border-[var(--card-border)] px-4 text-base font-normal outline-none focus:border-red-400"
                />
              </label>

              {deleteState.error ? (
                <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
                  {deleteState.error}
                </p>
              ) : null}

              <DeleteSubmitButton />
            </form>

            <p className="mt-4 text-xs text-[var(--muted)]">
              После удаления можно зарегистрироваться снова с той же почтой.{" "}
              <Link href="/login" className="font-semibold text-[var(--accent)] hover:underline">
                Войти
              </Link>
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`touch-target border-b-2 px-4 py-2 text-sm font-semibold transition-colors ${
        active
          ? "border-[var(--accent)] text-[var(--accent)]"
          : "border-transparent text-[var(--muted)] hover:text-[var(--foreground-strong)]"
      }`}
    >
      {children}
    </button>
  );
}

function DeleteSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="touch-target rounded-full bg-red-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-60"
    >
      {pending ? "Удаляем…" : "Удалить аккаунт навсегда"}
    </button>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.25rem] border border-[var(--card-border)] bg-[var(--background)] p-4">
      <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">{label}</dt>
      <dd className="mt-1 text-sm font-semibold text-[var(--foreground-strong)]">{value}</dd>
    </div>
  );
}
