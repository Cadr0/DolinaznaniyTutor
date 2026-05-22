import { setRequestLocale } from "next-intl/server";
import { AppSectionPage } from "@/components/app/AppSectionPage";

type Props = { params: Promise<{ locale: string }> };

export default async function SettingsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <AppSectionPage
      eyebrow="Настройки"
      title="Настройки профиля"
      description="Имя, предметы, контакты и другие данные профиля."
    />
  );
}
