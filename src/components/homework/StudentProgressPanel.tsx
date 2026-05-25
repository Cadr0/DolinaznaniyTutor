"use client";

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

  return (
    <RoomDialog
      open={open}
      title={t("studentProgress")}
      onClose={onClose}
      maxWidthClass="max-w-full sm:max-w-4xl"
      maxHeightClass="max-h-[96dvh] min-h-[90dvh] sm:min-h-0 sm:max-h-[92dvh]"
      sheetOnMobile
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
      />
    </RoomDialog>
  );
}
