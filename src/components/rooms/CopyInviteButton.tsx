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
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  if (variant === "compact") {
    return (
      <button
        type="button"
        onClick={handleCopy}
        title={copied ? "Ссылка скопирована" : "Скопировать ссылку-приглашение"}
        aria-label={copied ? "Ссылка скопирована" : "Скопировать ссылку-приглашение"}
        className={`inline-flex h-9 w-9 items-center justify-center rounded-xl border transition-colors ${
          copied
            ? "border-[var(--accent)]/30 bg-[var(--accent-soft)] text-[var(--accent)]"
            : "border-transparent text-[var(--muted)] hover:border-[var(--card-border)] hover:bg-[var(--background-soft)] hover:text-[var(--accent)]"
        }`}
      >
        <LinkIcon />
      </button>
    );
  }

  return (
    <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--background)] p-4">
      <p className="text-sm font-semibold text-[var(--foreground-strong)]">Ссылка-приглашение</p>
      <p className="mt-2 break-all text-sm text-[var(--muted)]">{inviteUrl}</p>
      <button
        type="button"
        onClick={handleCopy}
        className="touch-target mt-3 rounded-full bg-[var(--accent)] px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[var(--accent-hover)]"
      >
        {copied ? "Скопировано" : "Скопировать ссылку"}
      </button>
    </div>
  );
}
