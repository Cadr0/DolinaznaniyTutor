import { getAppNav } from "@/lib/app-nav";
import { requireSession } from "@/lib/session";
import { AppMobileHeader } from "@/components/app/AppMobileHeader";
import { AppMobileNav } from "@/components/app/AppMobileNav";
import { AppSidebar } from "@/components/app/AppSidebar";
import { OnboardingModal } from "@/components/app/OnboardingModal";

type AppShellProps = {
  locale: string;
  children: React.ReactNode;
};

export async function AppShell({ locale, children }: AppShellProps) {
  const session = await requireSession(locale);
  const nav = getAppNav(session.user.role);
  const isTutor = session.user.role === "TUTOR";
  const needsOnboarding = !session.user.onboardingCompletedAt;

  return (
    <div
      className={`flex min-h-dvh flex-1 flex-col sm:flex-row ${
        isTutor ? "bg-[var(--background)]" : "bg-[var(--background-soft)]"
      }`}
    >
      <AppSidebar
        nav={nav}
        userName={session.user.name}
        userRole={session.user.role ?? "STUDENT"}
      />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <AppMobileHeader
          userName={session.user.name}
          userRole={session.user.role ?? "STUDENT"}
        />

        <div
          className={`relative flex-1 overflow-y-auto pb-[calc(4.5rem+env(safe-area-inset-bottom))] sm:pb-0 ${
            needsOnboarding ? "pointer-events-none select-none" : ""
          }`}
        >
          {needsOnboarding ? (
            <div className="absolute inset-0 z-10 bg-white/40 backdrop-blur-[1px]" aria-hidden />
          ) : null}
          {children}
        </div>

        <AppMobileNav nav={nav} />
      </div>

      {needsOnboarding ? (
        <OnboardingModal
          locale={locale}
          userName={session.user.name}
          isTutor={isTutor}
        />
      ) : null}
    </div>
  );
}
