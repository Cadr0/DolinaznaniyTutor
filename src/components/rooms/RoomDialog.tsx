"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { lockPageScroll } from "@/lib/scroll-lock";

type RoomDialogProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  onBack?: () => void;
  onBackdropClick?: () => void;
  maxWidthClass?: string;
  maxHeightClass?: string;
  zIndexClass?: string;
  sheetOnMobile?: boolean;
  children: React.ReactNode;
};

export function RoomDialog({
  open,
  title,
  onClose,
  onBack,
  onBackdropClick,
  maxWidthClass = "max-w-md",
  maxHeightClass = "max-h-[90dvh]",
  zIndexClass = "z-50",
  sheetOnMobile = false,
  children,
}: RoomDialogProps) {
  useEffect(() => {
    if (!open) {
      return;
    }

    return lockPageScroll();
  }, [open]);

  if (!open || typeof document === "undefined") {
    return null;
  }

  function handleBackdropClick() {
    if (onBackdropClick) {
      onBackdropClick();
      return;
    }

    onClose();
  }

  return createPortal(
    <div
      className={`fixed inset-0 ${zIndexClass} flex items-end justify-center sm:items-center ${sheetOnMobile ? "p-0 sm:p-6" : "p-3 sm:p-6"}`}
    >
      <button
        type="button"
        aria-label="Закрыть"
        className="dialog-scrim absolute inset-0 backdrop-blur-[2px]"
        onClick={handleBackdropClick}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="room-dialog-title"
        className={`relative z-10 flex w-full flex-col ${maxWidthClass} ${maxHeightClass} border border-[var(--card-border)] bg-white shadow-[0_16px_48px_rgba(42,62,71,0.14)] ${
          sheetOnMobile
            ? "rounded-t-[2rem] rounded-b-none p-4 sm:rounded-[2rem] sm:p-6"
            : "rounded-[2rem] p-5 sm:p-6"
        }`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex shrink-0 items-start justify-between gap-3 sm:mb-5">
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
              className="font-display text-xl text-[var(--foreground-strong)] sm:text-2xl"
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
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain py-0.5">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
