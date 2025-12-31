"use client";

import { Header } from "@/components/layouts/Header";
import { HeroSection } from "@/components/layouts/HeroSection";
import { TrustedBySection } from "@/components/layouts/TrustedBySection";
import { FeaturesSection } from "@/components/layouts/FeaturesSection";
import { SolutionsSection } from "@/components/layouts/SolutionsSection";
import { VideoDemoSection } from "@/components/layouts/VideoDemoSection";
import { TestimonialsSection } from "@/components/layouts/TestimonialsSection";
import { FAQSection } from "@/components/layouts/FAQSection";
import { IntegrationSection } from "@/components/layouts/IntegrationSection";
import { CTASection } from "@/components/layouts/CTASection";
import { Footer } from "@/components/layouts/Footer";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-white dark:bg-background-dark">
      <Header />
      <HeroSection />
      <TrustedBySection />
      <FeaturesSection />
      <SolutionsSection />
      <VideoDemoSection />
      <TestimonialsSection />
      <FAQSection />
      <IntegrationSection />
      <CTASection />
      <Footer />
    </div>
  );
}
