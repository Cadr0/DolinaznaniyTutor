import { setRequestLocale } from "next-intl/server";
import { AppSectionPage } from "@/components/app/AppSectionPage";

type Props = { params: Promise<{ locale: string }> };

export default async function HomeworkPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <AppSectionPage
      eyebrow="Домашняя работа"
      title="Домашняя работа"
      description="Сроки сдачи, черновики и отправленные работы будут собраны здесь."
    />
  );
}
