"use client";

import { Header } from "@/components/layouts/Header";
import { HeroSection } from "@/components/layouts/HeroSection";
import { SocialProofSection } from "@/components/layouts/SocialProofSection";
import { FeaturesSection } from "@/components/layouts/FeaturesSection";
import { FeaturesWithMockupSection } from "@/components/layouts/FeaturesWithMockupSection";
import { QuoteSection } from "@/components/layouts/QuoteSection";
import { FAQSection } from "@/components/layouts/FAQSection";
import { MetricsSection } from "@/components/layouts/MetricsSection";
import { CTASection } from "@/components/layouts/CTASection";
import { Footer } from "@/components/layouts/Footer";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-white">
      <Header />
      <HeroSection />
      <div className="bg-white flex items-start justify-center relative w-full">
        <div className="h-px relative w-full max-w-[1280px]">
          <div className="h-px w-full bg-[#e9eaeb]" />
        </div>
      </div>
      <SocialProofSection />
      <div className="bg-white flex items-start justify-center relative w-full">
        <div className="h-px relative w-full max-w-[1280px]">
          <div className="h-px w-full bg-[#e9eaeb]" />
        </div>
      </div>
      <FeaturesSection />
      <QuoteSection />
      <FeaturesWithMockupSection />
      <div className="bg-white flex items-start justify-center relative w-full">
        <div className="h-px relative w-full max-w-[1280px]">
          <div className="h-px w-full bg-[#e9eaeb]" />
        </div>
      </div>
      <div className="bg-white flex items-start justify-center relative w-full">
        <div className="h-px relative w-full max-w-[1280px]">
          <div className="h-px w-full bg-[#e9eaeb]" />
        </div>
      </div>
      <FAQSection />
      <CTASection />
      <Footer />
    </div>
  );
}
