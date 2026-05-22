import { setRequestLocale } from "next-intl/server";
import { AppSectionPage } from "@/components/app/AppSectionPage";

type Props = { params: Promise<{ locale: string }> };

export default async function StudentsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <AppSectionPage
      eyebrow="Ученики"
      title="Мои ученики"
      description="Список учеников, их комнаты и активность по заданиям."
    />
  );
}
