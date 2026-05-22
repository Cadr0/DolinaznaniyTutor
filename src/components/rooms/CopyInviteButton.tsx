"use client";

import { useState } from "react";

export function CopyInviteButton({ inviteUrl }: { inviteUrl: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
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
