import { setRequestLocale } from "next-intl/server";
import { AppSectionPage } from "@/components/app/AppSectionPage";

type Props = { params: Promise<{ locale: string }> };

export default async function AssignmentsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <AppSectionPage
      eyebrow="Задания"
      title="Ваши задания"
      description="Здесь появится список заданий от учителя и статус выполнения."
    />
  );
}
