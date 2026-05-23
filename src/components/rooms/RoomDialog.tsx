"use client";

type RoomDialogProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
};

export function RoomDialog({ open, title, onClose, children }: RoomDialogProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center sm:p-6">
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
        className="relative w-full max-w-md rounded-[2rem] border border-[var(--card-border)] bg-white p-5 shadow-[0_16px_48px_rgba(42,62,71,0.14)] sm:p-6"
      >
        <div className="mb-5 flex items-start justify-between gap-3">
          <h2
            id="room-dialog-title"
            className="font-display text-2xl text-[var(--foreground-strong)]"
          >
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="touch-target rounded-full px-3 py-1 text-sm font-semibold text-[var(--muted)] hover:bg-[var(--background-soft)]"
          >
            Закрыть
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
