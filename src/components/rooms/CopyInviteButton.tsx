"use client";

import { useState } from "react";

type CopyInviteButtonProps = {
  inviteUrl: string;
  variant?: "default" | "compact";
};

function LinkIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M10 13a5 5 0 0 0 7.07 0l2.12-2.12a5 5 0 0 0-7.07-7.07L11 4.93"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M14 11a5 5 0 0 0-7.07 0L4.81 13.12a5 5 0 0 0 7.07 7.07L13 20.07"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function CopyInviteButton({ inviteUrl, variant = "default" }: CopyInviteButtonProps) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  }

  async function handleInviteClick() {
    setExpanded(true);
    await handleCopy();
  }

  if (variant === "compact") {
    return (
      <div className="relative flex shrink-0 flex-col items-end">
        <button
          type="button"
          onClick={() => void handleInviteClick()}
          className={`touch-target inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-semibold transition-colors ${
            copied
              ? "border-[var(--accent)]/30 bg-[var(--accent-soft)] text-[var(--accent)]"
              : "border-[var(--card-border)] bg-white text-[var(--foreground-strong)] hover:border-[var(--accent)] hover:bg-[var(--accent-soft)] hover:text-[var(--accent)]"
          }`}
        >
          <LinkIcon />
          <span>{copied ? "Скопировано" : "Пригласить учеников"}</span>
        </button>

        {expanded ? (
          <div className="absolute right-0 top-full z-10 mt-2 w-[min(20rem,calc(100vw-2rem))] rounded-2xl border border-[var(--card-border)] bg-white p-4 shadow-[var(--shadow-card)]">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
              Ссылка-приглашение
            </p>
            <p className="mt-2 break-all text-sm text-[var(--foreground-strong)]">{inviteUrl}</p>
            <p className="mt-2 text-xs text-[var(--accent)]">
              {copied ? "Ссылка скопирована в буфер обмена" : "Нажмите ещё раз, чтобы скопировать"}
            </p>
            <button
              type="button"
              onClick={() => void handleCopy()}
              className="touch-target mt-3 rounded-full bg-[var(--accent)] px-4 py-2 text-xs font-semibold text-white hover:bg-[var(--accent-hover)]"
            >
              {copied ? "Скопировано ✓" : "Скопировать снова"}
            </button>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--background)] p-4">
      <p className="text-sm font-semibold text-[var(--foreground-strong)]">Ссылка-приглашение</p>
      <p className="mt-2 break-all text-sm text-[var(--muted)]">{inviteUrl}</p>
      <button
        type="button"
        onClick={() => void handleCopy()}
        className="touch-target mt-3 rounded-full bg-[var(--accent)] px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[var(--accent-hover)]"
      >
        {copied ? "Скопировано" : "Скопировать ссылку"}
      </button>
    </div>
  );
}
