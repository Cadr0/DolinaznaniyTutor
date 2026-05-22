"use client";

import { useMobileAppBarVisible } from "@/components/layout/MobileActionBar";

export function Main({ children }: { children: React.ReactNode }) {
  const showMobileBar = useMobileAppBarVisible();

  return (
    <main className={`flex-1 ${showMobileBar ? "pb-20 sm:pb-0" : "pb-0"}`}>
      {children}
    </main>
  );
}
