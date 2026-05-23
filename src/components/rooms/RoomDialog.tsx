"use client";

type RoomDialogProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  onBack?: () => void;
  maxWidthClass?: string;
  maxHeightClass?: string;
  children: React.ReactNode;
};

export function RoomDialog({
  open,
  title,
  onClose,
  onBack,
  maxWidthClass = "max-w-md",
  maxHeightClass = "max-h-[90dvh]",
  children,
}: RoomDialogProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-3 sm:items-center sm:p-6">
      <button
        type="button"
        aria-label="Закрыть"
        className="absolute inset-0 bg-[rgba(42,62,71,0.35)]"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="room-dialog-title"
        className={`relative flex w-full flex-col ${maxWidthClass} ${maxHeightClass} rounded-[2rem] border border-[var(--card-border)] bg-white p-5 shadow-[0_16px_48px_rgba(42,62,71,0.14)] sm:p-6`}
      >
        <div className="mb-5 flex shrink-0 items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-2">
            {onBack ? (
              <button
                type="button"
                onClick={onBack}
                className="touch-target shrink-0 rounded-full px-2 py-1 text-sm font-semibold text-[var(--muted)] hover:bg-[var(--background-soft)]"
                aria-label="Назад"
              >
                ←
              </button>
            ) : null}
            <h2
              id="room-dialog-title"
              className="font-display text-2xl text-[var(--foreground-strong)]"
            >
              {title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="touch-target shrink-0 rounded-full px-3 py-1 text-sm font-semibold text-[var(--muted)] hover:bg-[var(--background-soft)]"
          >
            Закрыть
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
