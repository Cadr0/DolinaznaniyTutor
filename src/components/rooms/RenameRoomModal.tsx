"use client";

import { useEffect, useState } from "react";
import { updateRoom } from "@/app/[locale]/(app)/dashboard/rooms/actions";
import { RoomDialog } from "@/components/rooms/RoomDialog";

type RenameRoomModalProps = {
  locale: string;
  roomId: string;
  initialTitle: string;
  initialDescription?: string | null;
  open: boolean;
  onClose: () => void;
};

export function RenameRoomModal({
  locale,
  roomId,
  initialTitle,
  initialDescription,
  open,
  onClose,
}: RenameRoomModalProps) {
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription ?? "");

  useEffect(() => {
    if (open) {
      setTitle(initialTitle);
      setDescription(initialDescription ?? "");
    }
  }, [open, initialTitle, initialDescription]);

  return (
    <RoomDialog open={open} title="Изменить комнату" onClose={onClose}>
      <form
        action={async (formData) => {
          await updateRoom(locale, roomId, formData);
          onClose();
        }}
        className="grid gap-4"
      >
        <label className="block text-sm font-semibold text-[var(--foreground-strong)]">
          Название
          <input
            name="title"
            required
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="touch-target mt-2 w-full rounded-2xl border-2 border-[var(--card-border)] px-4 text-base font-normal outline-none focus:border-[var(--accent)]"
          />
        </label>
        <label className="block text-sm font-semibold text-[var(--foreground-strong)]">
          Описание (необязательно)
          <textarea
            name="description"
            rows={3}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className="mt-2 w-full rounded-2xl border-2 border-[var(--card-border)] px-4 py-3 text-base font-normal outline-none focus:border-[var(--accent)]"
          />
        </label>
        <button
          type="submit"
          className="touch-target rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white hover:bg-[var(--accent-hover)]"
        >
          Сохранить
        </button>
      </form>
    </RoomDialog>
  );
}
