"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { copyMarketplaceTopicToRoom } from "@/app/[locale]/(app)/dashboard/marketplace/actions";
import { RoomDialog } from "@/components/rooms/RoomDialog";

type RoomOption = {
  id: string;
  title: string;
};

type CopyToRoomModalProps = {
  locale: string;
  topicId: string;
  topicTitle: string;
  rooms: RoomOption[];
  preselectedRoomId?: string | null;
};

export function CopyToRoomModal({
  locale,
  topicId,
  topicTitle,
  rooms,
  preselectedRoomId,
}: CopyToRoomModalProps) {
  const [open, setOpen] = useState(Boolean(preselectedRoomId));
  const [pending, setPending] = useState(false);
  const router = useRouter();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);

    const formData = new FormData(event.currentTarget);
    const roomId = String(formData.get("roomId") ?? "");

    try {
      await copyMarketplaceTopicToRoom(locale, topicId, roomId);
    } catch {
      setPending(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="touch-target rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--accent-hover)]"
      >
        Добавить в комнату
      </button>

      <RoomDialog
        open={open}
        title="Добавить в комнату"
        zIndexClass="z-[60]"
        onClose={() => setOpen(false)}
      >
        <p className="-mt-2 mb-4 text-sm text-[var(--muted)]">
          Тема «{topicTitle}» будет скопирована в выбранную комнату.
        </p>
        {rooms.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">
            Сначала создайте комнату в разделе «Комнаты».
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="grid gap-4">
            <label className="block text-sm font-semibold text-[var(--foreground-strong)]">
              Комната
              <select
                name="roomId"
                required
                defaultValue={preselectedRoomId ?? rooms[0]?.id}
                className="touch-target mt-2 w-full rounded-2xl border-2 border-[var(--card-border)] px-4 py-3 text-base font-normal outline-none focus:border-[var(--accent)]"
              >
                {rooms.map((room) => (
                  <option key={room.id} value={room.id}>
                    {room.title}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="submit"
              disabled={pending}
              className="touch-target rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white hover:bg-[var(--accent-hover)] disabled:opacity-60"
            >
              {pending ? "Копируем…" : "Добавить"}
            </button>
          </form>
        )}
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            router.refresh();
          }}
          className="mt-3 text-sm text-[var(--muted)] hover:underline"
        >
          Отмена
        </button>
      </RoomDialog>
    </>
  );
}
