import { setRequestLocale } from "next-intl/server";
import { AppSectionPage } from "@/components/app/AppSectionPage";

type Props = { params: Promise<{ locale: string }> };

export default async function MaterialsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <AppSectionPage
      eyebrow="Материалы"
      title="Материалы"
      description="Ваши учебные материалы и заготовки для занятий."
    />
  );
}
