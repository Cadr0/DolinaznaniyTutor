import { setRequestLocale } from "next-intl/server";
import { Hero } from "@/components/landing/Hero";
import { ValuesSection } from "@/components/landing/ValuesSection";
import { Features } from "@/components/landing/Features";
import { BenefitsSection } from "@/components/landing/BenefitsSection";
import { CtaSection } from "@/components/landing/CtaSection";

type Props = { params: Promise<{ locale: string }> };

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <Hero />
      <ValuesSection />
      <Features />
      <BenefitsSection />
      <CtaSection />
    </>
  );
}
