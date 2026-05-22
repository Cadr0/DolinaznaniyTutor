import { redirect } from "next/navigation";
import { localePath } from "@/lib/routes";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function OnboardingRedirectPage({ params }: Props) {
  const { locale } = await params;
  redirect(localePath(locale, "/dashboard"));
}
