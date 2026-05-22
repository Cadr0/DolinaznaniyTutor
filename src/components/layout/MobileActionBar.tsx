"use client";

import { useTranslations } from "next-intl";
import { ButtonLink } from "@/components/ui/Button";

export function MobileActionBar() {
  const t = useTranslations("nav");

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-[var(--card-border)] bg-white/95 p-3 shadow-[0_-4px_24px_rgba(42,62,71,0.08)] backdrop-blur-sm sm:hidden pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <ButtonLink href="/" className="w-full">
        {t("start")}
      </ButtonLink>
    </div>
  );
}
