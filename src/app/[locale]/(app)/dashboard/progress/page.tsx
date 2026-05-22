import { setRequestLocale } from "next-intl/server";
import { AppSectionPage } from "@/components/app/AppSectionPage";

type Props = { params: Promise<{ locale: string }> };

export default async function ProgressPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <AppSectionPage
      eyebrow="Прогресс"
      title="Ваш прогресс"
      description="Оценки, выполненные темы и динамика по предметам."
    />
  );
}
