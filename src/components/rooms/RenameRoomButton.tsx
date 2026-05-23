"use client";

import { useState } from "react";
import { RenameRoomModal } from "@/components/rooms/RenameRoomModal";

type RenameRoomButtonProps = {
  locale: string;
  roomId: string;
  title: string;
  description: string | null;
};

export function RenameRoomButton({ locale, roomId, title, description }: RenameRoomButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-4 inline-flex touch-target items-center gap-2 rounded-full border border-[var(--card-border)] bg-[var(--background-soft)] px-4 py-2 text-sm font-semibold text-[var(--foreground-strong)] transition-colors hover:border-[var(--accent)]/40 hover:text-[var(--accent)]"
      >
        Изменить название
      </button>
      <RenameRoomModal
        locale={locale}
        roomId={roomId}
        initialTitle={title}
        initialDescription={description}
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
