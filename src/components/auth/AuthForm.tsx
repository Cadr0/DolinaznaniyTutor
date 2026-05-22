"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/Button";

type Role = "STUDENT" | "TUTOR";
type Mode = "login" | "register" | "forgot";
type Step = "credentials" | "code" | "reset";

type AuthFormProps = {
  mode: Mode;
  initialRole?: Role;
  inviteRoomTitle?: string;
  lockRole?: boolean;
  inviteInvalid?: boolean;
};

async function postAuth<T>(path: string, body: Record<string, unknown>) {
  const response = await fetch(`/api/auth${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const payload = (await response.json().catch(() => ({}))) as T & {
    message?: string;
    error?: { message?: string };
  };

  if (!response.ok) {
    throw new Error(payload.error?.message ?? payload.message ?? "Request failed");
  }

  return payload;
}

export function AuthForm({
  mode,
  initialRole = "STUDENT",
  inviteRoomTitle,
  lockRole = false,
  inviteInvalid = false,
}: AuthFormProps) {
  const t = useTranslations("auth");
  const locale = useLocale();
  const router = useRouter();
  const [role, setRole] = useState<Role>(initialRole);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordRepeat, setPasswordRepeat] = useState("");
  const [otp, setOtp] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [step, setStep] = useState<Step>(mode === "forgot" ? "reset" : "credentials");
  const [resetCodeSent, setResetCodeSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const title = useMemo(() => {
    if (mode === "register") return t("registerTitle");
    if (mode === "forgot") return t("forgotTitle");
    return t("loginTitle");
  }, [mode, t]);

  async function goAfterAuth() {
    const response = await fetch("/api/rooms/join-pending", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locale }),
    });
    const payload = (await response.json().catch(() => ({}))) as { redirectTo?: string };
    router.push(payload.redirectTo ?? "/dashboard");
  }

  async function handleCredentialsSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "register") {
        await postAuth("/sign-up/email", {
          email,
          password,
          name: email.split("@")[0],
          role,
        });
        setStep("code");
        return;
      }

      await postAuth("/sign-in/email", {
        email,
        password,
        rememberMe,
      });
      await goAfterAuth();
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : t("genericError"));
    } finally {
      setLoading(false);
    }
  }

  async function handleCodeSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await postAuth("/email-otp/verify-email", { email, otp });
      await postAuth("/sign-in/email", {
        email,
        password,
        rememberMe,
      });
      await goAfterAuth();
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : t("genericError"));
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!resetCodeSent) {
        await postAuth("/email-otp/request-password-reset", { email });
        setResetCodeSent(true);
        return;
      }

      if (password !== passwordRepeat) {
        throw new Error(t("passwordMismatch"));
      }

      await postAuth("/email-otp/reset-password", {
        email,
        otp: otp.trim(),
        password,
      });
      await postAuth("/sign-in/email", {
        email,
        password,
        rememberMe: true,
      });
      await goAfterAuth();
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : t("genericError"));
    } finally {
      setLoading(false);
    }
  }

  if (mode === "forgot") {
    return (
      <AuthShell title={title} subtitle={t("forgotSubtitle")} error={error}>
        <form className="space-y-4" onSubmit={handleForgotSubmit}>
          <EmailInput value={email} onChange={setEmail} label={t("email")} />
          {resetCodeSent ? (
            <>
              <CodeInput value={otp} onChange={setOtp} label={t("code")} />
              <PasswordInput value={password} onChange={setPassword} label={t("newPassword")} />
              <PasswordInput
                value={passwordRepeat}
                onChange={setPasswordRepeat}
                label={t("repeatPassword")}
              />
            </>
          ) : null}
          <Button className="w-full" disabled={loading || !email}>
            {resetCodeSent ? t("saveNewPassword") : t("sendCode")}
          </Button>
        </form>
      </AuthShell>
    );
  }

  if (mode === "register" && step === "code") {
    return (
      <AuthShell title={t("codeTitle")} subtitle={t("codeSubtitle", { email })} error={error}>
        <form className="space-y-4" onSubmit={handleCodeSubmit}>
          <CodeInput value={otp} onChange={setOtp} label={t("code")} />
          <RememberMe checked={rememberMe} onChange={setRememberMe} label={t("rememberMe")} />
          <Button className="w-full" disabled={loading || otp.length !== 4}>
            {t("confirmAndEnter")}
          </Button>
        </form>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title={title}
      subtitle={mode === "register" ? t("registerSubtitle") : t("loginSubtitle")}
      error={error}
      inviteRoomTitle={mode === "register" ? inviteRoomTitle : undefined}
      inviteInvalid={mode === "register" ? inviteInvalid : false}
    >
      <form className="space-y-4" onSubmit={handleCredentialsSubmit}>
        {mode === "register" && !lockRole ? (
          <div className="grid grid-cols-2 gap-2 rounded-[1.5rem] bg-[var(--background-soft)] p-1">
            <RoleButton active={role === "STUDENT"} onClick={() => setRole("STUDENT")}>
              {t("studentRole")}
            </RoleButton>
            <RoleButton active={role === "TUTOR"} onClick={() => setRole("TUTOR")}>
              {t("tutorRole")}
            </RoleButton>
          </div>
        ) : null}
        {mode === "register" && lockRole ? (
          <div className="rounded-2xl bg-[var(--accent-soft)] px-4 py-3 text-sm font-semibold text-[var(--accent)]">
            Регистрация ученика{inviteRoomTitle ? `: ${inviteRoomTitle}` : ""}
          </div>
        ) : null}
        <EmailInput value={email} onChange={setEmail} label={t("email")} />
        <PasswordInput value={password} onChange={setPassword} label={t("password")} />
        <RememberMe checked={rememberMe} onChange={setRememberMe} label={t("rememberMe")} />
        {mode === "register" ? (
          <p className="text-xs leading-relaxed text-[var(--muted)]">
            {t.rich("policyNotice", {
              policy: (chunks) => (
                <Link className="text-[var(--accent)]" href="/privacy">
                  {chunks}
                </Link>
              ),
              terms: (chunks) => (
                <Link className="text-[var(--accent)]" href="/terms">
                  {chunks}
                </Link>
              ),
            })}
          </p>
        ) : null}
        <Button className="w-full" disabled={loading || !email || password.length < 8}>
          {mode === "register" ? t("registerButton") : t("loginButton")}
        </Button>
        {mode === "login" ? (
          <Link
            href="/forgot-password"
            className="block text-center text-sm font-semibold text-[var(--accent)]"
          >
            {t("forgotLink")}
          </Link>
        ) : null}
      </form>
    </AuthShell>
  );
}

function AuthShell({
  title,
  subtitle,
  error,
  inviteRoomTitle,
  inviteInvalid = false,
  children,
}: {
  title: string;
  subtitle: string;
  error: string;
  inviteRoomTitle?: string;
  inviteInvalid?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className="mx-auto flex min-h-[calc(100dvh-10rem)] max-w-6xl items-center px-4 py-8 sm:px-6">
      <div className="mx-auto w-full max-w-md rounded-[2rem] border border-[var(--card-border)] bg-white p-5 shadow-[var(--shadow-card)] sm:p-8">
        <h1 className="font-display text-3xl text-[var(--foreground-strong)]">{title}</h1>
        <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
          {inviteRoomTitle
            ? `После регистрации вы сразу попадёте в комнату «${inviteRoomTitle}».`
            : subtitle}
        </p>
        {error ? (
          <div className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        ) : null}
        {inviteInvalid ? (
          <div className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
            Ссылка-приглашение недействительна. Попросите учителя отправить новую.
          </div>
        ) : null}
        <div className="mt-6">{children}</div>
      </div>
    </section>
  );
}

function RoleButton({
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
      className={`touch-target rounded-full text-sm font-semibold transition-colors ${
        active ? "bg-white text-[var(--accent)] shadow-sm" : "text-[var(--muted)]"
      }`}
    >
      {children}
    </button>
  );
}

function EmailInput({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (value: string) => void;
  label: string;
}) {
  return (
    <label className="block text-sm font-semibold text-[var(--foreground-strong)]">
      {label}
      <input
        required
        type="email"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="touch-target mt-2 w-full rounded-2xl border-2 border-[var(--card-border)] px-4 text-base font-normal outline-none focus:border-[var(--accent)]"
        autoComplete="email"
      />
    </label>
  );
}

function PasswordInput({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (value: string) => void;
  label: string;
}) {
  return (
    <label className="block text-sm font-semibold text-[var(--foreground-strong)]">
      {label}
      <input
        required
        minLength={8}
        type="password"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="touch-target mt-2 w-full rounded-2xl border-2 border-[var(--card-border)] px-4 text-base font-normal outline-none focus:border-[var(--accent)]"
        autoComplete="current-password"
      />
    </label>
  );
}

function CodeInput({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (value: string) => void;
  label: string;
}) {
  return (
    <label className="block text-sm font-semibold text-[var(--foreground-strong)]">
      {label}
      <input
        required
        inputMode="numeric"
        pattern="[0-9]{4}"
        maxLength={4}
        value={value}
        onChange={(event) => onChange(event.target.value.replace(/\D/g, "").slice(0, 4))}
        className="touch-target mt-2 w-full rounded-2xl border-2 border-[var(--card-border)] px-4 text-center text-2xl font-bold tracking-[0.6em] text-[var(--foreground-strong)] outline-none focus:border-[var(--accent)]"
        autoComplete="one-time-code"
      />
    </label>
  );
}

function RememberMe({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex items-center gap-3 text-sm font-semibold text-[var(--foreground)]">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-5 w-5 rounded border-[var(--card-border)] accent-[var(--accent)]"
      />
      {label}
    </label>
  );
}
