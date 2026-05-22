import { setRequestLocale } from "next-intl/server";
import { AuthForm } from "@/components/auth/AuthForm";

type Role = "STUDENT" | "TUTOR";
type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ role?: string }>;
};

export default async function RegisterPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { role } = await searchParams;
  setRequestLocale(locale);

  const initialRole: Role = role === "teacher" || role === "tutor" ? "TUTOR" : "STUDENT";

  return <AuthForm mode="register" initialRole={initialRole} />;
}
