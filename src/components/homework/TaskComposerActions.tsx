"use client";

type TaskComposerActionsProps = {
  submitLabel: string;
  skipLabel: string;
  pending: boolean;
  uploading: boolean;
  onSubmit: () => void;
  onSkip: () => void;
  layout?: "inline" | "footer";
};

function SendIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 19V5M12 5L6 11M12 5L18 11"
        stroke="currentColor"
        strokeWidth="2.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SkipIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6 8L10 12L6 16M12 8L16 12L12 16"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function TaskComposerActions({
  submitLabel,
  skipLabel,
  pending,
  uploading,
  onSubmit,
  onSkip,
  layout = "footer",
}: TaskComposerActionsProps) {
  const disabled = pending || uploading;

  return (
    <div
      className={
        layout === "inline"
          ? "flex shrink-0 items-center gap-1"
          : "mt-2 flex items-center justify-end gap-1.5"
      }
    >
      <button
        type="button"
        onClick={onSubmit}
        disabled={disabled}
        aria-label={submitLabel}
        title={submitLabel}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-white shadow-[var(--shadow-soft)] transition-colors hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-50"
      >
        <SendIcon />
      </button>
      <button
        type="button"
        onClick={onSkip}
        disabled={disabled}
        aria-label={skipLabel}
        title={skipLabel}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[var(--muted)] transition-colors hover:bg-[var(--background-soft)] hover:text-[var(--foreground-strong)] disabled:cursor-not-allowed disabled:opacity-50"
      >
        <SkipIcon />
      </button>
    </div>
  );
}
