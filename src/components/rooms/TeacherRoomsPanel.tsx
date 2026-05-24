"use client";

import { CreateRoomModal } from "@/components/rooms/CreateRoomModal";
import { RoomStudentsDrawer } from "@/components/rooms/RoomStudentsDrawer";
import { TeacherRoomCard, type TeacherRoomSummary } from "@/components/rooms/TeacherRoomCard";
import type { TeacherStudent } from "@/lib/rooms";

type TeacherRoomsPanelProps = {
  locale: string;
  rooms: TeacherRoomSummary[];
  students: TeacherStudent[];
};

export function TeacherRoomsPanel({ locale, rooms, students }: TeacherRoomsPanelProps) {
  return (
    <div className="flex min-h-[min(72vh,52rem)] flex-col rounded-[2rem] border border-[var(--card-border)] bg-white p-5 shadow-[var(--shadow-card)] sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <span className="rounded-full bg-[var(--accent-soft)] px-4 py-1.5 text-sm font-semibold text-[var(--accent)]">
            Комнаты
          </span>
          <h1 className="mt-4 font-display text-3xl text-[var(--foreground-strong)] sm:text-4xl">
            Мои учебные комнаты
          </h1>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <RoomStudentsDrawer students={students} />
        </div>
      </div>

      <div className="mt-6 flex-1 sm:mt-8">
        {rooms.length === 0 ? (
          <div className="flex h-full min-h-[16rem] flex-col items-center justify-center gap-4 rounded-[1.5rem] border border-dashed border-[var(--card-border)] bg-[var(--background)] px-6 py-12 text-center">
            <p className="text-sm text-[var(--muted)]">
              Пока нет комнат. Создайте первую комнату для учеников.
            </p>
            <CreateRoomModal locale={locale} />
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {rooms.map((room) => (
              <TeacherRoomCard key={room.id} locale={locale} room={room} />
            ))}
            <CreateRoomModal locale={locale} variant="card" />
          </div>
        )}
      </div>
    </div>
  );
}
