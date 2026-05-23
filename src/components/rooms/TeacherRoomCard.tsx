"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { RenameRoomModal } from "@/components/rooms/RenameRoomModal";

export type TeacherRoomSummary = {
  id: string;
  title: string;
  description: string | null;
  studentCount: number;
};

type TeacherRoomCardProps = {
  locale: string;
  room: TeacherRoomSummary;
};

function PencilIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0-3-3L5 17v3Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="m13.5 6.5 4 4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function TeacherRoomCard({ locale, room }: TeacherRoomCardProps) {
  const [renameOpen, setRenameOpen] = useState(false);

  return (
    <>
      <article className="flex min-h-[9.5rem] flex-col rounded-[1.5rem] border border-[var(--card-border)] bg-white p-5 shadow-[var(--shadow-card)] transition-colors hover:border-[var(--accent)]/40 sm:min-h-[10.5rem] sm:p-6">
        <div className="flex items-start justify-between gap-2">
          <Link href={`/dashboard/rooms/${room.id}`} className="min-w-0 flex-1">
            <h3 className="font-display text-xl text-[var(--foreground-strong)] sm:text-2xl">
              {room.title}
            </h3>
          </Link>
          <button
            type="button"
            aria-label={`Изменить «${room.title}»`}
            onClick={() => setRenameOpen(true)}
            className="touch-target inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-[var(--card-border)] text-[var(--muted)] transition-colors hover:border-[var(--accent)]/40 hover:bg-[var(--accent-soft)] hover:text-[var(--accent)]"
          >
            <PencilIcon />
          </button>
        </div>

        <Link href={`/dashboard/rooms/${room.id}`} className="mt-2 flex flex-1 flex-col">
          {room.description ? (
            <p className="text-sm leading-relaxed text-[var(--muted)]">{room.description}</p>
          ) : (
            <p className="text-sm text-[var(--muted)]/70">Без описания</p>
          )}
          <p className="mt-auto pt-4 text-xs font-semibold text-[var(--muted)]">
            {room.studentCount} учеников
          </p>
        </Link>
      </article>

      <RenameRoomModal
        locale={locale}
        roomId={room.id}
        initialTitle={room.title}
        initialDescription={room.description}
        open={renameOpen}
        onClose={() => setRenameOpen(false)}
      />
    </>
  );
}
