"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { AssignTopicModal } from "@/components/homework/AssignTopicModal";
import { StudentCardView } from "@/components/homework/StudentCardView";
import { RoomDialog } from "@/components/rooms/RoomDialog";
import { useTranslations } from "next-intl";

type StudentProgressPanelProps = {
  locale: string;
  roomId: string;
  student: {
    id: string;
    name: string;
    email: string;
  };
  roomOptions?: { roomId: string; roomTitle: string }[];
  open: boolean;
  onClose: () => void;
};

export function StudentProgressPanel({
  locale,
  roomId,
  student,
  roomOptions = [],
  open,
  onClose,
}: StudentProgressPanelProps) {
  const t = useTranslations("app.homeworkPage");
  const router = useRouter();
  const [assignOpen, setAssignOpen] = useState(false);
  const [activeRoomId, setActiveRoomId] = useState(roomId);

  return (
    <>
      <RoomDialog
        open={open && !assignOpen}
        title={t("studentProgress")}
        onClose={onClose}
        maxWidthClass="max-w-2xl"
        maxHeightClass="max-h-[92dvh]"
      >
        <StudentCardView
          locale={locale}
          studentId={student.id}
          studentName={student.name}
          studentEmail={student.email}
          roomId={roomId}
          roomOptions={roomOptions.length > 0 ? roomOptions : [{ roomId, roomTitle: "" }]}
          compact
          showFullPageLink
          assignHandledExternally
          onAssignOpenChange={(next) => {
            setAssignOpen(next);
            if (next) {
              setActiveRoomId(roomId);
            }
          }}
        />
      </RoomDialog>

      <AssignTopicModal
        locale={locale}
        roomId={activeRoomId}
        studentId={student.id}
        studentName={student.name}
        open={assignOpen}
        onClose={() => {
          setAssignOpen(false);
          router.refresh();
        }}
      />
    </>
  );
}
