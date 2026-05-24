import { setRequestLocale } from "next-intl/server";
import { StudentDashboardHome } from "@/components/dashboard/StudentDashboardHome";
import { TutorDashboardHome } from "@/components/dashboard/TutorDashboardHome";
import { getTutorDashboardStats } from "@/lib/tutor-dashboard";
import { requireSession } from "@/lib/session";

type Props = { params: Promise<{ locale: string }> };

export const dynamic = "force-dynamic";

export default async function DashboardPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const session = await requireSession(locale);
  const isTutor = session.user.role === "TUTOR";

  if (isTutor) {
    const stats = await getTutorDashboardStats(session.user.id);
    return <TutorDashboardHome stats={stats} userName={session.user.name} />;
  }

  return <StudentDashboardHome userName={session.user.name} />;
}
