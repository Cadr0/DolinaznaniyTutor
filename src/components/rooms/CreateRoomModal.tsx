"use client";

import { useState } from "react";
import { createRoom } from "@/app/[locale]/(app)/dashboard/rooms/actions";
import { RoomDialog } from "@/components/rooms/RoomDialog";

type CreateRoomModalProps = {
  locale: string;
};

export function CreateRoomModal({ locale }: CreateRoomModalProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Добавить комнату"
        title="Добавить комнату"
        className="touch-target inline-flex h-11 w-11 items-center justify-center rounded-full bg-[var(--accent)] text-2xl font-light leading-none text-white shadow-[var(--shadow-soft)] transition-colors hover:bg-[var(--accent-hover)] sm:h-12 sm:w-12"
      >
        +
      </button>

      <RoomDialog open={open} title="Новая комната" onClose={() => setOpen(false)}>
        <p className="mb-5 text-sm leading-relaxed text-[var(--muted)]">
          Создайте комнату и отправьте ссылку ученикам.
        </p>
        <form
          action={async (formData) => {
            await createRoom(locale, formData);
            setOpen(false);
          }}
          className="grid gap-4"
        >
          <label className="block text-sm font-semibold text-[var(--foreground-strong)]">
            Название
            <input
              name="title"
              required
              autoFocus
              placeholder="Математика 8 класс"
              className="touch-target mt-2 w-full rounded-2xl border-2 border-[var(--card-border)] px-4 text-base font-normal outline-none focus:border-[var(--accent)]"
            />
          </label>
          <label className="block text-sm font-semibold text-[var(--foreground-strong)]">
            Описание (необязательно)
            <textarea
              name="description"
              rows={3}
              placeholder="Занятия по алгебре"
              className="mt-2 w-full rounded-2xl border-2 border-[var(--card-border)] px-4 py-3 text-base font-normal outline-none focus:border-[var(--accent)]"
            />
          </label>
          <button
            type="submit"
            className="touch-target rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white hover:bg-[var(--accent-hover)]"
          >
            Создать комнату
          </button>
        </form>
      </RoomDialog>
    </>
  );
}
